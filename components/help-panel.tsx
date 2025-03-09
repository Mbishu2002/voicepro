"use client"

import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Search, BookOpen, MessageSquare, FileQuestion, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

interface HelpPanelProps {
  onClose: () => void
}

export default function HelpPanel({ onClose }: HelpPanelProps) {
  return (
    <Card className="fixed right-0 top-0 h-screen w-96 z-50 rounded-none shadow-lg border-l">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-lg font-medium">Help & Support</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search help topics..." className="pl-8" />
        </div>

        <Tabs defaultValue="guides">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-6">
                <GuideSection
                  title="Getting Started"
                  icon={<BookOpen className="h-5 w-5" />}
                  content={
                    <div className="space-y-3">
                      <p>
                        Welcome to VoiceOver Pro! This guide will help you get started with creating your first
                        voiceover.
                      </p>

                      <h4 className="font-medium text-sm">Creating Your First Project</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>
                          Click the <strong>+</strong> button in the sidebar to create a new project
                        </li>
                        <li>Enter your script in the text editor</li>
                        <li>Select a voice from the Voice Settings tab</li>
                        <li>Click the play button to preview your voiceover</li>
                        <li>Adjust settings as needed</li>
                        <li>Export your audio using the download button in the header</li>
                      </ol>

                      <h4 className="font-medium text-sm">Interface Overview</h4>
                      <p className="text-sm">The interface is divided into several sections:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                          <strong>Sidebar</strong>: Quick access to main features
                        </li>
                        <li>
                          <strong>Text Editor</strong>: Where you write or paste your script
                        </li>
                        <li>
                          <strong>Voice Settings</strong>: Select and customize voices
                        </li>
                        <li>
                          <strong>Output Settings</strong>: Configure export options
                        </li>
                        <li>
                          <strong>Projects</strong>: Manage saved projects and templates
                        </li>
                      </ul>
                    </div>
                  }
                />

                <GuideSection
                  title="Voice Customization"
                  icon={<BookOpen className="h-5 w-5" />}
                  content={
                    <div className="space-y-3">
                      <p>
                        VoiceOver Pro offers extensive voice customization options to make your voiceovers sound exactly
                        how you want them.
                      </p>

                      <h4 className="font-medium text-sm">Selecting a Voice</h4>
                      <p className="text-sm">
                        Browse through our library of voices with different genders and accents. Click the play button
                        next to each voice to hear a sample.
                      </p>

                      <h4 className="font-medium text-sm">Adjusting Voice Parameters</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                          <strong>Speed</strong>: Control how fast or slow the voice speaks (0.5x to 2.0x)
                        </li>
                        <li>
                          <strong>Pitch</strong>: Adjust the voice pitch higher or lower (0.5 to 1.5)
                        </li>
                        <li>
                          <strong>Tone</strong>: Change the expressiveness of the voice (0% to 100%)
                        </li>
                      </ul>

                      <h4 className="font-medium text-sm">Tips for Natural-Sounding Speech</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Use a speed setting between 0.9x and 1.1x for most content</li>
                        <li>Subtle pitch adjustments (±0.1) can make a big difference</li>
                        <li>Higher tone values work well for enthusiastic content</li>
                        <li>Lower tone values are better for serious or formal content</li>
                      </ul>
                    </div>
                  }
                />

                <GuideSection
                  title="Using SSML"
                  icon={<BookOpen className="h-5 w-5" />}
                  content={
                    <div className="space-y-3">
                      <p>
                        Speech Synthesis Markup Language (SSML) gives you precise control over how your text is spoken.
                      </p>

                      <h4 className="font-medium text-sm">Common SSML Tags</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p>
                            <code>&lt;break time="1s"/&gt;</code>
                          </p>
                          <p className="text-muted-foreground">Adds a pause of 1 second (can use ms, s)</p>
                        </div>
                        <div>
                          <p>
                            <code>&lt;emphasis&gt;important text&lt;/emphasis&gt;</code>
                          </p>
                          <p className="text-muted-foreground">Emphasizes the enclosed text</p>
                        </div>
                        <div>
                          <p>
                            <code>&lt;prosody rate="slow"&gt;text&lt;/prosody&gt;</code>
                          </p>
                          <p className="text-muted-foreground">
                            Changes the speaking rate (slow, medium, fast, x-slow, x-fast)
                          </p>
                        </div>
                        <div>
                          <p>
                            <code>&lt;prosody pitch="high"&gt;text&lt;/prosody&gt;</code>
                          </p>
                          <p className="text-muted-foreground">Changes the pitch (low, medium, high, x-low, x-high)</p>
                        </div>
                        <div>
                          <p>
                            <code>&lt;say-as interpret-as="characters"&gt;ABC&lt;/say-as&gt;</code>
                          </p>
                          <p className="text-muted-foreground">Spells out the text character by character</p>
                        </div>
                      </div>

                      <h4 className="font-medium text-sm">Using the SSML Editor</h4>
                      <p className="text-sm">
                        Switch to the SSML tab in the text editor to write or edit SSML directly. You can also use the
                        formatting buttons above the editor to insert common SSML tags.
                      </p>
                    </div>
                  }
                />

                <GuideSection
                  title="Export Settings"
                  icon={<BookOpen className="h-5 w-5" />}
                  content={
                    <div className="space-y-3">
                      <p>Configure how your audio files are exported to get the best quality for your needs.</p>

                      <h4 className="font-medium text-sm">File Formats</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                          <strong>MP3</strong>: Compressed format, smaller file size, good for most uses
                        </li>
                        <li>
                          <strong>WAV</strong>: Uncompressed format, highest quality, larger file size
                        </li>
                        <li>
                          <strong>OGG</strong>: Compressed format with good quality-to-size ratio
                        </li>
                      </ul>

                      <h4 className="font-medium text-sm">Quality Settings</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                          <strong>Low (64 kbps)</strong>: Smallest file size, acceptable quality
                        </li>
                        <li>
                          <strong>Medium (128 kbps)</strong>: Good balance of quality and size
                        </li>
                        <li>
                          <strong>High (192 kbps)</strong>: Better quality, recommended for most YouTube videos
                        </li>
                        <li>
                          <strong>Very High (320 kbps)</strong>: Best quality, larger file size
                        </li>
                      </ul>

                      <h4 className="font-medium text-sm">Sample Rate</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                          <strong>22.05 kHz</strong>: Sufficient for speech, smallest file size
                        </li>
                        <li>
                          <strong>44.1 kHz</strong>: Standard CD quality, recommended for most uses
                        </li>
                        <li>
                          <strong>48 kHz</strong>: Professional audio standard, best for video production
                        </li>
                      </ul>

                      <h4 className="font-medium text-sm">Advanced Processing</h4>
                      <p className="text-sm">
                        Use the Processing tab to configure normalization and silence handling for your exports.
                      </p>
                    </div>
                  }
                />

                <GuideSection
                  title="Project Management"
                  icon={<BookOpen className="h-5 w-5" />}
                  content={
                    <div className="space-y-3">
                      <p>Efficiently manage your voiceover projects and templates.</p>

                      <h4 className="font-medium text-sm">Saving Projects</h4>
                      <p className="text-sm">
                        Click the save button in the header to save your current project. Projects save all text, voice
                        selections, and settings.
                      </p>

                      <h4 className="font-medium text-sm">Loading Projects</h4>
                      <p className="text-sm">
                        Go to the Projects tab to view and load your saved projects. Click on a project to load it.
                      </p>

                      <h4 className="font-medium text-sm">Using Templates</h4>
                      <p className="text-sm">
                        Templates are pre-configured settings for specific types of content. Use them as starting points
                        for new projects.
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to the Projects tab</li>
                        <li>Find a template in the Templates section</li>
                        <li>Click "Use" to apply the template to your current project</li>
                      </ol>

                      <h4 className="font-medium text-sm">Creating Templates</h4>
                      <p className="text-sm">To create a template from your current project:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Configure your voice and output settings</li>
                        <li>Go to the Projects tab</li>
                        <li>Click "Create New Template"</li>
                        <li>Enter a name and description for your template</li>
                      </ol>
                    </div>
                  }
                />

                <GuideSection
                  title="Keyboard Shortcuts"
                  icon={<BookOpen className="h-5 w-5" />}
                  content={
                    <div className="space-y-3">
                      <p>Speed up your workflow with these keyboard shortcuts.</p>

                      <h4 className="font-medium text-sm">General</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Ctrl+N / ⌘+N</div>
                        <div>New project</div>
                        <div>Ctrl+S / ⌘+S</div>
                        <div>Save project</div>
                        <div>Ctrl+E / ⌘+E</div>
                        <div>Export audio</div>
                        <div>Ctrl+, / ⌘+,</div>
                        <div>Open settings</div>
                        <div>F1</div>
                        <div>Open help</div>
                      </div>

                      <h4 className="font-medium text-sm">Text Editor</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Ctrl+B / ⌘+B</div>
                        <div>Insert emphasis tag</div>
                        <div>Ctrl+I / ⌘+I</div>
                        <div>Insert prosody tag</div>
                        <div>Ctrl+Space</div>
                        <div>Insert pause</div>
                      </div>

                      <h4 className="font-medium text-sm">Audio Preview</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Space</div>
                        <div>Play/Pause</div>
                        <div>Left Arrow</div>
                        <div>Skip back 10 seconds</div>
                        <div>Right Arrow</div>
                        <div>Skip forward 10 seconds</div>
                        <div>Up/Down Arrow</div>
                        <div>Adjust volume</div>
                      </div>
                    </div>
                  }
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="faq" className="mt-0">
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-6">
                <FaqItem
                  question="How do I change the voice accent?"
                  answer={
                    <div className="space-y-2">
                      <p>To change the voice accent:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Go to the Voice Settings tab by clicking the microphone icon in the sidebar</li>
                        <li>Browse through the available voices in the Voice Selection panel</li>
                        <li>Each voice shows its accent (American, British, Australian, etc.)</li>
                        <li>Click on a voice to select it</li>
                        <li>Use the play button next to each voice to hear a sample before selecting</li>
                      </ol>
                      <p>
                        You can further customize the selected voice using the Voice Customization panel on the right.
                      </p>
                    </div>
                  }
                />

                <FaqItem
                  question="Can I add custom pauses in my voiceover?"
                  answer={
                    <div className="space-y-2">
                      <p>Yes, there are several ways to add pauses to your voiceover:</p>
                      <h4 className="font-medium">Method 1: Using the pause button</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Place your cursor where you want to add a pause</li>
                        <li>Click the pause button (icon with two vertical lines) in the text editor toolbar</li>
                        <li>
                          This will insert a <code>&lt;break time="1s"/&gt;</code> SSML tag
                        </li>
                      </ol>

                      <h4 className="font-medium">Method 2: Using SSML directly</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Switch to the SSML tab in the text editor</li>
                        <li>
                          Add a break tag where you want the pause: <code>&lt;break time="2s"/&gt;</code>
                        </li>
                        <li>You can customize the duration by changing the time value (e.g., "500ms", "1s", "2.5s")</li>
                      </ol>

                      <p>
                        For natural-sounding speech, shorter pauses (300-500ms) work well for commas, while longer
                        pauses (1s) are better for periods and paragraph breaks.
                      </p>
                    </div>
                  }
                />

                <FaqItem
                  question="What audio formats are supported for export?"
                  answer={
                    <div className="space-y-2">
                      <p>VoiceOver Pro supports the following audio export formats:</p>

                      <h4 className="font-medium">MP3 (MPEG Layer-3)</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Compressed format with excellent compatibility</li>
                        <li>Smaller file sizes, ideal for web use and most YouTube videos</li>
                        <li>Quality options from 64 kbps to 320 kbps</li>
                        <li>Best for: Most YouTube videos, podcasts, and general use</li>
                      </ul>

                      <h4 className="font-medium">WAV (Waveform Audio)</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Uncompressed format with the highest quality</li>
                        <li>Larger file sizes</li>
                        <li>Lossless audio quality</li>
                        <li>Best for: Professional video production, further audio editing</li>
                      </ul>

                      <h4 className="font-medium">OGG (Ogg Vorbis)</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Open-source compressed format</li>
                        <li>Good balance of quality and file size</li>
                        <li>Less common but high-quality compression</li>
                        <li>Best for: Web applications, game development</li>
                      </ul>

                      <p>
                        To change the export format, go to the Output Settings tab and select your preferred format
                        under "File Format".
                      </p>
                    </div>
                  }
                />

                <FaqItem
                  question="How do I emphasize specific words in my voiceover?"
                  answer={
                    <div className="space-y-2">
                      <p>There are two main ways to emphasize specific words in your voiceover:</p>

                      <h4 className="font-medium">Method 1: Using the emphasis button</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Select the word or phrase you want to emphasize in the text editor</li>
                        <li>Click the emphasis button (bold icon) in the text editor toolbar</li>
                        <li>
                          This will wrap your selected text in <code>&lt;emphasis&gt;</code> tags
                        </li>
                      </ol>

                      <h4 className="font-medium">Method 2: Using SSML directly</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Switch to the SSML tab in the text editor</li>
                        <li>Wrap the text you want to emphasize with emphasis tags:</li>
                        <li>
                          <code>&lt;emphasis level="strong"&gt;important words&lt;/emphasis&gt;</code>
                        </li>
                      </ol>

                      <p>You can also control the level of emphasis using the level attribute:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <code>level="reduced"</code> - Slightly less emphasis than normal
                        </li>
                        <li>
                          <code>level="moderate"</code> - Default emphasis level
                        </li>
                        <li>
                          <code>level="strong"</code> - Strong emphasis
                        </li>
                      </ul>

                      <p>
                        For even more control, you can use the <code>&lt;prosody&gt;</code> tag to adjust pitch, rate,
                        and volume for specific parts of your text.
                      </p>
                    </div>
                  }
                />

                <FaqItem
                  question="Can I save my voice settings for future use?"
                  answer={
                    <div className="space-y-2">
                      <p>Yes, you can save your voice settings in two ways:</p>

                      <h4 className="font-medium">Method 1: Save as part of a project</h4>
                      <p>When you save a project, all voice settings are saved with it:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Configure your voice settings as desired</li>
                        <li>Click the Save button in the header</li>
                        <li>Enter a name for your project</li>
                        <li>All settings will be saved and can be loaded later from the Projects tab</li>
                      </ol>

                      <h4 className="font-medium">Method 2: Save as a template</h4>
                      <p>Templates are ideal for reusing settings across multiple projects:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Configure your voice settings as desired</li>
                        <li>Go to the Projects tab</li>
                        <li>Click "Create New Template" at the bottom of the Templates section</li>
                        <li>Enter a name and description for your template</li>
                        <li>Your voice settings will be saved as a template that can be applied to any new project</li>
                      </ol>

                      <p>
                        You can also set default voice settings in the Settings panel that will be applied to all new
                        projects.
                      </p>
                    </div>
                  }
                />

                <FaqItem
                  question="How can I make my voiceover sound more natural?"
                  answer={
                    <div className="space-y-2">
                      <p>Here are several techniques to make your AI voiceovers sound more natural:</p>

                      <h4 className="font-medium">1. Use punctuation strategically</h4>
                      <p>Proper punctuation helps create natural speech patterns:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Use commas for short pauses</li>
                        <li>Use periods for longer pauses</li>
                        <li>Use question marks to create rising intonation</li>
                      </ul>

                      <h4 className="font-medium">2. Add strategic pauses</h4>
                      <p>
                        Insert <code>&lt;break&gt;</code> tags to create natural pauses:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Short pauses (300ms) between phrases</li>
                        <li>Medium pauses (500-800ms) between sentences</li>
                        <li>Longer pauses (1-2s) between paragraphs or topics</li>
                      </ul>

                      <h4 className="font-medium">3. Adjust speed for different content</h4>
                      <p>Vary the speaking rate for different parts of your script:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Slow down for important information (0.9x speed)</li>
                        <li>Speed up for less important details (1.1x speed)</li>
                        <li>
                          Use <code>&lt;prosody rate="x"&gt;</code> tags for specific sections
                        </li>
                      </ul>

                      <h4 className="font-medium">4. Use emphasis appropriately</h4>
                      <p>Emphasize key words to create natural speech patterns:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Emphasize important nouns and verbs</li>
                        <li>Avoid emphasizing too many words in a row</li>
                        <li>
                          Use <code>&lt;emphasis&gt;</code> tags sparingly for maximum effect
                        </li>
                      </ul>

                      <h4 className="font-medium">5. Write conversationally</h4>
                      <p>Structure your text in a conversational way:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Use contractions (don't, can't, we're)</li>
                        <li>Keep sentences relatively short</li>
                        <li>Vary sentence length and structure</li>
                        <li>Read your script aloud to check for natural flow</li>
                      </ul>
                    </div>
                  }
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t">
          <Button className="w-full" variant="default">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface GuideSectionProps {
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

function GuideSection({ title, icon, content }: GuideSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-md overflow-hidden">
      <div
        className="flex items-start gap-3 p-3 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="mt-0.5 text-primary">{icon}</div>
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          {!isExpanded && <p className="text-sm text-muted-foreground">Click to expand</p>}
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ArrowRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </Button>
      </div>

      {isExpanded && <div className="p-3 border-t bg-background">{content}</div>}
    </div>
  )
}

interface FaqItemProps {
  question: string
  answer: React.ReactNode
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-md overflow-hidden">
      <div
        className="flex items-start gap-3 p-3 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="mt-0.5 text-primary">
          <FileQuestion className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="font-medium">{question}</div>
          {!isExpanded && <p className="text-sm text-muted-foreground">Click to view answer</p>}
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ArrowRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </Button>
      </div>

      {isExpanded && <div className="p-3 border-t bg-background text-sm">{answer}</div>}
    </div>
  )
}

