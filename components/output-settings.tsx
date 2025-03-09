"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OutputSettingsProps {
  settings: {
    format: string
    quality: string
    sampleRate: string
  }
  setSettings: (settings: any) => void
}

export default function OutputSettings({ settings, setSettings }: OutputSettingsProps) {
  const updateSettings = (key: string, value: string) => {
    setSettings({
      ...settings,
      [key]: value,
    })
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Audio Format</h3>

          <div className="mb-4">
            <Label className="mb-2 block">File Format</Label>
            <RadioGroup
              value={settings.format}
              onValueChange={(value) => updateSettings("format", value)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mp3" id="mp3" />
                <Label htmlFor="mp3" className="cursor-pointer">
                  MP3
                </Label>
                <span className="text-xs text-muted-foreground ml-2">(Compressed, smaller file size)</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wav" id="wav" />
                <Label htmlFor="wav" className="cursor-pointer">
                  WAV
                </Label>
                <span className="text-xs text-muted-foreground ml-2">(Uncompressed, higher quality)</span>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ogg" id="ogg" />
                <Label htmlFor="ogg" className="cursor-pointer">
                  OGG
                </Label>
                <span className="text-xs text-muted-foreground ml-2">(Compressed, good quality)</span>
              </div>
            </RadioGroup>
          </div>

          <div className="mb-4">
            <Label htmlFor="quality" className="mb-2 block">
              Quality
            </Label>
            <Select value={settings.quality} onValueChange={(value) => updateSettings("quality", value)}>
              <SelectTrigger id="quality">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (64 kbps)</SelectItem>
                <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                <SelectItem value="high">High (192 kbps)</SelectItem>
                <SelectItem value="very-high">Very High (320 kbps)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sampleRate" className="mb-2 block">
              Sample Rate
            </Label>
            <Select value={settings.sampleRate} onValueChange={(value) => updateSettings("sampleRate", value)}>
              <SelectTrigger id="sampleRate">
                <SelectValue placeholder="Select sample rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="22050">22.05 kHz</SelectItem>
                <SelectItem value="44100">44.1 kHz</SelectItem>
                <SelectItem value="48000">48 kHz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>

          <Tabs defaultValue="processing">
            <TabsList className="w-full">
              <TabsTrigger value="processing" className="flex-1">
                Processing
              </TabsTrigger>
              <TabsTrigger value="export" className="flex-1">
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="processing" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="normalization" className="mb-2 block">
                    Normalization
                  </Label>
                  <Select defaultValue="auto">
                    <SelectTrigger id="normalization">
                      <SelectValue placeholder="Select normalization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="peak">Peak Normalization</SelectItem>
                      <SelectItem value="rms">RMS Normalization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="silence" className="mb-2 block">
                    Silence Handling
                  </Label>
                  <Select defaultValue="auto">
                    <SelectTrigger id="silence">
                      <SelectValue placeholder="Select silence handling" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preserve">Preserve All Silences</SelectItem>
                      <SelectItem value="auto">Auto Trim</SelectItem>
                      <SelectItem value="aggressive">Aggressive Trim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="naming" className="mb-2 block">
                    File Naming
                  </Label>
                  <Select defaultValue="project">
                    <SelectTrigger id="naming">
                      <SelectValue placeholder="Select file naming" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">Project Name</SelectItem>
                      <SelectItem value="datetime">Date and Time</SelectItem>
                      <SelectItem value="custom">Custom Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="destination" className="mb-2 block">
                    Export Destination
                  </Label>
                  <Select defaultValue="default">
                    <SelectTrigger id="destination">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Folder</SelectItem>
                      <SelectItem value="custom">Custom Folder</SelectItem>
                      <SelectItem value="last">Last Used Folder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

