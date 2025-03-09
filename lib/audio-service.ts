import { ipcRenderer } from 'electron'

export interface GenerateAudioParams {
  modelChoice: string
  text: string
  language: string
  speaker_audio?: string | null
  prefix_audio?: string | null
  emotion: {
    e1: number  // Happiness
    e2: number  // Sadness
    e3: number  // Disgust
    e4: number  // Fear
    e5: number  // Surprise
    e6: number  // Anger
    e7: number  // Other
    e8: number  // Neutral
  }
  vq_single: number
  fmax: number
  pitch_std: number
  speaking_rate: number
  dnsmos_ovrl: number
  speaker_noised: boolean
  cfg_scale: number
  sampling: {
    top_p: number
    top_k: number
    min_p: number
    linear: number
    confidence: number
    quadratic: number
  }
  seed: number
  randomize_seed: boolean
  unconditional_keys: string[]
}

export interface ProjectSettings {
  name: string
  text: string
  voice: string
  voiceSettings: {
    speed: number
    pitch: number
    tone: number
  }
  outputSettings: {
    format: string
    quality: string
    sampleRate: string
  }
  created: number
  modified: number
}

export interface AppSettings {
  theme: string
  defaultVoice: string
  defaultOutputFormat: string
  projectsDirectory: string
  autoSave: boolean
}

export interface HistoryEntry {
  id: string
  action: string
  timestamp: number
  details: string
  projectId: string
  reversible: boolean
  data?: any
}

export interface VoiceSettings {
  supported_languages: string[]
  parameters: {
    speed: { min: number; max: number; default: number }
    pitch: { min: number; max: number; default: number }
    tone: { min: number; max: number; default: number }
    emotions: {
      linear: { min: number; max: number; default: number }
      confidence: { min: number; max: number; default: number }
      quadratic: { min: number; max: number; default: number }
    }
    seed: { min: number; max: number; default: number }
    randomize_seed: { default: boolean }
    unconditional_k: { default: string[] }
  }
}

export const audioService = {
  async getSupportedModels(): Promise<string[]> {
    const response = await window.electron.invoke('get-supported-models')
    return response
  },

  async getModelConditioners(modelChoice: string): Promise<string[]> {
    const response = await window.electron.invoke('get-model-conditioners', modelChoice)
    return response
  },

  async generateAudio(params: GenerateAudioParams): Promise<{ buffer: Float32Array; sampleRate: number }> {
    const response = await window.electron.invoke('generate-audio', {
      model_choice: params.modelChoice,
      text: params.text,
      language: params.language,
      speaker_audio: params.speaker_audio,
      prefix_audio: params.prefix_audio,
      e1: params.emotion.e1,
      e2: params.emotion.e2,
      e3: params.emotion.e3,
      e4: params.emotion.e4,
      e5: params.emotion.e5,
      e6: params.emotion.e6,
      e7: params.emotion.e7,
      e8: params.emotion.e8,
      vq_single: params.vq_single,
      fmax: params.fmax,
      pitch_std: params.pitch_std,
      speaking_rate: params.speaking_rate,
      dnsmos_ovrl: params.dnsmos_ovrl,
      speaker_noised: params.speaker_noised,
      cfg_scale: params.cfg_scale,
      top_p: params.sampling.top_p,
      top_k: params.sampling.top_k,
      min_p: params.sampling.min_p,
      linear: params.sampling.linear,
      confidence: params.sampling.confidence,
      quadratic: params.sampling.quadratic,
      seed: params.seed,
      randomize_seed: params.randomize_seed,
      unconditional_keys: params.unconditional_keys
    })
    
    if (!response) {
      throw new Error('No response received from audio generation server');
    }

    if (!response.success) {
      throw new Error(response.error || 'Audio generation failed');
    }

    if (!response.data || !Array.isArray(response.data) || response.data.length !== 2) {
      throw new Error('Invalid response format from audio generation server');
    }

    const [sampleRate, audioData] = response.data;

    // Validate sample rate
    if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
      throw new Error('Invalid sample rate received from server');
    }

    // Convert audio data to Float32Array and validate
    const buffer = new Float32Array(audioData);
    if (buffer.some(sample => !Number.isFinite(sample))) {
      throw new Error('Audio data contains invalid samples');
    }

    return {
      buffer,
      sampleRate
    }
  },

  async getSettings(): Promise<AppSettings> {
    const response = await window.electron.invoke('get-settings')
    return response
  },

  async updateSettings(settings: AppSettings): Promise<void> {
    await window.electron.invoke('update-settings', settings)
  },

  async getProjects(): Promise<ProjectSettings[]> {
    const response = await window.electron.invoke('get-projects')
    return response
  },

  async saveProject(project: ProjectSettings): Promise<void> {
    await window.electron.invoke('save-project', project)
  },

  async getProject(projectId: string): Promise<ProjectSettings | null> {
    const response = await window.electron.invoke('get-project', projectId)
    return response
  },

  async getHistory(): Promise<HistoryEntry[]> {
    const response = await window.electron.invoke('get-history')
    return response
  },

  async deleteProject(projectId: string): Promise<boolean> {
    return await window.electron.invoke('delete-project', projectId)
  },

  async createFromTemplate(templateName: string, newName: string): Promise<ProjectSettings> {
    return await window.electron.invoke('create-from-template', { templateName, newName })
  },

  async clearHistory(): Promise<void> {
    await window.electron.invoke('clear-history')
  },

  async undoAction(actionId: string): Promise<boolean> {
    return await window.electron.invoke('undo-action', actionId)
  },

  async getVoiceSettings(voice: string): Promise<VoiceSettings> {
    return await window.electron.invoke('get-voice-settings', voice)
  }
} 