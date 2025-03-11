import sys
import json
import torch
import torchaudio
import os
import time
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from zonos.model import Zonos, DEFAULT_BACKBONE_CLS as ZonosBackbone
from zonos.conditioning import make_cond_dict, supported_language_codes
from torch.quantization import quantize_dynamic

# Global variables
CURRENT_MODEL_TYPE = None
CURRENT_MODEL = None
SPEAKER_EMBEDDING = None
SPEAKER_AUDIO_PATH = None
DEFAULT_DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
SAMPLES_PATH = os.environ.get('SAMPLES_PATH', '')

@dataclass
class ProjectSettings:
    name: str
    text: str
    voice: str
    voiceSettings: dict
    emotionSettings: dict
    outputSettings: dict
    created: float
    modified: float

@dataclass
class AppSettings:
    theme: str
    defaultVoice: str
    defaultOutputFormat: str
    projectsDirectory: str
    autoSave: bool

@dataclass
class HistoryEntry:
    id: str
    action: str
    timestamp: float
    details: str
    projectId: str
    reversible: bool
    data: Optional[dict] = None

class ProjectManager:
    def __init__(self):
        self.app_dir = Path.home() / '.voicepro'
        self.projects_dir = self.app_dir / 'projects'
        self.settings_file = self.app_dir / 'settings.json'
        self.history_file = self.app_dir / 'history.json'
        
        # Create directories if they don't exist
        self.app_dir.mkdir(exist_ok=True)
        self.projects_dir.mkdir(exist_ok=True)
        
        # Load or create settings
        self.settings = self._load_settings()
        self.history: List[HistoryEntry] = self._load_history()
        
    def _load_settings(self) -> AppSettings:
        if self.settings_file.exists():
            with open(self.settings_file) as f:
                data = json.load(f)
                return AppSettings(**data)
        return AppSettings(
            theme="system",
            defaultVoice="emma",
            defaultOutputFormat="mp3",
            projectsDirectory=str(self.projects_dir),
            autoSave=True
        )
    
    def _save_settings(self):
        with open(self.settings_file, 'w') as f:
            json.dump(asdict(self.settings), f)
    
    def _load_history(self) -> List[HistoryEntry]:
        if self.history_file.exists():
            with open(self.history_file) as f:
                data = json.load(f)
                return [HistoryEntry(**entry) for entry in data]
        return []
    
    def _save_history(self):
        with open(self.history_file, 'w') as f:
            json.dump([asdict(entry) for entry in self.history], f)
    
    def add_history_entry(self, entry: HistoryEntry):
        self.history.insert(0, entry)
        self._save_history()
    
    def get_project(self, project_id: str) -> Optional[ProjectSettings]:
        project_file = self.projects_dir / f"{project_id}.json"
        if project_file.exists():
            with open(project_file) as f:
                data = json.load(f)
                return ProjectSettings(**data)
        return None
    
    def save_project(self, project: ProjectSettings):
        project.modified = time.time()
        with open(self.projects_dir / f"{project.name}.json", 'w') as f:
            json.dump(asdict(project), f)
        
        self.add_history_entry(HistoryEntry(
            id=str(time.time()),
            action="save_project",
            timestamp=time.time(),
            details=f"Saved project '{project.name}'",
            projectId=project.name,
            reversible=False
        ))
    
    def list_projects(self) -> List[ProjectSettings]:
        projects = []
        for project_file in self.projects_dir.glob('*.json'):
            with open(project_file) as f:
                data = json.load(f)
                projects.append(ProjectSettings(**data))
        return sorted(projects, key=lambda p: p.modified, reverse=True)

    def delete_project(self, project_id: str):
        project_file = self.projects_dir / f"{project_id}.json"
        if project_file.exists():
            project_file.unlink()
            self.add_history_entry(HistoryEntry(
                id=str(time.time()),
                action="delete_project",
                timestamp=time.time(),
                details=f"Deleted project '{project_id}'",
                projectId=project_id,
                reversible=True,
                data={"project_id": project_id}
            ))
            return True
        return False

    def create_from_template(self, template_name: str, new_name: str) -> ProjectSettings:
        template = self.get_project(template_name)
        if template:
            new_project = ProjectSettings(
                name=new_name,
                text=template.text,
                voice=template.voice,
                voiceSettings=template.voiceSettings,
                emotionSettings=template.emotionSettings,
                outputSettings=template.outputSettings,
                created=time.time(),
                modified=time.time()
            )
            self.save_project(new_project)
            return new_project
        raise ValueError(f"Template {template_name} not found")

    def clear_history(self):
        self.history = []
        self._save_history()

    def undo_action(self, action_id: str) -> bool:
        for i, entry in enumerate(self.history):
            if entry.id == action_id and entry.reversible:
                if entry.action == "delete_project":
                    # Restore the deleted project if possible
                    backup_file = self.projects_dir / f"{entry.data['project_id']}.backup.json"
                    if backup_file.exists():
                        backup_file.rename(self.projects_dir / f"{entry.data['project_id']}.json")
                        self.history.pop(i)
                        self._save_history()
                        return True
                # Add other reversible actions here
        return False

