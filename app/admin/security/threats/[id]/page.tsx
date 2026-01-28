"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

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

const statusValues = ["ACTIVE", "CONTAINED", "MITIGATED", "RESOLVED", "FALSE_POSITIVE"] as const

export default function ThreatDetailPage() {
  const t = useTranslations("admin.security.threats")
  const tCommon = useTranslations("common")
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
      showErrorToast(t("detail.errors.fetchFailed"))
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

      showSuccessToast(t("detail.messages.updateSuccess"))
      fetchThreat()
    } catch (error) {
      showErrorToast(t("detail.errors.updateFailed"))
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
        <p className="text-muted-foreground">{t("detail.notFound")}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/security/threats")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("detail.backToThreats")}
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
            {tCommon("back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Zap className="h-6 w-6 text-orange-500" />
              {t("detail.title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("detail.id")}: {threat.id}</p>
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
              <CardTitle>{t("detail.threatDetails")}</CardTitle>
              <CardDescription>
                {threat.type.replace(/_/g, " ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t("detail.description")}</Label>
                <p className="mt-1">{threat.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t("detail.source")}
                  </Label>
                  <p className="mt-1 font-mono">{threat.source}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("detail.userId")}
                  </Label>
                  <p className="mt-1 font-mono text-sm">{threat.userId || t("detail.notAvailable")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {t("detail.organizationId")}
                  </Label>
                  <p className="mt-1 font-mono text-sm">{threat.orgId || t("detail.platformWide")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t("detail.lastUpdated")}
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
                    <Label className="text-muted-foreground">{t("detail.additionalDetails")}</Label>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-auto">
                      {JSON.stringify(threat.details, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {t("detail.detectedAt")}: {new Date(threat.createdAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Indicators of Compromise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t("detail.iocs.title")}
              </CardTitle>
              <CardDescription>
                {t("detail.iocs.count", { count: indicators.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {indicators.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t("detail.iocs.noIndicators")}
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
                  {t("detail.relatedThreats.title")}
                </CardTitle>
                <CardDescription>
                  {t("detail.relatedThreats.count", { count: relatedThreats.length })}
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
              <CardTitle>{t("detail.mitigation.title")}</CardTitle>
              <CardDescription>{t("detail.mitigation.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("detail.mitigation.status")}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t("detail.mitigation.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    {statusValues.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`statuses.${s === "FALSE_POSITIVE" ? "falsePositive" : s.toLowerCase()}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t("detail.mitigation.notes")}</Label>
                <Textarea
                  className="mt-2"
                  placeholder={t("detail.mitigation.notesPlaceholder")}
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
                {saving ? tCommon("saving") : tCommon("saveChanges")}
              </Button>
            </CardContent>
          </Card>

          {threat.mitigatedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  {t("detail.mitigationInfo.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-muted-foreground">{t("detail.mitigationInfo.mitigatedBy")}</Label>
                  <p className="text-sm">{threat.mitigatedBy || t("detail.mitigationInfo.system")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("detail.mitigationInfo.mitigatedAt")}</Label>
                  <p className="text-sm">
                    {new Date(threat.mitigatedAt).toLocaleString()}
                  </p>
                </div>
                {threat.mitigation && (
                  <div>
                    <Label className="text-muted-foreground">{t("detail.mitigationInfo.notes")}</Label>
                    <p className="text-sm mt-1">{threat.mitigation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.quickActions.title")}</CardTitle>
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
                  {t("detail.quickActions.containThreat")}
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
                  {t("detail.quickActions.markMitigated")}
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
                  {t("detail.quickActions.markResolved")}
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
                  {t("detail.quickActions.markFalsePositive")}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Threat Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("detail.intelligence.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.intelligence.type")}</span>
                <Badge variant="outline">{threat.type.replace(/_/g, " ")}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.intelligence.severity")}</span>
                <span>{threat.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.intelligence.iocCount")}</span>
                <span>{indicators.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.intelligence.relatedEvents")}</span>
                <span>{threat.relatedEvents?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
