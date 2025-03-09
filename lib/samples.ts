export interface VoiceSample {
  id: string
  name: string
  description: string
  path: string
  duration: number
  language: string
  gender: 'male' | 'female' | 'other'
  tags: string[]
}

export const SAMPLE_VOICES: VoiceSample[] = [
  {
    id: 'emma',
    name: 'Emma',
    description: 'Clear female voice with neutral accent',
    path: '/samples/emma.wav',
    duration: 12.5,
    language: 'en',
    gender: 'female',
    tags: ['clear', 'neutral', 'professional']
  },
  // Add more samples...
] 