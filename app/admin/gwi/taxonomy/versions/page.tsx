"use client"
/* eslint-disable local/no-hardcoded-strings */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { GitBranch, Eye } from "lucide-react"

interface TaxonomyVersion {
  id: string
  versionNumber: number
  snapshot: Record<string, unknown>
  changeLog: Record<string, unknown> | null
  createdBy: {
    id: string
    name: string
    email: string
  }
  createdAt: string
}

interface Category {
  id: string
  name: string
  code: string
}

export default function TaxonomyVersionsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [versions, setVersions] = useState<TaxonomyVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategoryId) {
      fetchVersions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId])

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

  const fetchVersions = async () => {
    if (!selectedCategoryId) return

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/gwi/taxonomy/categories/${selectedCategoryId}/versions`
      )
      if (response.ok) {
        const data = await response.json()
        setVersions(data)
      }
    } catch (error) {
      console.error("Failed to fetch versions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateVersion = async () => {
    if (!selectedCategoryId) {
      alert("Please select a category first")
      return
    }

    const changeLog = prompt("Enter change log description (optional):")

    try {
      const response = await fetch(
        `/api/gwi/taxonomy/categories/${selectedCategoryId}/versions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ changeLog: changeLog || null }),
        }
      )

      if (response.ok) {
        fetchVersions()
      }
    } catch (error) {
      console.error("Failed to create version:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Taxonomy Versions</h1>
          <p className="text-muted-foreground">
            Manage taxonomy category versions and track changes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Category</CardTitle>
          <CardDescription>Choose a category to view its version history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Category</Label>
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCategoryId && (
              <div className="pt-6">
                <Button onClick={handleCreateVersion}>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Create Version
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCategoryId && (
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
            <CardDescription>
              {versions.length} version{versions.length !== 1 ? "s" : ""} created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading versions...</div>
            ) : versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No versions created yet. Click "Create Version" to create a snapshot.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Change Log</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <Badge variant="outline">v{version.versionNumber}</Badge>
                      </TableCell>
                      <TableCell>
                        {version.changeLog ? (
                          <span className="text-sm">
                            {JSON.stringify(version.changeLog)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No change log</span>
                        )}
                      </TableCell>
                      <TableCell>{version.createdBy.name}</TableCell>
                      <TableCell>
                        {new Date(version.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
