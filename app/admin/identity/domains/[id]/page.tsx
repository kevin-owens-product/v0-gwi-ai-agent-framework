"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Globe,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Shield,
  Building2,
  Copy,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

interface Organization {
  id: string
  name: string
  slug: string
  planTier: string
}

interface SSOConfig {
  id: string
  provider: string
  status: string
}

interface Domain {
  id: string
  domain: string
  orgId: string
  status: string
  verificationMethod: string
  verificationToken: string
  verifiedAt: string | null
  expiresAt: string | null
  autoJoin: boolean
  ssoEnforced: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  organization: Organization | null
  ssoConfig: SSOConfig | null
}

const verificationMethodKeys = ["DNS_TXT", "DNS_CNAME", "META_TAG", "FILE_UPLOAD"] as const

export default function DomainDetailPage() {
  const params = useParams()
  const router = useRouter()
  const domainId = params.id as string
  const t = useTranslations("admin.identity.domains")
  const tCommon = useTranslations("common")

  const [domain, setDomain] = useState<Domain | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [editForm, setEditForm] = useState({
    autoJoin: false,
    ssoEnforced: false,
    verificationMethod: "DNS_TXT",
  })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const fetchDomain = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/identity/domains/${domainId}`)
      if (!response.ok) {
        throw new Error(t("errors.fetchFailed"))
      }
      const data = await response.json()
      setDomain(data.domain)
      setEditForm({
        autoJoin: data.domain.autoJoin,
        ssoEnforced: data.domain.ssoEnforced,
        verificationMethod: data.domain.verificationMethod,
      })
    } catch (error) {
      console.error("Failed to fetch domain:", error)
      showErrorToast(t("errors.fetchFailed"))
    } finally {
      setIsLoading(false)
    }
  }, [domainId, t])

  useEffect(() => {
    fetchDomain()
  }, [fetchDomain])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/identity/domains/${domainId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        showSuccessToast(t("messages.settingsUpdated"))
        setIsEditing(false)
        fetchDomain()
      } else {
        throw new Error(t("errors.updateFailed"))
      }
    } catch (error) {
      console.error("Failed to update domain:", error)
      showErrorToast(t("errors.updateFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const response = await fetch(`/api/admin/identity/domains/${domainId}/verify`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.verification?.success) {
        showSuccessToast(t("messages.domainVerified"))
      } else {
        showErrorToast(data.verification?.message || t("errors.verificationFailed"))
      }
      fetchDomain()
    } catch (error) {
      console.error("Failed to verify domain:", error)
      showErrorToast(t("errors.verificationFailed"))
    } finally {
      setIsVerifying(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/identity/domains/${domainId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        showSuccessToast(t("messages.domainDeleted"))
        router.push("/admin/identity/domains")
      } else {
        throw new Error(t("errors.deleteFailed"))
      }
    } catch (error) {
      console.error("Failed to delete domain:", error)
      showErrorToast(t("errors.deleteFailed"))
    } finally {
      setShowDeleteDialog(false)
    }
  }, [domainId, router, t])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSuccessToast(t("messages.copiedToClipboard"))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t("statuses.verified")}
          </Badge>
        )
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {t("statuses.pending")}
          </Badge>
        )
      case "FAILED":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t("statuses.failed")}
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge variant="outline" className="text-yellow-500">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t("statuses.expired")}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVerificationInstructions = (method: string, token: string, domainName: string) => {
    switch (method) {
      case "DNS_TXT":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("verification.dns_txt.instructions")}
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              <div className="flex justify-between items-center">
                <span>{t("verification.host")}: @</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="break-all">{t("verification.value")}: {token}</span>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(token)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      case "DNS_CNAME":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("verification.dns_cname.instructions")}
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              <div className="flex justify-between items-center">
                <span>{t("verification.host")}: _gwi-verification</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>{t("verification.pointsTo")}: verify.gwi.com</span>
              </div>
            </div>
          </div>
        )
      case "META_TAG":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("verification.meta_tag.instructions")}
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all">
              <code>&lt;meta name="gwi-verification" content="{token}" /&gt;</code>
              <Button
                size="icon"
                variant="ghost"
                className="ml-2"
                onClick={() => copyToClipboard(`<meta name="gwi-verification" content="${token}" />`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      case "FILE_UPLOAD":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("verification.file_upload.instructions")}
            </p>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              <div>https://{domainName}/.well-known/gwi-verification.txt</div>
              <div className="mt-2 flex justify-between items-center">
                <span>{t("verification.contents")}: {token}</span>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(token)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!domain) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("domainNotFound")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/identity/domains">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{domain.domain}</h1>
            <div className="flex items-center gap-2">
              {getStatusBadge(domain.status)}
              <Badge variant="outline">{domain.verificationMethod.replace("_", " ")}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {domain.status !== "VERIFIED" && (
            <Button onClick={handleVerify} disabled={isVerifying}>
              {isVerifying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t("actions.verifyNow")}
            </Button>
          )}
          <Button variant="destructive" onClick={handleDeleteClick}>
            {tCommon("delete")}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t("dialogs.deleteTitle")}
        description={t("dialogs.deleteDescription")}
        confirmText={tCommon("delete")}
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="verification">{t("tabs.verification")}</TabsTrigger>
          <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{tCommon("status")}</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(domain.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("detail.autoJoin")}</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={domain.autoJoin ? "default" : "secondary"}>
                  {domain.autoJoin ? tCommon("enabled") : tCommon("disabled")}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("detail.ssoEnforced")}</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={domain.ssoEnforced ? "default" : "secondary"}>
                  {domain.ssoEnforced ? t("detail.enforced") : t("detail.optional")}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Domain Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.domainDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.domain")}</span>
                <span className="font-medium">{domain.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.organization")}</span>
                <span className="font-medium">
                  {domain.organization?.name || domain.orgId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.verificationMethod")}</span>
                <Badge variant="outline">{domain.verificationMethod.replace("_", " ")}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.verifiedAt")}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {domain.verifiedAt
                    ? new Date(domain.verifiedAt).toLocaleDateString()
                    : t("detail.notVerified")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("detail.created")}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(domain.createdAt).toLocaleDateString()}
                </span>
              </div>
              {domain.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("detail.expires")}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(domain.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SSO Configuration */}
          {domain.ssoConfig && (
            <Card>
              <CardHeader>
                <CardTitle>{t("detail.linkedSsoConfig")}</CardTitle>
                <CardDescription>
                  {t("detail.ssoConfigured")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("detail.provider")}</span>
                  <Badge variant="outline">{domain.ssoConfig.provider}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tCommon("status")}</span>
                  <Badge variant={domain.ssoConfig.status === "ACTIVE" ? "default" : "secondary"}>
                    {domain.ssoConfig.status}
                  </Badge>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/admin/identity/sso/${domain.ssoConfig.id}`}>
                    {t("actions.viewSsoConfig")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("verification.title")}</CardTitle>
              <CardDescription>
                {t("verification.description", { domain: domain.domain })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getVerificationInstructions(
                domain.verificationMethod,
                domain.verificationToken,
                domain.domain
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  {t("verification.afterConfiguring")}
                </p>
                <Button onClick={handleVerify} disabled={isVerifying || domain.status === "VERIFIED"}>
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {domain.status === "VERIFIED" ? t("verification.alreadyVerified") : t("verification.checkVerification")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification History */}
          {domain.metadata && typeof domain.metadata === 'object' && 'lastVerificationAttempt' in domain.metadata && (
            <Card>
              <CardHeader>
                <CardTitle>{t("verification.lastAttempt")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("verification.time")}</span>
                  <span>
                    {new Date(String((domain.metadata as Record<string, unknown>).lastVerificationAttempt)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("verification.result")}</span>
                  <span>{String((domain.metadata as Record<string, unknown>).lastVerificationResult || '')}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("settings.title")}</CardTitle>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>{t("form.verificationMethod")}</Label>
                    <Select
                      value={editForm.verificationMethod}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, verificationMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {verificationMethodKeys.map((method) => (
                          <SelectItem key={method} value={method}>
                            {t(`verificationMethods.${method.toLowerCase()}.label`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("form.autoJoin")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("form.autoJoinDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={editForm.autoJoin}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, autoJoin: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t("form.ssoEnforced")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("form.ssoEnforcedDescription")}
                      </p>
                    </div>
                    <Switch
                      checked={editForm.ssoEnforced}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, ssoEnforced: checked })
                      }
                      disabled={!domain.ssoConfig}
                    />
                  </div>
                  {!domain.ssoConfig && editForm.ssoEnforced === false && (
                    <p className="text-sm text-yellow-500">
                      {t("settings.ssoRequired")}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("form.verificationMethod")}</span>
                    <Badge variant="outline">
                      {domain.verificationMethod.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">{t("form.autoJoin")}</span>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.autoAddUsers")}
                      </p>
                    </div>
                    <Badge variant={domain.autoJoin ? "default" : "secondary"}>
                      {domain.autoJoin ? tCommon("enabled") : tCommon("disabled")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-muted-foreground">{t("form.ssoEnforced")}</span>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.requireSso")}
                      </p>
                    </div>
                    <Badge variant={domain.ssoEnforced ? "default" : "secondary"}>
                      {domain.ssoEnforced ? t("detail.enforced") : t("detail.optional")}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
