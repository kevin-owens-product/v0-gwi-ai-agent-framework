"use client"
/* eslint-disable local/no-hardcoded-strings */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, FileText, Settings } from "lucide-react"
import Link from "next/link"

interface Survey {
  id: string
  name: string
  description: string | null
  status: string
  version: number
  _count: {
    questions: number
    responses: number
    routingRules: number
    quotas: number
  }
  createdAt: string
}

export default function AdminGWISurveysPage() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/gwi/surveys")
      if (response.ok) {
        const data = await response.json()
        setSurveys(data)
      }
    } catch (error) {
      console.error("Failed to fetch surveys:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSurveys = surveys.filter((survey) =>
    survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      DRAFT: "outline",
      ACTIVE: "default",
      PAUSED: "secondary",
      COMPLETED: "default",
      ARCHIVED: "secondary",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GWI Surveys</h1>
          <p className="text-muted-foreground">
            Manage surveys, routing, quotas, and versions
          </p>
        </div>
        <Button onClick={() => router.push("/gwi/surveys/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Survey
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Surveys</CardTitle>
              <CardDescription>
                {filteredSurveys.length} survey{filteredSurveys.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search surveys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading surveys...</div>
          ) : filteredSurveys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No surveys found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Routing Rules</TableHead>
                  <TableHead>Quotas</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSurveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">{survey.name}</TableCell>
                    <TableCell>{getStatusBadge(survey.status)}</TableCell>
                    <TableCell>v{survey.version}</TableCell>
                    <TableCell>{survey._count.questions}</TableCell>
                    <TableCell>{survey._count.responses}</TableCell>
                    <TableCell>{survey._count.routingRules || 0}</TableCell>
                    <TableCell>{survey._count.quotas || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/gwi/surveys/${survey.id}/routing`}>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/gwi/surveys/${survey.id}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
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
