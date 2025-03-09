"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface AudioPreviewProps {
  text: string
  voice: string
  settings: {
    speed: number
    pitch: number
    tone: number
  }
  generatedAudio?: {
    buffer: Float32Array
    sampleRate: number
  }
}

export default function AudioPreview({ text, voice, settings, generatedAudio }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(60) // Simulated duration in seconds
  const [volume, setVolume] = useState(80)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Calculate duration based on text length and speed
  useEffect(() => {
    // Rough estimate: 1 character takes about 0.06 seconds to speak
    // Adjust for speed setting
    const estimatedDuration = Math.max(10, Math.ceil((text.length * 0.06) / settings.speed))
    setDuration(estimatedDuration)

    // Reset current time when text changes
    setCurrentTime(0)
    setIsPlaying(false)
  }, [text, settings.speed])

  // Simulate audio playback
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, duration])

  useEffect(() => {
    if (generatedAudio && generatedAudio.buffer && generatedAudio.sampleRate) {
      try {
        // Validate the audio data
        if (!Number.isFinite(generatedAudio.sampleRate) || generatedAudio.sampleRate <= 0) {
          console.error('Invalid sample rate:', generatedAudio.sampleRate);
          return;
        }

        if (!generatedAudio.buffer.length) {
          console.error('Empty audio buffer');
          return;
        }

        // Check if any samples are non-finite
        const hasInvalidSamples = generatedAudio.buffer.some(sample => !Number.isFinite(sample));
        if (hasInvalidSamples) {
          console.error('Audio buffer contains non-finite values');
          return;
        }

        // Create audio context and buffer
        const audioContext = new AudioContext();
        const audioBuffer = audioContext.createBuffer(
          1, // number of channels
          generatedAudio.buffer.length,
          generatedAudio.sampleRate
        );

        // Copy the data to the audio buffer
        const channelData = audioBuffer.getChannelData(0);
        channelData.set(generatedAudio.buffer);

        // Create a blob URL for the audio
        const offlineContext = new OfflineAudioContext(
          1,
          generatedAudio.buffer.length,
          generatedAudio.sampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();

        offlineContext.startRendering().then(renderedBuffer => {
          const wavBlob = new Blob([exportWAV(renderedBuffer)], { type: 'audio/wav' });
          const url = URL.createObjectURL(wavBlob);

          if (audioRef.current) {
            audioRef.current.src = url;
            setDuration(audioBuffer.duration);
          }

          return () => URL.revokeObjectURL(url);
        });

      } catch (error) {
        console.error('Error processing audio:', error);
      }
    }
  }, [generatedAudio]);

  // Helper function to convert AudioBuffer to WAV format
  function exportWAV(audioBuffer: AudioBuffer): ArrayBuffer {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const buffer = audioBuffer.getChannelData(0);
    const dataSize = buffer.length * bytesPerSample;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    
    const arrayBuffer = new ArrayBuffer(totalSize);
    const dataView = new DataView(arrayBuffer);
    
    // RIFF chunk descriptor
    writeString(dataView, 0, 'RIFF');
    dataView.setUint32(4, totalSize - 8, true);
    writeString(dataView, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(dataView, 12, 'fmt ');
    dataView.setUint32(16, 16, true); // fmt chunk size
    dataView.setUint16(20, format, true);
    dataView.setUint16(22, numChannels, true);
    dataView.setUint32(24, sampleRate, true);
    dataView.setUint32(28, sampleRate * blockAlign, true); // byte rate
    dataView.setUint16(32, blockAlign, true);
    dataView.setUint16(34, bitDepth, true);
    
    // data sub-chunk
    writeString(dataView, 36, 'data');
    dataView.setUint32(40, dataSize, true);
    
    // Write the PCM samples
    const samples = new Int16Array(buffer.length);
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      dataView.setInt16(offset, samples[i], true);
      offset += 2;
    }
    
    return arrayBuffer;
  }

  function writeString(dataView: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      dataView.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Audio Preview</h3>
          <div className="text-sm text-muted-foreground">Using: {voice.charAt(0).toUpperCase() + voice.slice(1)}</div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}>
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button variant="default" size="icon" className="h-10 w-10 rounded-full" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>

            <Button variant="outline" size="icon" onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}>
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm w-10">{formatTime(currentTime)}</span>
              <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleSeek} className="flex-1" />
              <span className="text-sm w-10">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-2 w-32">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} />
            </div>
          </div>

          {text ? (
            <div className="text-sm text-muted-foreground border rounded-md p-2 max-h-20 overflow-auto">
              {text.length > 200 ? text.substring(0, 200) + "..." : text}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">Enter text in the editor to preview audio</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

