"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shuffle } from "lucide-react"

interface EmotionControlsProps {
  settings: {
    linear: number
    confidence: number
    quadratic: number
    seed: number
    randomizeSeed: boolean
  }
  onSettingsChange: (settings: EmotionControlsProps["settings"]) => void
}

export default function EmotionControls({ settings, onSettingsChange }: EmotionControlsProps) {
  const handleRandomizeSeed = () => {
    if (settings.randomizeSeed) {
      onSettingsChange({
        ...settings,
        seed: Math.floor(Math.random() * 1000000)
      })
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Emotion Balance</Label>
            <Slider
              value={[settings.linear]}
              min={-1}
              max={1}
              step={0.01}
              onValueChange={([value]) => onSettingsChange({ ...settings, linear: value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Confidence</Label>
            <Slider
              value={[settings.confidence]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([value]) => onSettingsChange({ ...settings, confidence: value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Quadratic Term</Label>
            <Slider
              value={[settings.quadratic]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([value]) => onSettingsChange({ ...settings, quadratic: value })}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1 space-y-2">
              <Label>Seed</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={settings.seed}
                  onChange={(e) => onSettingsChange({ 
                    ...settings, 
                    seed: parseInt(e.target.value) || 0 
                  })}
                  disabled={settings.randomizeSeed}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRandomizeSeed}
                  disabled={!settings.randomizeSeed}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.randomizeSeed}
                onCheckedChange={(checked) => onSettingsChange({ 
                  ...settings, 
                  randomizeSeed: checked 
                })}
              />
              <Label>Randomize</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 