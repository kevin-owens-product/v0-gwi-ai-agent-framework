"use client"

import { useState } from "react"
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

const DATA_SOURCE_TYPES = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "bigquery", label: "BigQuery" },
  { value: "snowflake", label: "Snowflake" },
  { value: "api", label: "REST API" },
  { value: "s3", label: "Amazon S3" },
  { value: "salesforce", label: "Salesforce" },
  { value: "mongodb", label: "MongoDB" },
]

export function DataSourceEditor({ dataSource }: DataSourceEditorProps) {
  const router = useRouter()
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
        setError(errorData.error || "Failed to save data source")
      }
    } catch (err) {
      console.error("Failed to save data source:", err)
      setError("An unexpected error occurred")
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
        setError(errorData.error || "Failed to delete data source")
      }
    } catch (err) {
      console.error("Failed to delete data source:", err)
      setError("An unexpected error occurred")
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
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the basic settings for this data source
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter data source name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                required
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source type" />
                </SelectTrigger>
                <SelectContent>
                  {DATA_SOURCE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  Type cannot be changed after creation
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter a description for this data source (optional)"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this data source connection
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
              <CardTitle>Connection Settings</CardTitle>
              <CardDescription>
                Configure connection details for {DATA_SOURCE_TYPES.find(t => t.value === formData.type)?.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {showConnectionString && (
                <div className="space-y-2">
                  <Label htmlFor="connectionString">Connection String (Optional)</Label>
                  <Input
                    id="connectionString"
                    type="password"
                    value={formData.connectionString}
                    onChange={(e) =>
                      setFormData({ ...formData, connectionString: e.target.value })
                    }
                    placeholder={isEditing ? "Leave blank to keep existing" : "postgresql://user:password@host:5432/database"}
                  />
                  <p className="text-xs text-muted-foreground">
                    Alternatively, you can provide individual connection details below
                  </p>
                </div>
              )}

              {showHostPort && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) =>
                        setFormData({ ...formData, host: e.target.value })
                      }
                      placeholder="localhost or hostname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
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
                    <Label htmlFor="database">Database</Label>
                    <Input
                      id="database"
                      value={formData.database}
                      onChange={(e) =>
                        setFormData({ ...formData, database: e.target.value })
                      }
                      placeholder="database_name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schema">Schema (Optional)</Label>
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
                  <Label htmlFor="host">Base URL</Label>
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
                    <Label htmlFor="database">Bucket Name</Label>
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
                    <Label htmlFor="host">Region</Label>
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
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                {isEditing
                  ? "Leave fields blank to keep existing credentials. Enter new values to update."
                  : "Provide authentication credentials for this data source"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.type === "api" || formData.type === "salesforce" ? (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    placeholder={isEditing ? "Leave blank to keep existing" : "Enter API key"}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder={isEditing ? "Leave blank to keep existing" : "Enter username"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={isEditing ? "Leave blank to keep existing" : "Enter password"}
                    />
                  </div>
                </div>
              )}

              {isEditing && dataSource?.credentials && (
                <p className="text-sm text-muted-foreground">
                  Credentials are currently configured and encrypted
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
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Data Source
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      data source &quot;{dataSource.name}&quot; and remove all its
                      configuration data.
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
            <Button type="submit" disabled={isLoading || !formData.type}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Save Changes" : "Create Data Source"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
