"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

interface SettingsPanelProps {
  onClose: () => void
  onShowLicense: () => void
}

export default function SettingsPanel({ onClose, onShowLicense }: SettingsPanelProps) {
  return (
    <Card className="fixed right-0 top-0 h-screen w-96 z-50 rounded-none shadow-lg border-l">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-lg font-medium">Settings</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Appearance</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-select" className="flex-1">
                      Theme
                    </Label>
                    <Select defaultValue="system">
                      <SelectTrigger id="theme-select" className="w-[180px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="font-size" className="flex-1">
                      Font Size
                    </Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="font-size" className="w-[180px]">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Behavior</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save" className="flex-1">
                      Auto-save projects
                    </Label>
                    <Switch id="auto-save" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-preview" className="flex-1">
                      Auto-preview changes
                    </Label>
                    <Switch id="auto-preview" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confirm-export" className="flex-1">
                      Confirm before export
                    </Label>
                    <Switch id="confirm-export" defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">File Management</h3>
                  <div className="space-y-2">
                    <Label htmlFor="default-location">Default Save Location</Label>
                    <div className="flex gap-2">
                      <Input
                        id="default-location"
                        value="/Users/username/Documents/VoiceOver"
                        readOnly
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        Browse
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-backup" className="flex-1">
                      Create backups
                    </Label>
                    <Switch id="auto-backup" defaultChecked />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="audio" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Playback</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Default Volume</Label>
                      <span className="text-sm text-muted-foreground">80%</span>
                    </div>
                    <Slider defaultValue={[80]} max={100} step={1} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-play" className="flex-1">
                      Auto-play on preview
                    </Label>
                    <Switch id="auto-play" defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Processing</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-quality" className="flex-1">
                      High-quality processing
                    </Label>
                    <Switch id="high-quality" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="background-noise" className="flex-1">
                      Background noise reduction
                    </Label>
                    <Switch id="background-noise" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Default Normalization</Label>
                      <span className="text-sm text-muted-foreground">Medium</span>
                    </div>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Export Defaults</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="default-format" className="flex-1">
                      Default Format
                    </Label>
                    <Select defaultValue="mp3">
                      <SelectTrigger id="default-format" className="w-[180px]">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp3">MP3</SelectItem>
                        <SelectItem value="wav">WAV</SelectItem>
                        <SelectItem value="ogg">OGG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="default-quality" className="flex-1">
                      Default Quality
                    </Label>
                    <Select defaultValue="high">
                      <SelectTrigger id="default-quality" className="w-[180px]">
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="very-high">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="advanced" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Performance</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hardware-accel" className="flex-1">
                      Hardware acceleration
                    </Label>
                    <Switch id="hardware-accel" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cache-voices" className="flex-1">
                      Cache voice models
                    </Label>
                    <Switch id="cache-voices" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cache-size">Cache Size Limit</Label>
                    <Select defaultValue="2gb">
                      <SelectTrigger id="cache-size">
                        <SelectValue placeholder="Select cache size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500mb">500 MB</SelectItem>
                        <SelectItem value="1gb">1 GB</SelectItem>
                        <SelectItem value="2gb">2 GB</SelectItem>
                        <SelectItem value="5gb">5 GB</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Developer</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="debug-mode" className="flex-1">
                      Debug mode
                    </Label>
                    <Switch id="debug-mode" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verbose-logging" className="flex-1">
                      Verbose logging
                    </Label>
                    <Switch id="verbose-logging" />
                  </div>
                  <Button variant="outline" size="sm">
                    Export Diagnostic Data
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Reset</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Reset All Settings
                    </Button>
                    <Button variant="destructive" size="sm" className="w-full">
                      Factory Reset
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="license" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">License Information</h3>
                  <div className="rounded-md border p-4 bg-yellow-500/5">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium text-sm">Trial Version</p>
                        <p className="text-sm text-muted-foreground">
                          You are currently using the trial version. Purchase a license to unlock all features.
                        </p>
                        <Button size="sm" className="mt-2" onClick={() => onShowLicense()}>
                          Manage License
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

