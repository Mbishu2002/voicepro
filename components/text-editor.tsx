"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, Pause, Code } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TextEditorProps {
  text: string
  setText: (text: string) => void
}

export default function TextEditor({ text, setText }: TextEditorProps) {
  const { toast } = useToast()

  const insertSSML = (tag: string) => {
    // Simple function to wrap selected text with SSML tags
    const textarea = document.querySelector("textarea")
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)

    let newTag = ""
    switch (tag) {
      case "pause":
        newTag = `<break time="1s"/>`
        break
      case "emphasis":
        newTag = `<emphasis>${selectedText}</emphasis>`
        break
      case "code":
        newTag = `<say-as interpret-as="characters">${selectedText}</say-as>`
        break
      default:
        newTag = `<${tag}>${selectedText}</${tag}>`
    }

    const newText = text.substring(0, start) + (selectedText ? newTag : newTag) + text.substring(end)

    setText(newText)

    // Show toast notification
    toast({
      title: "SSML tag added",
      description: `Added ${tag} tag to your text`,
      duration: 2000,
    })
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <Tabs defaultValue="text">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="ssml">SSML</TabsTrigger>
            </TabsList>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => insertSSML("pause")} title="Add pause">
                <Pause className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => insertSSML("emphasis")} title="Add emphasis">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => insertSSML("prosody")} title="Add prosody">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => insertSSML("code")} title="Add character spelling">
                <Code className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => insertSSML("p")} title="Add paragraph">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <TabsContent value="text" className="mt-0">
            <Textarea
              placeholder="Enter your script here..."
              className="min-h-[300px] font-sans text-base resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="ssml" className="mt-0">
            <Textarea
              placeholder="Enter your SSML-enhanced script here..."
              className="min-h-[300px] font-mono text-sm resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use SSML tags to control pronunciation, pauses, and emphasis. Example: &lt;break time="1s"/&gt; for a
              pause.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

