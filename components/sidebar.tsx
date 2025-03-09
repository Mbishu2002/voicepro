"use client"

import { Button } from "@/components/ui/button"
import { FileText, Mic, Settings, FolderOpen, HelpCircle, Plus, History, Key } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onNewProject: () => void
  onShowHistory: () => void
  onShowHelp: () => void
  onShowLicense: () => void
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onNewProject,
  onShowHistory,
  onShowHelp,
  onShowLicense,
}: SidebarProps) {
  return (
    <div className="w-16 border-r bg-muted/40 flex flex-col items-center py-4 gap-4">
      <Button variant="ghost" size="icon" className="rounded-full" onClick={onNewProject}>
        <Plus className="h-5 w-5" />
        <span className="sr-only">New Project</span>
      </Button>
      <div className="w-full h-px bg-border my-2" />
      <Button
        variant={activeTab === "editor" ? "secondary" : "ghost"}
        size="icon"
        className="rounded-full"
        onClick={() => setActiveTab("editor")}
      >
        <FileText className="h-5 w-5" />
        <span className="sr-only">Text Editor</span>
      </Button>
      <Button
        variant={activeTab === "voice" ? "secondary" : "ghost"}
        size="icon"
        className="rounded-full"
        onClick={() => setActiveTab("voice")}
      >
        <Mic className="h-5 w-5" />
        <span className="sr-only">Voice Settings</span>
      </Button>
      <Button
        variant={activeTab === "output" ? "secondary" : "ghost"}
        size="icon"
        className="rounded-full"
        onClick={() => setActiveTab("output")}
      >
        <Settings className="h-5 w-5" />
        <span className="sr-only">Output Settings</span>
      </Button>
      <Button
        variant={activeTab === "projects" ? "secondary" : "ghost"}
        size="icon"
        className="rounded-full"
        onClick={() => setActiveTab("projects")}
      >
        <FolderOpen className="h-5 w-5" />
        <span className="sr-only">Projects</span>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full" onClick={onShowHistory}>
        <History className="h-5 w-5" />
        <span className="sr-only">History</span>
      </Button>
      <div className="flex-1" />
      <Button variant="ghost" size="icon" className="rounded-full" onClick={onShowLicense}>
        <Key className="h-5 w-5" />
        <span className="sr-only">License</span>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full" onClick={onShowHelp}>
        <HelpCircle className="h-5 w-5" />
        <span className="sr-only">Help</span>
      </Button>
    </div>
  )
}

