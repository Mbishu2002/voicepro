"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, Play, Pause, X, Library } from "lucide-react"
import { useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SAMPLE_VOICES, VoiceSample } from "@/lib/samples"

interface VoiceReferenceProps {
  audioFile: string | null
  onAudioChange: (file: string | null) => void
}

export default function VoiceReference({ audioFile, onAudioChange }: VoiceReferenceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSamples, setShowSamples] = useState(false)
  const [previewSample, setPreviewSample] = useState<VoiceSample | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onAudioChange(url)
    }
  }

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleClear = () => {
    if (audioFile) {
      URL.revokeObjectURL(audioFile)
    }
    onAudioChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePreviewPlay = (sample: VoiceSample) => {
    if (previewAudioRef.current) {
      if (previewSample?.id === sample.id && isPreviewPlaying) {
        previewAudioRef.current.pause()
        setIsPreviewPlaying(false)
      } else {
        setPreviewSample(sample)
        previewAudioRef.current.src = sample.path
        previewAudioRef.current.play()
        setIsPreviewPlaying(true)
      }
    }
  }

  const handleSampleSelect = (sample: VoiceSample) => {
    onAudioChange(sample.path)
    setShowSamples(false)
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Reference Voice</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Voice Sample
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSamples(true)}
              >
                <Library className="h-4 w-4 mr-2" />
                Browse Samples
              </Button>
              {audioFile && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePlay}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleClear}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {audioFile && (
              <audio ref={audioRef} src={audioFile} onEnded={() => setIsPlaying(false)} />
            )}
            <p className="text-sm text-muted-foreground">
              Upload a short voice sample (5-30 seconds) for the best results. 
              The sample should be clear speech without background noise.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSamples} onOpenChange={setShowSamples}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Voice Samples</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-2 gap-4 p-4">
              {SAMPLE_VOICES.map((sample) => (
                <Card key={sample.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{sample.name}</h4>
                        <p className="text-sm text-muted-foreground">{sample.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePreviewPlay(sample)}
                      >
                        {previewSample?.id === sample.id && isPreviewPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {sample.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleSampleSelect(sample)}
                    >
                      Use This Voice
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <audio 
            ref={previewAudioRef} 
            onEnded={() => setIsPreviewPlaying(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
} 