def load_model_if_needed(model_choice: str):
    try:
        global CURRENT_MODEL_TYPE, CURRENT_MODEL
        if CURRENT_MODEL_TYPE != model_choice:
            if CURRENT_MODEL is not None:
                del CURRENT_MODEL
                torch.cuda.empty_cache()
            print(f"Loading {model_choice} model...", file=sys.stderr)
            
            # Check for quantized model first
            quantized_path = os.path.join(os.path.dirname(__file__), '../quantized_model')
            if DEFAULT_DEVICE == 'cpu' and os.path.exists(quantized_path):
                print(f"Loading quantized model from {quantized_path}", file=sys.stderr)
                CURRENT_MODEL = Zonos.from_pretrained(quantized_path, device=DEFAULT_DEVICE)
            else:
                # Load from HuggingFace and quantize if needed
                hf_token = os.environ.get("HF_TOKEN", None)
                if hf_token:
                    CURRENT_MODEL = Zonos.from_pretrained(model_choice, device=DEFAULT_DEVICE, use_auth_token=hf_token)
                else:
                    CURRENT_MODEL = Zonos.from_pretrained(model_choice, device=DEFAULT_DEVICE)
                
                # Apply dynamic quantization to INT8 if using CPU and no pre-quantized model exists
                if DEFAULT_DEVICE == 'cpu':
                    CURRENT_MODEL = quantize_dynamic(CURRENT_MODEL, {torch.nn.Linear}, dtype=torch.qint8)
                    print(f"{model_choice} model quantized to INT8 on CPU.", file=sys.stderr)
            
            CURRENT_MODEL.requires_grad_(False).eval()
            CURRENT_MODEL_TYPE = model_choice
            print(f"{model_choice} model loaded successfully!", file=sys.stderr)
        return CURRENT_MODEL
    except Exception as e:
        print(f"Error loading model: {str(e)}", file=sys.stderr)
        raise ValueError(f"Failed to load model {model_choice}: {str(e)}")

