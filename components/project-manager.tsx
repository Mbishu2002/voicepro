"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FolderOpen, Save, Trash2, Copy } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface ProjectManagerProps {
  currentProject: string
  onLoad: (name: string) => void
}

export default function ProjectManager({ currentProject, onLoad }: ProjectManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateDescription, setNewTemplateDescription] = useState("")
  const { toast } = useToast()

  // Sample project data
  const [projects, setProjects] = useState([
    { id: 1, name: "Product Review", date: "2023-11-15", duration: "01:45" },
    { id: 2, name: "Tutorial Intro", date: "2023-11-10", duration: "03:22" },
    { id: 3, name: "Channel Update", date: "2023-11-05", duration: "00:58" },
    { id: 4, name: "Gaming Commentary", date: "2023-10-28", duration: "05:12" },
    { id: 5, name: "Travel Vlog Narration", date: "2023-10-20", duration: "02:34" },
  ])

  const filteredProjects = projects.filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleDeleteProject = (id: number) => {
    setProjectToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDeleteProject = () => {
    if (projectToDelete !== null) {
      const projectName = projects.find((p) => p.id === projectToDelete)?.name || "Project"
      setProjects(projects.filter((project) => project.id !== projectToDelete))
      setShowDeleteDialog(false)
      setProjectToDelete(null)

      toast({
        title: "Project deleted",
        description: `${projectName} has been permanently deleted`,
        variant: "destructive",
      })
    }
  }

  const handleDuplicateProject = (project: any) => {
    const newProject = {
      ...project,
      id: Math.max(...projects.map((p) => p.id)) + 1,
      name: `${project.name} (Copy)`,
      date: new Date().toISOString().split("T")[0],
    }

    setProjects([newProject, ...projects])
    toast({
      title: "Project duplicated",
      description: `Created a copy of ${project.name}`,
    })
  }

  const handleCreateTemplate = () => {
    setShowCreateTemplateDialog(true)
  }

  const confirmCreateTemplate = () => {
    setShowCreateTemplateDialog(false)
    toast({
      title: "Template created",
      description: `${newTemplateName} template has been created`,
    })
    setNewTemplateName("")
    setNewTemplateDescription("")
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Recent Projects</h3>

          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer ${
                    project.name === currentProject ? "bg-muted" : ""
                  }`}
                  onClick={() => onLoad(project.name)}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {project.date} • {project.duration}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateProject(project)
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">No projects found</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Templates</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Product Review</div>
                  <div className="text-xs text-muted-foreground">Standard template for product reviews</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onLoad("Product Review")
                  toast({
                    title: "Template applied",
                    description: "Product Review template has been applied",
                  })
                }}
              >
                Use
              </Button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Tutorial</div>
                  <div className="text-xs text-muted-foreground">Step-by-step tutorial narration</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onLoad("Tutorial")
                  toast({
                    title: "Template applied",
                    description: "Tutorial template has been applied",
                  })
                }}
              >
                Use
              </Button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">News Update</div>
                  <div className="text-xs text-muted-foreground">Formal news-style voiceover</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onLoad("News Update")
                  toast({
                    title: "Template applied",
                    description: "News Update template has been applied",
                  })
                }}
              >
                Use
              </Button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer">
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Gaming Commentary</div>
                  <div className="text-xs text-muted-foreground">Energetic gaming video narration</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onLoad("Gaming Commentary")
                  toast({
                    title: "Template applied",
                    description: "Gaming Commentary template has been applied",
                  })
                }}
              >
                Use
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={handleCreateTemplate}>
              Create New Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>
              Create a template from your current settings. Templates can be applied to new projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="template-name" className="text-right">
                Name
              </label>
              <Input
                id="template-name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="template-description" className="text-right">
                Description
              </label>
              <Input
                id="template-description"
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                className="col-span-3"
                placeholder="Brief description of this template"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreateTemplate} disabled={!newTemplateName.trim()}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProject}>
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

