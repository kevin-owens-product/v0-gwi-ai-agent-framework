"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Zap,
  ArrowLeft,
  Shield,
  Clock,
  User,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Save,
  Link,
  Activity,
  Target,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface ThreatEvent {
  id: string
  type: string
  severity: string
  source: string
  orgId: string | null
  userId: string | null
  description: string
  details: Record<string, unknown>
  indicators: unknown[]
  status: string
  mitigatedBy: string | null
  mitigatedAt: string | null
  mitigation: string | null
  relatedEvents: string[]
  createdAt: string
  updatedAt: string
}

interface RelatedThreat {
  id: string
  type: string
  severity: string
  status: string
  description: string
  createdAt: string
}

const statuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "CONTAINED", label: "Contained" },
  { value: "MITIGATED", label: "Mitigated" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "FALSE_POSITIVE", label: "False Positive" },
]

export default function ThreatDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [threat, setThreat] = useState<ThreatEvent | null>(null)
  const [relatedThreats, setRelatedThreats] = useState<RelatedThreat[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [mitigation, setMitigation] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchThreat()
    }
  }, [params.id])

  const fetchThreat = async () => {
    try {
      const response = await fetch(`/api/admin/security/threats/${params.id}`)
      if (!response.ok) {
        throw new Error("Threat not found")
      }
      const data = await response.json()
      setThreat(data.threat)
      setRelatedThreats(data.relatedThreats || [])
      setStatus(data.threat.status)
      setMitigation(data.threat.mitigation || "")
    } catch (error) {
      console.error("Failed to fetch threat:", error)
      toast.error("Failed to fetch threat details")
      router.push("/admin/security/threats")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!threat) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/security/threats/${threat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          mitigation: mitigation || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update threat")
      }

      toast.success("Threat updated successfully")
      fetchThreat()
    } catch (error) {
      toast.error("Failed to update threat")
    } finally {
      setSaving(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive" className="text-lg px-3 py-1">{severity}</Badge>
      case "WARNING":
        return <Badge variant="default" className="bg-yellow-500 text-lg px-3 py-1">{severity}</Badge>
      case "INFO":
        return <Badge variant="secondary" className="text-lg px-3 py-1">{severity}</Badge>
      default:
        return <Badge variant="outline" className="text-lg px-3 py-1">{severity}</Badge>
    }
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "ACTIVE":
        return <Badge variant="destructive">{s}</Badge>
      case "CONTAINED":
        return <Badge variant="default" className="bg-orange-500">{s}</Badge>
      case "MITIGATED":
        return <Badge variant="default" className="bg-blue-500">{s}</Badge>
      case "RESOLVED":
        return <Badge variant="default" className="bg-green-500">{s}</Badge>
      case "FALSE_POSITIVE":
        return <Badge variant="secondary">{s.replace("_", " ")}</Badge>
      default:
        return <Badge variant="outline">{s}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!threat) {
    return (
      <div className="text-center py-12">
        <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Threat not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/security/threats")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Threats
        </Button>
      </div>
    )
  }

  const indicators = Array.isArray(threat.indicators) ? threat.indicators : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/security/threats")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Zap className="h-6 w-6 text-orange-500" />
              Threat Event
            </h1>
            <p className="text-sm text-muted-foreground">ID: {threat.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getSeverityBadge(threat.severity)}
          {getStatusBadge(threat.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Threat Details</CardTitle>
              <CardDescription>
                {threat.type.replace(/_/g, " ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{threat.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Source
                  </Label>
                  <p className="mt-1 font-mono">{threat.source}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User ID
                  </Label>
                  <p className="mt-1 font-mono text-sm">{threat.userId || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Organization ID
                  </Label>
                  <p className="mt-1 font-mono text-sm">{threat.orgId || "Platform-wide"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last Updated
                  </Label>
                  <p className="mt-1 text-sm">
                    {new Date(threat.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {threat.details && Object.keys(threat.details).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">Additional Details</Label>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-auto">
                      {JSON.stringify(threat.details, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Detected at: {new Date(threat.createdAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Indicators of Compromise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Indicators of Compromise (IOCs)
              </CardTitle>
              <CardDescription>
                {indicators.length} indicator{indicators.length !== 1 ? "s" : ""} identified
              </CardDescription>
            </CardHeader>
            <CardContent>
              {indicators.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No indicators of compromise recorded
                </p>
              ) : (
                <div className="space-y-2">
                  {indicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {typeof indicator === "string"
                            ? indicator
                            : JSON.stringify(indicator)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Threats */}
          {relatedThreats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Related Threats
                </CardTitle>
                <CardDescription>
                  {relatedThreats.length} related threat event{relatedThreats.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {relatedThreats.map((related) => (
                    <div
                      key={related.id}
                      className="p-3 bg-muted rounded-lg flex items-center justify-between cursor-pointer hover:bg-muted/80"
                      onClick={() => router.push(`/admin/security/threats/${related.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{related.type.replace(/_/g, " ")}</Badge>
                        <span className="text-sm truncate max-w-[300px]">
                          {related.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(related.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mitigation Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mitigation</CardTitle>
              <CardDescription>Update the threat status and add mitigation notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mitigation Notes</Label>
                <Textarea
                  className="mt-2"
                  placeholder="Describe the mitigation steps taken..."
                  value={mitigation}
                  onChange={(e) => setMitigation(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {threat.mitigatedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  Mitigation Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-muted-foreground">Mitigated By</Label>
                  <p className="text-sm">{threat.mitigatedBy || "System"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mitigated At</Label>
                  <p className="text-sm">
                    {new Date(threat.mitigatedAt).toLocaleString()}
                  </p>
                </div>
                {threat.mitigation && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="text-sm mt-1">{threat.mitigation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {status === "ACTIVE" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setStatus("CONTAINED")
                    handleSave()
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Contain Threat
                </Button>
              )}
              {(status === "ACTIVE" || status === "CONTAINED") && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setStatus("MITIGATED")
                    handleSave()
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Mitigated
                </Button>
              )}
              {status !== "RESOLVED" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setStatus("RESOLVED")
                    handleSave()
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              )}
              {status !== "FALSE_POSITIVE" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setStatus("FALSE_POSITIVE")
                    handleSave()
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as False Positive
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Threat Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Threat Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline">{threat.type.replace(/_/g, " ")}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Severity</span>
                <span>{threat.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IOC Count</span>
                <span>{indicators.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Related Events</span>
                <span>{threat.relatedEvents?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
