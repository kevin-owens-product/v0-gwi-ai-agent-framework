"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Save, Loader2, Trash2 } from "lucide-react"

interface Category {
  id: string
  name: string
  code: string
  description: string | null
  parentId: string | null
  version: number
  isActive: boolean
  orgId: string | null
}

interface ParentCategory {
  id: string
  name: string
  code: string
}

interface CategoryEditorProps {
  category?: Category
  parentCategories?: ParentCategory[]
  defaultParentId?: string
}

export function CategoryEditor({
  category,
  parentCategories = [],
  defaultParentId
}: CategoryEditorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: category?.name || "",
    code: category?.code || "",
    description: category?.description || "",
    parentId: category?.parentId || defaultParentId || "",
    isActive: category?.isActive ?? true,
    isGlobal: category?.orgId === null,
  })

  // Auto-generate code from name if creating new category
  useEffect(() => {
    if (!category && formData.name && !formData.code) {
      const generatedCode = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .substring(0, 32)
      setFormData((prev) => ({ ...prev, code: generatedCode }))
    }
  }, [category, formData.name, formData.code])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters"
    }

    if (!formData.code.trim()) {
      newErrors.code = "Code is required"
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = "Code must contain only uppercase letters, numbers, and underscores"
    } else if (formData.code.length > 32) {
      newErrors.code = "Code must be less than 32 characters"
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const url = category
        ? `/api/gwi/taxonomy/categories/${category.id}`
        : "/api/gwi/taxonomy/categories"
      const method = category ? "PATCH" : "POST"

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description.trim() || null,
        parentId: formData.parentId || null,
        isActive: formData.isActive,
        isGlobal: formData.isGlobal,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        if (!category) {
          router.push(`/gwi/taxonomy/categories/${data.id}`)
        } else {
          router.refresh()
        }
      } else {
        const errorData = await response.json()
        if (errorData.error) {
          if (errorData.error.includes("code")) {
            setErrors({ code: errorData.error })
          } else {
            setErrors({ form: errorData.error })
          }
        }
      }
    } catch (error) {
      console.error("Failed to save category:", error)
      setErrors({ form: "Failed to save category. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!category) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/gwi/taxonomy/categories/${category.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/gwi/taxonomy")
      } else {
        const errorData = await response.json()
        setErrors({ form: errorData.error || "Failed to delete category" })
      }
    } catch (error) {
      console.error("Failed to delete category:", error)
      setErrors({ form: "Failed to delete category. Please try again." })
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter out current category and its descendants from parent options
  const availableParents = parentCategories.filter((p) => p.id !== category?.id)

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{category ? "Edit Category" : "Create Category"}</CardTitle>
          <CardDescription>
            {category
              ? "Update the category settings and configuration"
              : "Set up a new taxonomy category"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.form && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {errors.form}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Demographics, Media Consumption"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">
              Category Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g., DEMOGRAPHICS, MEDIA_CONSUMPTION"
              className={`font-mono ${errors.code ? "border-red-500" : ""}`}
              disabled={!!category}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Unique identifier. Uppercase letters, numbers, and underscores only.
              {category && " Cannot be changed after creation."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what this category represents..."
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Category</Label>
            <Select
              value={formData.parentId}
              onValueChange={(value) =>
                setFormData({ ...formData, parentId: value === "none" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (top-level category)</SelectItem>
                {availableParents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name} ({parent.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Organize categories in a hierarchical structure
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Inactive categories are hidden from selection menus
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isGlobal">Global Category</Label>
              <p className="text-sm text-muted-foreground">
                Global categories are available across all organizations
              </p>
            </div>
            <Switch
              id="isGlobal"
              checked={formData.isGlobal}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isGlobal: checked })
              }
            />
          </div>

          {category && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Current Version: {category.version}
              </p>
            </div>
          )}

          <div className="flex justify-between gap-2 pt-4">
            <div>
              {category && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Category
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{category.name}&quot;? This
                        action cannot be undone. All associated attributes and
                        child categories will also be deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {category ? "Save Changes" : "Create Category"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
