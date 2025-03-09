"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import EmotionControls from "./emotion-controls"
import VoiceReference from "./voice-reference"
import { useEffect, useState } from "react"
import { audioService, VoiceSettings } from "@/lib/audio-service"

interface VoiceSelectorProps {
  selectedVoice: string
  setSelectedVoice: (voice: string) => void
  voiceSettings: {
    speed: number
    pitch: number
    tone: number
    emotions: {
      linear: number
      confidence: number
      quadratic: number
      seed: number
      randomizeSeed: boolean
    }
  }
  setVoiceSettings: (settings: VoiceSelectorProps["voiceSettings"]) => void
}

export default function VoiceSelector({ 
  selectedVoice, 
  setSelectedVoice, 
  voiceSettings, 
  setVoiceSettings 
}: VoiceSelectorProps) {
  const [modelSettings, setModelSettings] = useState<VoiceSettings | null>(null)
  const [voices, setVoices] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVoices = async () => {
      try {
        setIsLoading(true)
        const models = await audioService.getSupportedModels()
        setVoices(models)
        
        // If no voice is selected and we have models, select the first one
        if (!selectedVoice && models.length > 0) {
          setSelectedVoice(models[0])
        }
      } catch (error) {
        console.error('Error loading voices:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadVoices()
  }, [selectedVoice, setSelectedVoice])

  useEffect(() => {
    const loadVoiceSettings = async () => {
      if (selectedVoice) {
        try {
          const settings = await audioService.getVoiceSettings(selectedVoice)
          setModelSettings(settings)
          
          // Initialize voice settings with defaults if not already set
          if (!voiceSettings) {
            setVoiceSettings({
              speed: settings.parameters.speed.default,
              pitch: settings.parameters.pitch.default,
              tone: settings.parameters.tone.default,
              emotions: {
                linear: settings.parameters.emotions.linear.default,
                confidence: settings.parameters.emotions.confidence.default,
                quadratic: settings.parameters.emotions.quadratic.default,
                seed: settings.parameters.seed.default,
                randomizeSeed: settings.parameters.randomize_seed.default
              }
            })
          }
        } catch (error) {
          console.error('Error loading voice settings:', error)
        }
      }
    }
    loadVoiceSettings()
  }, [selectedVoice, setVoiceSettings, voiceSettings])

  const handleSpeedChange = (value: number[]) => {
    setVoiceSettings({
      ...voiceSettings,
      speed: value[0]
    })
  }

  const handlePitchChange = (value: number[]) => {
    setVoiceSettings({
      ...voiceSettings,
      pitch: value[0]
    })
  }

  const handleToneChange = (value: number[]) => {
    setVoiceSettings({
      ...voiceSettings,
      tone: value[0]
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Voice Model</Label>
              <Select 
                value={selectedVoice} 
                onValueChange={setSelectedVoice}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading voices..." : "Select a voice model"} />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v.split('/').pop()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedVoice && modelSettings && (
              <>
                <div className="space-y-2">
                  <Label>Speed</Label>
                  <Slider
                    value={[voiceSettings.speed]}
                    min={modelSettings.parameters.speed.min}
                    max={modelSettings.parameters.speed.max}
                    step={0.01}
                    onValueChange={handleSpeedChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pitch</Label>
                  <Slider
                    value={[voiceSettings.pitch]}
                    min={modelSettings.parameters.pitch.min}
                    max={modelSettings.parameters.pitch.max}
                    step={0.01}
                    onValueChange={handlePitchChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Slider
                    value={[voiceSettings.tone]}
                    min={modelSettings.parameters.tone.min}
                    max={modelSettings.parameters.tone.max}
                    step={0.01}
                    onValueChange={handleToneChange}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedVoice && modelSettings && (
        <EmotionControls
          settings={voiceSettings.emotions}
          onSettingsChange={(emotionSettings) => setVoiceSettings({
            ...voiceSettings,
            emotions: emotionSettings
          })}
        />
      )}
    </div>
  )
}

