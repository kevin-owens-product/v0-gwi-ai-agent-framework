import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LoadingText } from "@/components/ui/loading-text"
import {
  Bot,
  FileCode,
  Wrench,
  Puzzle,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTranslations } from "@/lib/i18n/server"

async function getAgentStats() {
  const [templates, tools] = await Promise.all([
    prisma.systemAgentTemplate.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.systemToolConfiguration.findMany({
      orderBy: { name: "asc" },
    }),
  ])

  const publishedTemplates = templates.filter((t) => t.isPublished).length
  const activeTools = tools.filter((t) => t.isActive).length

  return {
    templates,
    tools,
    publishedTemplates,
    activeTools,
  }
}

async function AgentsContent() {
  const stats = await getAgentStats()
  const t = await getTranslations('gwi.agents')
  const tc = await getTranslations('gwi.common')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/gwi/agents/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('newTemplate')}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.templates.length}</p>
                <p className="text-sm text-muted-foreground">{t('agentTemplates')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FileCode className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.publishedTemplates}</p>
                <p className="text-sm text-muted-foreground">{t('published')}</p>
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
                <p className="text-2xl font-bold">{stats.tools.length}</p>
                <p className="text-sm text-muted-foreground">{t('totalTools')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Puzzle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeTools}</p>
                <p className="text-sm text-muted-foreground">{t('activeTools')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/gwi/agents/templates">
            <FileCode className="mr-2 h-4 w-4" />
            {t('allTemplates')}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/agents/tools">
            <Wrench className="mr-2 h-4 w-4" />
            {t('manageTools')}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/agents/capabilities">
            <Puzzle className="mr-2 h-4 w-4" />
            {t('capabilities')}
          </Link>
        </Button>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('templatesTitle')}</CardTitle>
          <CardDescription>
            {t('templatesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.templates.length > 0 ? (
            <div className="space-y-4">
              {stats.templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{template.name}</p>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {tc('createdBy')} {template.createdBy.name} | v{template.version}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      className={
                        template.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {template.isPublished ? t('published') : t('draft')}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/gwi/agents/templates/${template.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            {tc('edit')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          {tc('duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {tc('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">{t('noTemplatesYet')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('createReusable')}
              </p>
              <Button asChild>
                <Link href="/gwi/agents/templates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createTemplate')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tools List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('systemTools')}</CardTitle>
            <CardDescription>{t('systemToolsDesc')}</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/gwi/agents/tools">{tc('viewAll')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.tools.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.tools.slice(0, 6).map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                    <Wrench className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">{tool.type}</p>
                  </div>
                  <Badge
                    variant={tool.isActive ? "default" : "secondary"}
                    className={tool.isActive ? "bg-green-100 text-green-700" : ""}
                  >
                    {tool.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('noToolsConfigured')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function AgentsPage() {
  const t = await getTranslations('gwi.agents')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <LoadingText />
          </div>
        </div>
      }
    >
      <AgentsContent />
    </Suspense>
  )
}
