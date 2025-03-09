from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import torch
import torchaudio
import numpy as np
from zonos.model import Zonos, DEFAULT_BACKBONE_CLS as ZonosBackbone
from zonos.conditioning import make_cond_dict, supported_language_codes

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
CURRENT_MODEL_TYPE = None
CURRENT_MODEL = None
SPEAKER_EMBEDDING = None
SPEAKER_AUDIO_PATH = None
DEFAULT_DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

class GenerateParams(BaseModel):
    modelChoice: str
    text: str
    language: str
    speakerAudio: Optional[str]
    prefixAudio: Optional[str]
    emotion: List[float]
    vqSingle: float
    fmax: float
    pitchStd: float
    speakingRate: float
    dnsmosOverall: float
    speakerNoised: bool
    cfgScale: float
    samplingParams: dict
    unconditionalKeys: List[str]

def load_model_if_needed(model_choice: str):
    global CURRENT_MODEL_TYPE, CURRENT_MODEL
    if CURRENT_MODEL_TYPE != model_choice:
        if CURRENT_MODEL is not None:
            del CURRENT_MODEL
            torch.cuda.empty_cache()
        print(f"Loading {model_choice} model...")
        CURRENT_MODEL = Zonos.from_pretrained(model_choice, device=DEFAULT_DEVICE)
        CURRENT_MODEL.requires_grad_(False).eval()
        CURRENT_MODEL_TYPE = model_choice
        print(f"{model_choice} model loaded successfully!")
    return CURRENT_MODEL

@app.get("/models")
async def get_supported_models():
    supported_models = []
    if 'transformer' in ZonosBackbone.supported_architectures:
        supported_models.append('Zyphra/Zonos-v0.1-transformer')
    if 'hybrid' in ZonosBackbone.supported_architectures:
        supported_models.append('Zyphra/Zonos-v0.1-hybrid')
    return supported_models

@app.get("/conditioners")
async def get_model_conditioners(model: str):
    try:
        model_instance = load_model_if_needed(model)
        conditioners = [c.name for c in model_instance.prefix_conditioner.conditioners]
        return conditioners
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate")
async def generate_audio(params: GenerateParams):
    try:
        model = load_model_if_needed(params.modelChoice)
        
        # Handle speaker embedding
        global SPEAKER_EMBEDDING, SPEAKER_AUDIO_PATH
        if params.speakerAudio and 'speaker' not in params.unconditionalKeys:
            if params.speakerAudio != SPEAKER_AUDIO_PATH:
                print("Recomputing speaker embedding")
                wav, sr = torchaudio.load(params.speakerAudio)
                SPEAKER_EMBEDDING = model.make_speaker_embedding(wav, sr)
                SPEAKER_EMBEDDING = SPEAKER_EMBEDDING.to(DEFAULT_DEVICE, torch.bfloat16)
                SPEAKER_AUDIO_PATH = params.speakerAudio

        # ... rest of generation code from gradio_interface.py ...
        
        # Return the audio data as base64
        audio_data = wavOut.squeeze().cpu().numpy()
        return {
            "audio": audio_data.tolist(),
            "sampleRate": model.autoencoder.sampling_rate
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860) 