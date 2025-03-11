"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TextEditor from "@/components/text-editor"
import VoiceSelector from "@/components/voice-selector"
import AudioPreview from "@/components/audio-preview"
import OutputSettings from "@/components/output-settings"
import ProjectManager from "@/components/project-manager"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import HistoryPanel from "@/components/history-panel"
import HelpPanel from "@/components/help-panel"
import SettingsPanel from "@/components/settings-panel"
import LicensePanel from "@/components/license-panel"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Save, Download } from "lucide-react"
import { audioService, GenerateAudioParams } from '@/lib/audio-service'

export default function TtsInterface() {
  const [text, setText] = useState<string>(
    "Enter your script here. This text will be converted to speech when you click the play button.",
  )
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [generatedAudio, setGeneratedAudio] = useState<{ buffer: Float32Array; sampleRate: number } | null>(null)
  const [voiceSettings, setVoiceSettings] = useState({
    speed: 1.0,
    pitch: 1.0,
    tone: 0.5,
    emotions: {
      linear: 0.5,
      confidence: 0.4,
      quadratic: 0.0,
      seed: 420,
      randomizeSeed: true
    }
  })
  const [outputSettings, setOutputSettings] = useState({
    format: "mp3",
    quality: "high",
    sampleRate: "44100",
  })
  const [projectName, setProjectName] = useState<string>("Untitled Project")
  const [activeTab, setActiveTab] = useState<string>("editor")

  // State for panels
  const [showHistory, setShowHistory] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showLicense, setShowLicense] = useState(false)

  // State for dialogs
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")

  // Refs for simulating actions
  const exportIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  const [isGenerating, setIsGenerating] = useState(false)
  const [supportedModels, setSupportedModels] = useState<string[]>([])
  const [modelConditioners, setModelConditioners] = useState<string[]>([])

  // Load supported models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await audioService.getSupportedModels()
        setSupportedModels(models)
        
        // Set the first available model as the selected voice
        if (models.length > 0) {
          setSelectedVoice(models[0])
          const conditioners = await audioService.getModelConditioners(models[0])
          setModelConditioners(conditioners)
        } else {
          console.warn('No voice models available')
          toast({
            title: "Warning",
            description: "No voice models are available",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error loading models:', error)
        toast({
          title: "Error",
          description: "Failed to load voice models",
          variant: "destructive"
        })
      }
    }
    loadModels()
  }, [])

  // Update conditioners when model changes
  const handleModelChange = async (model: string) => {
    try {
      setSelectedVoice(model)
      const conditioners = await audioService.getModelConditioners(model)
      setModelConditioners(conditioners)
    } catch (error) {
      console.error('Error loading model conditioners:', error)
      toast({
        title: "Error",
        description: "Failed to load voice settings",
        variant: "destructive"
      })
    }
  }

  const handleGenerateAudio = async () => {
    try {
      setIsGenerating(true)
      setGeneratedAudio(null) // Clear previous audio

      if (!selectedVoice) {
        throw new Error("Please select a voice model first")
      }

      if (!text.trim()) {
        throw new Error("Please enter some text to generate audio")
      }

      console.log('Generating audio with settings:', voiceSettings)

      const params: GenerateAudioParams = {
        modelChoice: selectedVoice,
        text,
        language: 'en-us',
        emotion: {
          e1: 1.0,  // Happiness
          e2: 0.05, // Sadness
          e3: 0.05, // Disgust
          e4: 0.05, // Fear
          e5: 0.05, // Surprise
          e6: 0.05, // Anger
          e7: 0.1,  // Other
          e8: 0.2   // Neutral
        },
        vq_single: 0.78,
        fmax: 24000,
        pitch_std: 45.0,
        speaking_rate: voiceSettings.speed,
        dnsmos_ovrl: 4.0,
        speaker_noised: false,
        cfg_scale: 2.0,
        sampling: {
          top_p: 0.8,
          top_k: 50,
          min_p: 0.05,
          linear: voiceSettings.emotions.linear,
          confidence: voiceSettings.emotions.confidence,
          quadratic: voiceSettings.emotions.quadratic
        },
        seed: voiceSettings.emotions.seed,
        randomize_seed: voiceSettings.emotions.randomizeSeed,
        unconditional_keys: ['emotion']
      }

      console.log('Generating audio with params:', params)
      const result = await audioService.generateAudio(params)
      console.log('Audio generation successful')
      
      setGeneratedAudio(result)
      
      toast({
        title: "Success",
        description: "Audio generated successfully!",
      })

    } catch (error) {
      console.error('Error generating audio:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNewProject = () => {
    setText("Enter your script here. This text will be converted to speech when you click the play button.")
    setProjectName("Untitled Project")
    setSelectedVoice("emma")
    setVoiceSettings({
      speed: 1.0,
      pitch: 1.0,
      tone: 0.5,
      emotions: {
        linear: 0.5,
        confidence: 0.4,
        quadratic: 0.0,
        seed: 420,
        randomizeSeed: true
      }
    })
    setOutputSettings({
      format: "mp3",
      quality: "high",
      sampleRate: "44100",
    })
    setActiveTab("editor")
    toast({
      title: "New project created",
      description: "Started a new project",
    })
  }

  const handleSaveProject = () => {
    // Open save dialog
    setNewProjectName(projectName)
    setShowSaveDialog(true)
  }

  const confirmSaveProject = () => {
    // Simulate saving project
    setProjectName(newProjectName)
    setShowSaveDialog(false)

    // Show success toast
    toast({
      title: "Project saved",
      description: `${newProjectName} has been saved`,
      action: (
        <div className="flex items-center gap-1">
          <Save className="h-4 w-4" />
          <span>Saved</span>
        </div>
      ),
    })
  }

  const handleExport = () => {
    // Open export dialog
    setShowExportDialog(true)
    setExportProgress(0)
    setIsExporting(false)
  }

  const startExport = () => {
    // Simulate export process
    setIsExporting(true)
    setExportProgress(0)

    // Simulate progress with interval
    exportIntervalRef.current = setInterval(() => {
      setExportProgress((prev) => {
        const newProgress = prev + Math.random() * 15

        if (newProgress >= 100) {
          // Clear interval when done
          if (exportIntervalRef.current) {
            clearInterval(exportIntervalRef.current)
          }

          // Complete export after a short delay
          setTimeout(() => {
            setIsExporting(false)
            setShowExportDialog(false)

            // Show success toast
            toast({
              title: "Export successful",
              description: `${projectName}.${outputSettings.format} has been exported`,
              action: (
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>Downloaded</span>
                </div>
              ),
            })
          }, 500)

          return 100
        }

        return newProgress
      })
    }, 300)
  }

  // Clean up interval on unmount
  const cleanupExportInterval = () => {
    if (exportIntervalRef.current) {
      clearInterval(exportIntervalRef.current)
      exportIntervalRef.current = null
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewProject={handleNewProject}
        onShowHistory={() => setShowHistory(true)}
        onShowHelp={() => setShowHelp(true)}
        onShowLicense={() => setShowLicense(true)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          projectName={projectName}
          setProjectName={setProjectName}
          onSave={handleSaveProject}
          onExport={handleExport}
          onShowSettings={() => setShowSettings(true)}
          onShowHelp={() => setShowHelp(true)}
        />
        <div className="flex-1 overflow-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="editor">Text Editor</TabsTrigger>
              <TabsTrigger value="voice">Voice Settings</TabsTrigger>
              <TabsTrigger value="output">Output Settings</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-4">
              <TextEditor text={text} setText={setText} />
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleGenerateAudio} 
                  disabled={isGenerating || !text.trim()}
                >
                  {isGenerating ? "Generating..." : "Generate Audio"}
                </Button>
              </div>
              <AudioPreview 
                text={text} 
                voice={selectedVoice} 
                settings={voiceSettings} 
                generatedAudio={generatedAudio || undefined}
              />
            </TabsContent>
            <TabsContent value="voice" className="mt-4">
              <VoiceSelector
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                voiceSettings={voiceSettings}
                setVoiceSettings={setVoiceSettings}
              />
            </TabsContent>
            <TabsContent value="output" className="mt-4">
              <OutputSettings settings={outputSettings} setSettings={setOutputSettings} />
            </TabsContent>
            <TabsContent value="projects" className="mt-4">
              <ProjectManager
                currentProject={projectName}
                onLoad={(name) => {
                  setProjectName(name)
                  toast({
                    title: "Project loaded",
                    description: `${name} has been loaded`,
                  })
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Panels */}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onShowLicense={() => {
            setShowSettings(false)
            setShowLicense(true)
          }}
        />
      )}
      {showLicense && <LicensePanel onClose={() => setShowLicense(false)} />}

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Enter a name for your project. This will save all your text, voice settings, and output preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="project-name" className="text-right">
                Name
              </label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSaveProject} disabled={!newProjectName.trim()}>
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={showExportDialog}
        onOpenChange={(open) => {
          if (!open) {
            cleanupExportInterval()
          }
          setShowExportDialog(open)
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Audio</DialogTitle>
            <DialogDescription>
              Export your voiceover as a {outputSettings.format.toUpperCase()} file with {outputSettings.quality}{" "}
              quality.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Format: {outputSettings.format.toUpperCase()}</span>
                <span>Quality: {outputSettings.quality}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sample Rate: {outputSettings.sampleRate} Hz</span>
                <span>
                  Duration: ~{Math.max(1, Math.ceil(text.length / 100))}:
                  {Math.floor(Math.random() * 60)
                    .toString()
                    .padStart(2, "0")}
                </span>
              </div>
            </div>

            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing audio...</span>
                  <span>{Math.round(exportProgress)}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                cleanupExportInterval()
                setShowExportDialog(false)
              }}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button onClick={startExport} disabled={isExporting}>
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

