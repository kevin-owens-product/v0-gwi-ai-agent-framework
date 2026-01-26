import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Bot,
  Settings,
  Wrench,
  FileText,
  Clock,
  User,
} from "lucide-react"
import { AgentTemplateEditor } from "@/components/gwi/agents/agent-template-editor"

async function getAgentTemplate(id: string) {
  const template = await prisma.systemAgentTemplate.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      organization: { select: { id: true, name: true, slug: true } },
    },
  })

  return template
}

async function AgentTemplateDetail({ id }: { id: string }) {
  const template = await getAgentTemplate(id)

  if (!template) {
    notFound()
  }

  const configuration = template.configuration as Record<string, unknown>
  const defaultTools = template.defaultTools as string[] | null
  const defaultPrompts = template.defaultPrompts as Record<string, string> | null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gwi/agents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{template.category}</Badge>
                  <Badge
                    className={
                      template.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {template.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>
            {template.description && (
              <p className="text-muted-foreground mt-2 ml-14">{template.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">v{template.version}</p>
                <p className="text-sm text-muted-foreground">Version</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{defaultTools?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Default Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold truncate max-w-[120px]" title={template.createdBy.name || ""}>
                  {template.createdBy.name || "Unknown"}
                </p>
                <p className="text-sm text-muted-foreground">Created By</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Date(template.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">Last Updated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
                <CardDescription>
                  Model and capability settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  {typeof configuration.model === "string" && configuration.model && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Model</dt>
                      <dd className="text-sm font-mono mt-1">{configuration.model}</dd>
                    </div>
                  )}
                  {configuration.temperature !== undefined && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Temperature</dt>
                      <dd className="text-sm font-mono mt-1">{String(configuration.temperature)}</dd>
                    </div>
                  )}
                  {configuration.maxIterations !== undefined && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Max Iterations</dt>
                      <dd className="text-sm font-mono mt-1">{String(configuration.maxIterations)}</dd>
                    </div>
                  )}
                  {Array.isArray(configuration.capabilities) && configuration.capabilities.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Capabilities</dt>
                      <dd className="flex flex-wrap gap-1 mt-1">
                        {(configuration.capabilities as string[]).map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Prompts</CardTitle>
                <CardDescription>
                  System and template prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {defaultPrompts && Object.keys(defaultPrompts).length > 0 ? (
                  <dl className="space-y-4">
                    {Object.entries(defaultPrompts).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-sm font-medium text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </dt>
                        <dd className="text-sm mt-1 p-2 bg-slate-50 rounded border text-muted-foreground line-clamp-3">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">No prompts configured</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle>Full Configuration</CardTitle>
              <CardDescription>
                Complete JSON configuration for this agent template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-slate-50 rounded-lg overflow-auto text-sm font-mono">
                {JSON.stringify(configuration, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Default Tools</CardTitle>
              <CardDescription>
                Tools available to agents created from this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              {defaultTools && defaultTools.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {defaultTools.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-sm">{tool}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No default tools configured</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <AgentTemplateEditor
            template={{
              id: template.id,
              name: template.name,
              description: template.description,
              category: template.category,
              configuration: configuration,
              defaultTools: defaultTools,
              defaultPrompts: defaultPrompts,
              isPublished: template.isPublished,
              version: template.version,
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Template Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs truncate" title={template.id}>
                {template.id}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Scope</dt>
              <dd className="font-medium">
                {template.organization ? template.organization.name : "Global"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created At</dt>
              <dd className="font-medium">
                {new Date(template.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last Updated</dt>
              <dd className="font-medium">
                {new Date(template.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function AgentTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-16 bg-slate-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      }
    >
      <AgentTemplateDetail id={id} />
    </Suspense>
  )
}
