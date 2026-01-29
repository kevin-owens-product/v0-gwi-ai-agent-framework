"use client"
/* eslint-disable local/no-hardcoded-strings */

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { Plus, Eye, ArrowLeftRight } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface SurveyVersion {
  id: string
  versionNumber: number
  name: string
  description: string | null
  distribution: number
  isActive: boolean
  createdAt: string
}

export default function SurveyVersionsPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string

  const [versions, setVersions] = useState<SurveyVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    distribution: 100,
  })

  useEffect(() => {
    if (surveyId) {
      fetchVersions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId])

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/gwi/surveys/${surveyId}/versions`)
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

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/gwi/surveys/${surveyId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setFormData({
          name: "",
          description: "",
          distribution: 100,
        })
        fetchVersions()
      }
    } catch (error) {
      console.error("Failed to create version:", error)
    }
  }

  const handleCompare = (versionId: string) => {
    router.push(`/admin/gwi/surveys/${surveyId}/versions/${versionId}/compare`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Survey Versions</h1>
          <p className="text-muted-foreground">
            Manage survey versions for A/B testing and version control
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({
                  name: "",
                  description: "",
                  distribution: 100,
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Version
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Survey Version</DialogTitle>
              <DialogDescription>
                Create a snapshot of the current survey state for versioning or A/B
                testing
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateVersion} className="space-y-4">
              <div>
                <Label>Version Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Version 2.0 - Updated Questions"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the changes in this version..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Traffic Distribution (%)</Label>
                <Input
                  type="number"
                  value={formData.distribution}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      distribution: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="100"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Percentage of traffic to route to this version (for A/B testing)
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Version</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Versions</CardTitle>
          <CardDescription>
            {versions.length} version{versions.length !== 1 ? "s" : ""} created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading versions...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No versions created yet. Click "Create Version" to create a snapshot of
              the current survey.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>
                      <Badge variant="outline">v{version.versionNumber}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{version.name}</TableCell>
                    <TableCell>
                      {version.description || (
                        <span className="text-muted-foreground">No description</span>
                      )}
                    </TableCell>
                    <TableCell>{version.distribution}%</TableCell>
                    <TableCell>
                      <Badge variant={version.isActive ? "default" : "secondary"}>
                        {version.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(version.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompare(version.id)}
                        >
                          <ArrowLeftRight className="h-4 w-4 mr-1" />
                          Compare
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
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
