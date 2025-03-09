"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Download, HelpCircle, Settings } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

interface HeaderProps {
  projectName: string
  setProjectName: (name: string) => void
  onSave: () => void
  onExport: () => void
  onShowSettings: () => void
  onShowHelp: () => void
}

export default function Header({
  projectName,
  setProjectName,
  onSave,
  onExport,
  onShowSettings,
  onShowHelp,
}: HeaderProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <header className="border-b p-4 flex items-center justify-between bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">VoiceOver Pro</h1>
        {isEditing ? (
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
            className="w-48"
            autoFocus
          />
        ) : (
          <div className="text-lg font-medium cursor-pointer hover:underline" onClick={() => setIsEditing(true)}>
            {projectName}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onSave} title="Save Project">
          <Save className="h-4 w-4" />
          <span className="sr-only">Save</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onExport} title="Export Audio">
          <Download className="h-4 w-4" />
          <span className="sr-only">Export</span>
        </Button>
        <Button variant="outline" size="icon" title="Settings" onClick={onShowSettings}>
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
        <Button variant="outline" size="icon" title="Help" onClick={onShowHelp}>
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>
        <ModeToggle />
      </div>
    </header>
  )
}

