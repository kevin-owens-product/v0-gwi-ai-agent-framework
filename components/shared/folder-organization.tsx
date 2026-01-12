"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Folder,
  FolderPlus,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Edit2,
  Trash2,
  Users,
  Table2,
  Star,
  Archive,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FolderItem {
  id: string
  name: string
  color: string
  parentId: string | null
  itemCount: number
  isExpanded?: boolean
}

interface ResourceItem {
  id: string
  name: string
  type: "audience" | "crosstab"
  folderId: string | null
  tags: string[]
  isFavorite: boolean
  isArchived: boolean
}

interface FolderOrganizationProps {
  folders: FolderItem[]
  items: ResourceItem[]
  selectedFolder: string | null
  onSelectFolder: (folderId: string | null) => void
  onCreateFolder?: (name: string, parentId: string | null, color: string) => void
  onRenameFolder?: (folderId: string, name: string) => void
  onDeleteFolder?: (folderId: string) => void
  onMoveItems?: (itemIds: string[], folderId: string | null) => void
  className?: string
}

const folderColors = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
]

export function FolderOrganization({
  folders: initialFolders,
  items,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveItems: _onMoveItems,
  className,
}: FolderOrganizationProps) {
  const [folders, setFolders] = useState<FolderItem[]>(initialFolders)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderColor, setNewFolderColor] = useState(folderColors[0].value)
  const [createInFolder, setCreateInFolder] = useState<string | null>(null)

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return

    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      color: newFolderColor,
      parentId: createInFolder,
      itemCount: 0,
    }

    setFolders([...folders, newFolder])
    onCreateFolder?.(newFolderName, createInFolder, newFolderColor)
    setShowCreateDialog(false)
    setNewFolderName("")
    setCreateInFolder(null)
  }

  const handleRenameFolder = (folderId: string) => {
    if (!newFolderName.trim()) return

    setFolders(folders.map(f => {
      if (f.id === folderId) {
        return { ...f, name: newFolderName }
      }
      return f
    }))
    onRenameFolder?.(folderId, newFolderName)
    setShowRenameDialog(null)
    setNewFolderName("")
  }

  const handleDeleteFolder = (folderId: string) => {
    setFolders(folders.filter(f => f.id !== folderId && f.parentId !== folderId))
    onDeleteFolder?.(folderId)
    if (selectedFolder === folderId) {
      onSelectFolder(null)
    }
  }

  // Get folder counts
  const getFolderItemCount = (folderId: string) => {
    return items.filter(i => i.folderId === folderId).length
  }

  // Build folder tree
  const rootFolders = folders.filter(f => f.parentId === null)
  const getChildFolders = (parentId: string) => folders.filter(f => f.parentId === parentId)

  // Render folder item
  const FolderTreeItem = ({ folder, depth = 0 }: { folder: FolderItem; depth?: number }) => {
    const children = getChildFolders(folder.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = selectedFolder === folder.id
    const itemCount = getFolderItemCount(folder.id)

    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
            isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted",
            depth > 0 && "ml-4"
          )}
          onClick={() => onSelectFolder(folder.id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(folder.id)
              }}
              className="p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {isExpanded ? (
            <FolderOpen className="h-4 w-4" style={{ color: folder.color }} />
          ) : (
            <Folder className="h-4 w-4" style={{ color: folder.color }} />
          )}

          <span className="flex-1 truncate text-sm">{folder.name}</span>

          <Badge variant="secondary" className="text-xs">
            {itemCount}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setCreateInFolder(folder.id)
                setShowCreateDialog(true)
              }}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setShowRenameDialog(folder.id)
                setNewFolderName(folder.name)
              }}>
                <Edit2 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteFolder(folder.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {children.map(child => (
              <FolderTreeItem key={child.id} folder={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Count items
  const allItemsCount = items.filter(i => !i.isArchived).length
  const favoritesCount = items.filter(i => i.isFavorite && !i.isArchived).length
  const archivedCount = items.filter(i => i.isArchived).length
  const unfolderedCount = items.filter(i => i.folderId === null && !i.isArchived).length

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Folders
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCreateInFolder(null)
            setShowCreateDialog(true)
          }}
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="space-y-1">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
            selectedFolder === null ? "bg-primary/10 text-primary" : "hover:bg-muted"
          )}
          onClick={() => onSelectFolder(null)}
        >
          <Users className="h-4 w-4" />
          <span className="flex-1 text-sm">All Items</span>
          <Badge variant="secondary" className="text-xs">{allItemsCount}</Badge>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
            selectedFolder === "favorites" ? "bg-primary/10 text-primary" : "hover:bg-muted"
          )}
          onClick={() => onSelectFolder("favorites")}
        >
          <Star className="h-4 w-4 text-amber-500" />
          <span className="flex-1 text-sm">Favorites</span>
          <Badge variant="secondary" className="text-xs">{favoritesCount}</Badge>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
            selectedFolder === "unfoldered" ? "bg-primary/10 text-primary" : "hover:bg-muted"
          )}
          onClick={() => onSelectFolder("unfoldered")}
        >
          <Table2 className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-sm">Unorganized</span>
          <Badge variant="secondary" className="text-xs">{unfolderedCount}</Badge>
        </div>

        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
            selectedFolder === "archived" ? "bg-primary/10 text-primary" : "hover:bg-muted"
          )}
          onClick={() => onSelectFolder("archived")}
        >
          <Archive className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-sm">Archived</span>
          <Badge variant="secondary" className="text-xs">{archivedCount}</Badge>
        </div>
      </div>

      {/* Folder Tree */}
      {rootFolders.length > 0 && (
        <div className="space-y-1 pt-2 border-t">
          {rootFolders.map(folder => (
            <FolderTreeItem key={folder.id} folder={folder} />
          ))}
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              {createInFolder
                ? `Create a subfolder inside "${folders.find(f => f.id === createInFolder)?.name}"`
                : "Create a new folder to organize your items"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Q1 2024 Campaigns"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {folderColors.map((color) => (
                  <button
                    key={color.value}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      newFolderColor === color.value && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewFolderColor(color.value)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={!!showRenameDialog} onOpenChange={() => setShowRenameDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Folder Name</Label>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => showRenameDialog && handleRenameFolder(showRenameDialog)}
              disabled={!newFolderName.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
