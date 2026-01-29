"use client"
/* eslint-disable local/no-hardcoded-strings */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Edit } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface AutoMapping {
  id: string
  surveyId: string | null
  questionId: string | null
  sourcePattern: string
  targetCategoryCode: string
  targetAttributeCode: string | null
  transformation: Record<string, unknown> | null
  confidence: number
  isActive: boolean
  createdAt: string
}

interface Category {
  id: string
  name: string
  code: string
}

export default function TaxonomyAutoMappingPage() {
  const [mappings, setMappings] = useState<AutoMapping[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMapping, setEditingMapping] = useState<AutoMapping | null>(null)

  const [formData, setFormData] = useState({
    surveyId: "",
    questionId: "",
    sourcePattern: "",
    targetCategoryCode: "",
    targetAttributeCode: "",
    transformation: "",
    confidence: 1.0,
    isActive: true,
  })

  useEffect(() => {
    fetchMappings()
    fetchCategories()
  }, [])

  const fetchMappings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/gwi/taxonomy/auto-mapping")
      if (response.ok) {
        const data = await response.json()
        setMappings(data)
      }
    } catch (error) {
      console.error("Failed to fetch mappings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/gwi/taxonomy/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingMapping
      ? `/api/gwi/taxonomy/auto-mapping/${editingMapping.id}`
      : "/api/gwi/taxonomy/auto-mapping"
    const method = editingMapping ? "PATCH" : "POST"

    let transformation = null
    if (formData.transformation) {
      try {
        transformation = JSON.parse(formData.transformation)
      } catch {
        alert("Invalid JSON in transformation field")
        return
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: formData.surveyId || null,
          questionId: formData.questionId || null,
          sourcePattern: formData.sourcePattern,
          targetCategoryCode: formData.targetCategoryCode,
          targetAttributeCode: formData.targetAttributeCode || null,
          transformation,
          confidence: formData.confidence,
          isActive: formData.isActive,
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingMapping(null)
        setFormData({
          surveyId: "",
          questionId: "",
          sourcePattern: "",
          targetCategoryCode: "",
          targetAttributeCode: "",
          transformation: "",
          confidence: 1.0,
          isActive: true,
        })
        fetchMappings()
      }
    } catch (error) {
      console.error("Failed to save mapping:", error)
    }
  }

  const handleDelete = async (mappingId: string) => {
    if (!confirm("Are you sure you want to delete this mapping?")) {
      return
    }

    try {
      const response = await fetch(`/api/gwi/taxonomy/auto-mapping/${mappingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMappings()
      }
    } catch (error) {
      console.error("Failed to delete mapping:", error)
    }
  }

  const handleEdit = (mapping: AutoMapping) => {
    setEditingMapping(mapping)
    setFormData({
      surveyId: mapping.surveyId || "",
      questionId: mapping.questionId || "",
      sourcePattern: mapping.sourcePattern,
      targetCategoryCode: mapping.targetCategoryCode,
      targetAttributeCode: mapping.targetAttributeCode || "",
      transformation: mapping.transformation
        ? JSON.stringify(mapping.transformation, null, 2)
        : "",
      confidence: mapping.confidence,
      isActive: mapping.isActive,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Taxonomy Auto-Mapping</h1>
          <p className="text-muted-foreground">
            Configure automatic mapping rules for survey data to taxonomy
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingMapping(null)
                setFormData({
                  surveyId: "",
                  questionId: "",
                  sourcePattern: "",
                  targetCategoryCode: "",
                  targetAttributeCode: "",
                  transformation: "",
                  confidence: 1.0,
                  isActive: true,
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Mapping Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMapping ? "Edit" : "Create"} Auto-Mapping Rule
              </DialogTitle>
              <DialogDescription>
                Define patterns to automatically map survey responses to taxonomy
                categories
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Source Pattern (Regex)</Label>
                  <Input
                    value={formData.sourcePattern}
                    onChange={(e) =>
                      setFormData({ ...formData, sourcePattern: e.target.value })
                    }
                    placeholder="^Q1$"
                    required
                  />
                </div>
                <div>
                  <Label>Confidence</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={formData.confidence}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confidence: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Target Category</Label>
                <Select
                  value={formData.targetCategoryCode}
                  onValueChange={(value) =>
                    setFormData({ ...formData, targetCategoryCode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.code}>
                        {category.name} ({category.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Attribute (Optional)</Label>
                <Input
                  value={formData.targetAttributeCode}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAttributeCode: e.target.value })
                  }
                  placeholder="attribute_code"
                />
              </div>

              <div>
                <Label>Transformation (JSON, Optional)</Label>
                <Textarea
                  value={formData.transformation}
                  onChange={(e) =>
                    setFormData({ ...formData, transformation: e.target.value })
                  }
                  placeholder='{"type": "lookup", "mapping": {...}}'
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Mapping Rules</CardTitle>
          <CardDescription>
            {mappings.length} rule{mappings.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading mappings...</div>
          ) : mappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No auto-mapping rules configured. Click "Add Mapping Rule" to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Pattern</TableHead>
                  <TableHead>Target Category</TableHead>
                  <TableHead>Target Attribute</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-mono text-sm">
                      {mapping.sourcePattern}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mapping.targetCategoryCode}</Badge>
                    </TableCell>
                    <TableCell>
                      {mapping.targetAttributeCode || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {Math.round(mapping.confidence * 100)}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={mapping.isActive ? "default" : "secondary"}>
                        {mapping.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(mapping)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(mapping.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
