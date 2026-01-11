"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Folder, Calendar, Users, MoreHorizontal, Bot, FileText, Workflow, Archive, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Project {
  id: string
  name: string
  description: string
  status: string
  createdAt: string
  members: number
  workflows: number
  reports: number
  agents: number
}

const initialProjects: Project[] = [
  {
    id: "gen-z-sustainability",
    name: "Gen Z Sustainability",
    description: "Research project exploring Gen Z attitudes towards sustainable brands and eco-friendly products",
    status: "active",
    createdAt: "2024-01-15",
    members: 4,
    workflows: 8,
    reports: 12,
    agents: 5,
  },
  {
    id: "q4-campaign",
    name: "Q4 Campaign",
    description: "Holiday season marketing campaign analysis and audience targeting strategy",
    status: "active",
    createdAt: "2024-02-20",
    members: 6,
    workflows: 15,
    reports: 23,
    agents: 8,
  },
  {
    id: "market-expansion",
    name: "Market Expansion",
    description: "Research initiative for expanding into new geographic markets in APAC region",
    status: "active",
    createdAt: "2024-03-10",
    members: 3,
    workflows: 5,
    reports: 7,
    agents: 4,
  },
  {
    id: "brand-health-tracker",
    name: "Brand Health Tracker",
    description: "Ongoing brand perception and awareness monitoring across key demographics",
    status: "completed",
    createdAt: "2023-11-01",
    members: 5,
    workflows: 20,
    reports: 45,
    agents: 6,
  },
  {
    id: "competitor-analysis-2024",
    name: "Competitor Analysis 2024",
    description: "Annual competitive landscape review and market positioning study",
    status: "archived",
    createdAt: "2024-01-05",
    members: 2,
    workflows: 10,
    reports: 15,
    agents: 3,
  },
]

export default function ProjectsPage() {
  const _router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: newProjectName,
      description: newProjectDescription,
      status: "active",
      createdAt: new Date().toISOString().split('T')[0],
      members: 1,
      workflows: 0,
      reports: 0,
      agents: 0,
    }
    setProjects(prev => [newProject, ...prev])
    setNewProjectName("")
    setNewProjectDescription("")
    setIsCreateOpen(false)
  }

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setProjectToEdit(project)
    setEditName(project.name)
    setEditDescription(project.description)
    setIsEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!projectToEdit || !editName.trim()) return

    setProjects(prev =>
      prev.map(p =>
        p.id === projectToEdit.id
          ? { ...p, name: editName, description: editDescription }
          : p
      )
    )
    setIsEditOpen(false)
    setProjectToEdit(null)
  }

  const handleArchiveProject = (project: Project, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setProjects(prev =>
      prev.map(p =>
        p.id === project.id
          ? { ...p, status: p.status === "archived" ? "active" : "archived" }
          : p
      )
    )
  }

  const handleDeleteProject = (project: Project, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id))
    }
    setDeleteDialogOpen(false)
    setProjectToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Organize your research and workflows into projects</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new project to organize your workflows, reports, and agents.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project"
                  rows={3}
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
            <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Folder className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            project.status === "active"
                              ? "default"
                              : project.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => handleEditProject(project, e)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleArchiveProject(project, e)}>
                        <Archive className="h-4 w-4 mr-2" />
                        {project.status === "archived" ? "Unarchive" : "Archive"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => handleDeleteProject(project, e)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {project.members}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Workflow className="h-3.5 w-3.5" />
                    {project.workflows} workflows
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    {project.reports} reports
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Bot className="h-3.5 w-3.5" />
                    {project.agents} agents
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Folder className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or create a new project.</p>
        </div>
      )}

      {/* Edit Project Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter project name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe your project"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This will also delete all associated workflows, reports, and agents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
