"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Puzzle,
  Building2,
  Star,
  Shield,
  ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const categories = [
  { value: "PRODUCTIVITY", label: "Productivity", description: "Tools to improve workflow efficiency" },
  { value: "COMMUNICATION", label: "Communication", description: "Messaging, chat, and collaboration" },
  { value: "PROJECT_MANAGEMENT", label: "Project Management", description: "Task tracking and planning" },
  { value: "CRM", label: "CRM", description: "Customer relationship management" },
  { value: "ANALYTICS", label: "Analytics", description: "Data analysis and reporting" },
  { value: "SECURITY", label: "Security", description: "Security and compliance tools" },
  { value: "DEVELOPER_TOOLS", label: "Developer Tools", description: "Development and DevOps" },
  { value: "HR", label: "HR", description: "Human resources management" },
  { value: "FINANCE", label: "Finance", description: "Financial management tools" },
  { value: "MARKETING", label: "Marketing", description: "Marketing automation" },
  { value: "CUSTOMER_SUPPORT", label: "Customer Support", description: "Help desk and support" },
  { value: "OTHER", label: "Other", description: "Other integrations" },
]

export default function NewIntegrationAppPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    category: "OTHER",
    developer: "",
    developerUrl: "",
    iconUrl: "",
    websiteUrl: "",
    documentationUrl: "",
    supportEmail: "",
    isOfficial: false,
    isFeatured: false,
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.developer) {
      toast.error("Name and developer are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/integrations/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          shortDescription: formData.shortDescription || null,
          description: formData.description || null,
          developerUrl: formData.developerUrl || null,
          iconUrl: formData.iconUrl || null,
          websiteUrl: formData.websiteUrl || null,
          documentationUrl: formData.documentationUrl || null,
          supportEmail: formData.supportEmail || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create app")
      }

      const data = await response.json()
      toast.success("Integration app created successfully")
      router.push(`/admin/integrations/apps/${data.app.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create app")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/integrations/apps">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Puzzle className="h-6 w-6 text-primary" />
              Add Integration App
            </h1>
            <p className="text-sm text-muted-foreground">
              Add a new integration app to the marketplace
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.developer}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create App
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>App Details</CardTitle>
            <CardDescription>
              Basic information about the integration app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">App Name *</Label>
              <Input
                id="name"
                placeholder="My Integration"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                placeholder="A brief description of the app"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Displayed in app listings and search results
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the integration..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex flex-col">
                        <span>{cat.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {cat.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Developer Information
            </CardTitle>
            <CardDescription>
              Information about the app developer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="developer">Developer Name *</Label>
              <Input
                id="developer"
                placeholder="Company or developer name"
                value={formData.developer}
                onChange={(e) =>
                  setFormData({ ...formData, developer: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="developerUrl">Developer Website</Label>
              <Input
                id="developerUrl"
                type="url"
                placeholder="https://developer.com"
                value={formData.developerUrl}
                onChange={(e) =>
                  setFormData({ ...formData, developerUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                placeholder="support@developer.com"
                value={formData.supportEmail}
                onChange={(e) =>
                  setFormData({ ...formData, supportEmail: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Assets & URLs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Assets & Links
            </CardTitle>
            <CardDescription>
              App icon and related URLs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iconUrl">Icon URL</Label>
              <Input
                id="iconUrl"
                type="url"
                placeholder="https://example.com/icon.png"
                value={formData.iconUrl}
                onChange={(e) =>
                  setFormData({ ...formData, iconUrl: e.target.value })
                }
              />
              {formData.iconUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Preview:</span>
                  <img
                    src={formData.iconUrl}
                    alt="Icon preview"
                    className="h-10 w-10 rounded-lg object-cover border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">App Website</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://myapp.com"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentationUrl">Documentation URL</Label>
              <Input
                id="documentationUrl"
                type="url"
                placeholder="https://docs.myapp.com"
                value={formData.documentationUrl}
                onChange={(e) =>
                  setFormData({ ...formData, documentationUrl: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Flags */}
        <Card>
          <CardHeader>
            <CardTitle>App Status</CardTitle>
            <CardDescription>
              Configure app visibility and badges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 p-4 rounded-md border">
              <Checkbox
                id="isOfficial"
                checked={formData.isOfficial}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isOfficial: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="isOfficial" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Official App
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mark as an officially supported integration
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 rounded-md border">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="isFeatured" className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Featured App
                </Label>
                <p className="text-xs text-muted-foreground">
                  Highlight this app in the marketplace
                </p>
              </div>
            </div>

            <div className="p-4 rounded-md bg-muted">
              <p className="text-sm text-muted-foreground">
                The app will be created with <strong>Draft</strong> status.
                You can publish it later from the app details page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
