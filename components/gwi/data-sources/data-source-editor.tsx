"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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

interface DataSource {
  id: string
  name: string
  type: string
  connectionString: string | null
  configuration: Record<string, unknown>
  credentials: { encrypted: boolean } | null
  isActive: boolean
  syncStatus: string
  lastSyncAt: string | Date | null
  createdAt: string | Date
  updatedAt: string | Date
}

interface DataSourceEditorProps {
  dataSource?: DataSource
}

const DATA_SOURCE_TYPE_VALUES = ["postgresql", "mysql", "bigquery", "snowflake", "api", "s3", "salesforce", "mongodb"] as const

export function DataSourceEditor({ dataSource }: DataSourceEditorProps) {
  const router = useRouter()
  const t = useTranslations("gwi.editors.dataSource")
  const tCommon = useTranslations("gwi.editors.common")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: dataSource?.name || "",
    type: dataSource?.type || "",
    connectionString: "",
    isActive: dataSource?.isActive ?? true,
    // Configuration fields
    host: (dataSource?.configuration as Record<string, string>)?.host || "",
    port: (dataSource?.configuration as Record<string, string>)?.port || "",
    database: (dataSource?.configuration as Record<string, string>)?.database || "",
    schema: (dataSource?.configuration as Record<string, string>)?.schema || "",
    description: (dataSource?.configuration as Record<string, string>)?.description || "",
    // Credentials
    username: "",
    password: "",
    apiKey: "",
  })

  const isEditing = !!dataSource

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Build configuration object
      const configuration: Record<string, unknown> = {
        description: formData.description,
      }

      // Add type-specific configuration
      if (["postgresql", "mysql", "mongodb"].includes(formData.type)) {
        configuration.host = formData.host
        configuration.port = formData.port
        configuration.database = formData.database
        if (formData.schema) configuration.schema = formData.schema
      } else if (formData.type === "bigquery" || formData.type === "snowflake") {
        configuration.database = formData.database
        if (formData.schema) configuration.schema = formData.schema
      } else if (formData.type === "s3") {
        configuration.bucket = formData.database
        configuration.region = formData.host
      } else if (formData.type === "api") {
        configuration.baseUrl = formData.host
      }

      // Build credentials object (only include if provided)
      const credentials: Record<string, string> = {}
      if (formData.username) credentials.username = formData.username
      if (formData.password) credentials.password = formData.password
      if (formData.apiKey) credentials.apiKey = formData.apiKey

      const payload: Record<string, unknown> = {
        name: formData.name,
        type: formData.type,
        configuration,
        isActive: formData.isActive,
      }

      // Only include connectionString if provided
      if (formData.connectionString) {
        payload.connectionString = formData.connectionString
      }

      // Only include credentials if any are provided
      if (Object.keys(credentials).length > 0) {
        payload.credentials = credentials
      }

      const url = isEditing
        ? `/api/gwi/data-sources/${dataSource.id}`
        : "/api/gwi/data-sources"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        if (!isEditing) {
          router.push(`/gwi/data-sources/${data.id}`)
        } else {
          router.refresh()
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || t("errors.failedToSave"))
      }
    } catch (err) {
      console.error("Failed to save data source:", err)
      setError(t("errors.unexpectedError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!dataSource) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/gwi/data-sources/${dataSource.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/gwi/data-sources")
      } else {
        const errorData = await response.json()
        setError(errorData.error || t("errors.failedToDelete"))
      }
    } catch (err) {
      console.error("Failed to delete data source:", err)
      setError(t("errors.unexpectedError"))
    } finally {
      setIsDeleting(false)
    }
  }

  // Determine which fields to show based on type
  const showDatabaseFields = ["postgresql", "mysql", "mongodb", "bigquery", "snowflake"].includes(formData.type)
  const showHostPort = ["postgresql", "mysql", "mongodb"].includes(formData.type)
  const showApiFields = formData.type === "api"
  const showS3Fields = formData.type === "s3"
  const showConnectionString = ["postgresql", "mysql", "mongodb"].includes(formData.type)

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("basicInformation")}</CardTitle>
            <CardDescription>
              {t("basicInformationDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{tCommon("name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("placeholders.name")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{tCommon("type")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                required
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.selectType")} />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCE_TYPE_VALUES.map((typeValue) => (
                    <SelectItem key={typeValue} value={typeValue}>
                      {t(`types.${typeValue}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  {t("typeCannotBeChanged")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{tCommon("description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("placeholders.description")}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">{tCommon("active")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("activeDescription")}
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
          </CardContent>
        </Card>

        {formData.type && (
          <Card>
            <CardHeader>
              <CardTitle>{t("connectionSettings")}</CardTitle>
              <CardDescription>
                {t("connectionSettingsDescription", { type: t(`types.${formData.type}`) })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {showConnectionString && (
                <div className="space-y-2">
                  <Label htmlFor="connectionString">{t("connectionStringOptional")}</Label>
                  <Input
                    id="connectionString"
                    type="password"
                    value={formData.connectionString}
                    onChange={(e) =>
                      setFormData({ ...formData, connectionString: e.target.value })
                    }
                    placeholder={isEditing ? t("placeholders.leaveBlankToKeep") : t("placeholders.connectionString")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("connectionStringHint")}
                  </p>
                </div>
              )}

              {showHostPort && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">{t("host")}</Label>
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) =>
                        setFormData({ ...formData, host: e.target.value })
                      }
                      placeholder={t("placeholders.host")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">{t("port")}</Label>
                    <Input
                      id="port"
                      value={formData.port}
                      onChange={(e) =>
                        setFormData({ ...formData, port: e.target.value })
                      }
                      placeholder="5432"
                    />
                  </div>
                </div>
              )}

              {showDatabaseFields && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="database">{t("database")}</Label>
                    <Input
                      id="database"
                      value={formData.database}
                      onChange={(e) =>
                        setFormData({ ...formData, database: e.target.value })
                      }
                      placeholder={t("placeholders.database")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schema">{t("schemaOptional")}</Label>
                    <Input
                      id="schema"
                      value={formData.schema}
                      onChange={(e) =>
                        setFormData({ ...formData, schema: e.target.value })
                      }
                      placeholder="public"
                    />
                  </div>
                </div>
              )}

              {showApiFields && (
                <div className="space-y-2">
                  <Label htmlFor="host">{t("baseUrl")}</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) =>
                      setFormData({ ...formData, host: e.target.value })
                    }
                    placeholder="https://api.example.com"
                  />
                </div>
              )}

              {showS3Fields && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="database">{t("bucketName")}</Label>
                    <Input
                      id="database"
                      value={formData.database}
                      onChange={(e) =>
                        setFormData({ ...formData, database: e.target.value })
                      }
                      placeholder="my-bucket"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="host">{t("region")}</Label>
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) =>
                        setFormData({ ...formData, host: e.target.value })
                      }
                      placeholder="us-east-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {formData.type && (
          <Card>
            <CardHeader>
              <CardTitle>{t("authentication")}</CardTitle>
              <CardDescription>
                {isEditing
                  ? t("authenticationDescriptionEdit")
                  : t("authenticationDescriptionCreate")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.type === "api" || formData.type === "salesforce" ? (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t("apiKey")}</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    placeholder={isEditing ? t("placeholders.leaveBlankToKeep") : t("placeholders.apiKey")}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t("username")}</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder={isEditing ? t("placeholders.leaveBlankToKeep") : t("placeholders.username")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("password")}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={isEditing ? t("placeholders.leaveBlankToKeep") : t("placeholders.password")}
                    />
                  </div>
                </div>
              )}

              {isEditing && dataSource?.credentials && (
                <p className="text-sm text-muted-foreground">
                  {t("credentialsConfigured")}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between gap-2">
          <div>
            {isEditing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {tCommon("deleting")}
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("deleteDataSource")}
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteDialogTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteDialogDescription", { name: dataSource.name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {tCommon("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !formData.type}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {tCommon("saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? tCommon("saveChanges") : t("createDataSource")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