def handle_command(command: dict):
    try:
        if command["type"] == "get_models":
            supported_models = []
            if 'transformer' in ZonosBackbone.supported_architectures:
                supported_models.append('Zyphra/Zonos-v0.1-transformer')
            if 'hybrid' in ZonosBackbone.supported_architectures:
                supported_models.append('Zyphra/Zonos-v0.1-hybrid')
            return {"success": True, "data": supported_models}

        elif command["type"] == "get_conditioners":
            if not command.get("model"):
                raise ValueError("Model choice is required")
            model = load_model_if_needed(command["model"])
            if not model:
                raise ValueError("Failed to load model")
            conditioners = [c.name for c in model.prefix_conditioner.conditioners]
            return {"success": True, "data": conditioners}

        elif command["type"] == "generate-audio":
            if not command.get("params"):
                raise ValueError("Parameters are required")
            
            params = command["params"]
            if not params.get("model_choice"):
                raise ValueError("Model choice is required")
            
            # Load and verify model
            model = load_model_if_needed(params["model_choice"])
            if not model:
                raise ValueError("Failed to load model")

            # Handle speaker embedding
            global SPEAKER_EMBEDDING, SPEAKER_AUDIO_PATH
            if params.get("speaker_audio") and "speaker" not in params.get("unconditional_keys", []):
                if params["speaker_audio"] != SPEAKER_AUDIO_PATH:
                    try:
                        audio_path = params["speaker_audio"]
                        if audio_path.startswith('/samples/'):
                            audio_path = os.path.join(SAMPLES_PATH, os.path.basename(audio_path))
                        print("Computing speaker embedding", file=sys.stderr)
                        wav, sr = torchaudio.load(audio_path)
                        SPEAKER_EMBEDDING = model.make_speaker_embedding(wav, sr)
                        SPEAKER_EMBEDDING = SPEAKER_EMBEDDING.to(DEFAULT_DEVICE, torch.bfloat16)
                        SPEAKER_AUDIO_PATH = params["speaker_audio"]
                    except Exception as e:
                        print(f"Error processing reference audio: {str(e)}", file=sys.stderr)
                        raise ValueError(f"Failed to process reference audio: {str(e)}")

            # Handle prefix audio
            audio_prefix_codes = None
            if params.get("prefix_audio"):
                try:
                    wav_prefix, sr_prefix = torchaudio.load(params["prefix_audio"])
                    wav_prefix = wav_prefix.mean(0, keepdim=True)
                    wav_prefix = model.autoencoder.preprocess(wav_prefix, sr_prefix)
                    wav_prefix = wav_prefix.to(DEFAULT_DEVICE, torch.float32)
                    audio_prefix_codes = model.autoencoder.encode(wav_prefix.unsqueeze(0))
                except Exception as e:
                    print(f"Error processing prefix audio: {str(e)}", file=sys.stderr)
                    raise ValueError(f"Failed to process prefix audio: {str(e)}")

            try:
                # Create emotion tensor
                emotion_tensor = torch.tensor([
                    float(params.get("e1", 1.0)),  # Happiness
                    float(params.get("e2", 0.05)),  # Sadness
                    float(params.get("e3", 0.05)),  # Disgust
                    float(params.get("e4", 0.05)),  # Fear
                    float(params.get("e5", 0.05)),  # Surprise
                    float(params.get("e6", 0.05)),  # Anger
                    float(params.get("e7", 0.1)),   # Other
                    float(params.get("e8", 0.2)),   # Neutral
                ], device=DEFAULT_DEVICE)

                # Create VQ score tensor
                vq_val = float(params.get("vq_single", 0.78))
                vq_tensor = torch.tensor([vq_val] * 8, device=DEFAULT_DEVICE).unsqueeze(0)

                # Create conditioning dictionary
                cond_dict = make_cond_dict(
                    text=params.get("text", ""),
                    language=params.get("language", "en-us"),
                    speaker=SPEAKER_EMBEDDING,
                    emotion=emotion_tensor,
                    vqscore_8=vq_tensor,
                    fmax=float(params.get("fmax", 24000)),
                    pitch_std=float(params.get("pitch_std", 45.0)),
                    speaking_rate=float(params.get("speaking_rate", 15.0)),
                    dnsmos_ovrl=float(params.get("dnsmos_ovrl", 4.0)),
                    speaker_noised=bool(params.get("speaker_noised", False)),
                    device=DEFAULT_DEVICE,
                    unconditional_keys=params.get("unconditional_keys", ["emotion"]),
                )

                conditioning = model.prepare_conditioning(cond_dict)

                # Generate audio
                codes = model.generate(
                    prefix_conditioning=conditioning,
                    audio_prefix_codes=audio_prefix_codes,
                    max_new_tokens=86 * 30,
                    cfg_scale=float(params.get("cfg_scale", 2.0)),
                    batch_size=1,
                    sampling_params={
                        "top_p": float(params.get("top_p", 0.8)),
                        "top_k": int(params.get("top_k", 50)),
                        "min_p": float(params.get("min_p", 0.05)),
                        "linear": float(params.get("linear", 0.5)),
                        "conf": float(params.get("confidence", 0.4)),
                        "quad": float(params.get("quadratic", 0.0))
                    },
                )

                # Decode to waveform
                wav_out = model.autoencoder.decode(codes)
                wav_out = wav_out.squeeze().cpu().detach()

                # Convert to float32 numpy array and validate
                audio_data = wav_out.numpy().astype('float32')
                if not np.all(np.isfinite(audio_data)):
                    raise ValueError("Generated audio contains invalid values")

                return {
                    "success": True,
                    "data": [
                        int(model.autoencoder.sampling_rate),
                        audio_data.tolist()
                    ]
                }

            except Exception as e:
                print(f"Error during audio generation: {str(e)}", file=sys.stderr)
                raise ValueError(f"Failed to generate audio: {str(e)}")

        elif command["type"] == "get_settings":
            return {"success": True, "data": asdict(project_manager.settings)}
            
        elif command["type"] == "update_settings":
            project_manager.settings = AppSettings(**command["settings"])
            project_manager._save_settings()
            return {"success": True, "data": None}
            
        elif command["type"] == "get_projects":
            projects = project_manager.list_projects()
            return {"success": True, "data": [asdict(p) for p in projects]}
            
        elif command["type"] == "save_project":
            project = ProjectSettings(**command["project"])
            project_manager.save_project(project)
            return {"success": True, "data": None}
            
        elif command["type"] == "get_project":
            project = project_manager.get_project(command["projectId"])
            return {"success": True, "data": asdict(project) if project else None}
            
        elif command["type"] == "get_history":
            return {"success": True, "data": [asdict(h) for h in project_manager.history]}

        elif command["type"] == "delete_project":
            success = project_manager.delete_project(command["projectId"])
            return {"success": True, "data": success}

        elif command["type"] == "create_from_template":
            new_project = project_manager.create_from_template(
                command["templateName"],
                command["newName"]
            )
            return {"success": True, "data": asdict(new_project)}

        elif command["type"] == "clear_history":
            project_manager.clear_history()
            return {"success": True, "data": None}

        elif command["type"] == "undo_action":
            success = project_manager.undo_action(command["actionId"])
            return {"success": True, "data": success}

        elif command["type"] == "get_voice_settings":
            model = load_model_if_needed(command["voice"])
            settings = {
                "supported_languages": supported_language_codes,
                "parameters": {
                    "speed": {"min": 0.5, "max": 2.0, "default": 1.0},
                    "pitch": {"min": 0.5, "max": 2.0, "default": 1.0},
                    "tone": {"min": 0.0, "max": 1.0, "default": 0.5},
                    "emotions": {
                        "linear": {"min": 0.0, "max": 1.0, "default": 0.5},
                        "confidence": {"min": 0.0, "max": 1.0, "default": 0.5},
                        "quadratic": {"min": 0.0, "max": 1.0, "default": 0.0},
                    },
                    "seed": {"min": 0, "max": 1000000, "default": 0},
                    "randomize_seed": {"default": True},
                    "unconditional_k": {"default": ["emotion"]},
                }
            }
            return {"success": True, "data": settings}

    except Exception as e:
        error_msg = str(e)
        print(f"Error in handle_command: {error_msg}", file=sys.stderr)
        return {"success": False, "error": error_msg}

def main():
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
                
            command = json.loads(line)
            result = handle_command(command)
            
            # Write response
            sys.stdout.write(json.dumps(result) + "\n")
            sys.stdout.flush()
            
        except Exception as e:
            sys.stderr.write(f"Error: {str(e)}\n")
            sys.stderr.flush()

# Initialize project manager
project_manager = ProjectManager()

if __name__ == "__main__":
    main()