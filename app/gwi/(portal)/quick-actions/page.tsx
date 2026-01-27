import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Play,
  Upload,
  Download,
  RefreshCw,
  FileText,
  Database,
  Bot,
  Brain,
  ClipboardList,
  FolderTree,
  BarChart3,
  AlertTriangle,
  Settings,
  Key,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

export default async function QuickActionsPage() {
  const t = await getTranslations('gwi.quickActions')

  const quickActions = [
    {
      title: t('createSurvey'),
      description: t('createSurveyDesc'),
      icon: ClipboardList,
      href: "/gwi/surveys/new",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: t('runPipeline'),
      description: t('runPipelineDesc'),
      icon: Play,
      href: "/gwi/pipelines",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: t('addDataSource'),
      description: t('addDataSourceDesc'),
      icon: Database,
      href: "/gwi/data-sources",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: t('newAgentTemplate'),
      description: t('newAgentTemplateDesc'),
      icon: Bot,
      href: "/gwi/agents/templates/new",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: t('configureLlm'),
      description: t('configureLlmDesc'),
      icon: Brain,
      href: "/gwi/llm/models/new",
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: t('addTaxonomy'),
      description: t('addTaxonomyDesc'),
      icon: FolderTree,
      href: "/gwi/taxonomy",
      color: "bg-cyan-100 text-cyan-600",
    },
  ]

  const dataActions = [
    {
      title: t('syncAllSources'),
      description: t('syncAllSourcesDesc'),
      icon: RefreshCw,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: t('exportData'),
      description: t('exportDataDesc'),
      icon: Download,
      color: "bg-green-100 text-green-600",
    },
    {
      title: t('importData'),
      description: t('importDataDesc'),
      icon: Upload,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: t('generateReport'),
      description: t('generateReportDesc'),
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
    },
  ]

  const systemActions = [
    {
      title: t('viewErrors'),
      description: t('viewErrorsDesc'),
      icon: AlertTriangle,
      href: "/gwi/monitoring/errors",
      color: "bg-red-100 text-red-600",
    },
    {
      title: t('systemSettings'),
      description: t('systemSettingsDesc'),
      icon: Settings,
      href: "/gwi/system/settings",
      color: "bg-slate-100 text-slate-600",
    },
    {
      title: t('apiKeys'),
      description: t('apiKeysDesc'),
      icon: Key,
      href: "/gwi/system/api-keys",
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: t('viewMetrics'),
      description: t('viewMetricsDesc'),
      icon: BarChart3,
      href: "/gwi/monitoring/pipelines",
      color: "bg-indigo-100 text-indigo-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Create Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('createNew')}
          </CardTitle>
          <CardDescription>{t('createNewDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${action.color.split(" ")[0]}`}>
                    <Icon className={`h-6 w-6 ${action.color.split(" ")[1]}`} />
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t('dataOperations')}
          </CardTitle>
          <CardDescription>{t('dataOperationsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dataActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="h-auto flex flex-col items-center justify-center p-6 gap-3"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color.split(" ")[0]}`}>
                    <Icon className={`h-5 w-5 ${action.color.split(" ")[1]}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('systemMonitoring')}
          </CardTitle>
          <CardDescription>{t('systemMonitoringDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex flex-col items-center justify-center p-6 border rounded-lg hover:bg-slate-50 transition-colors gap-3"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color.split(" ")[0]}`}>
                    <Icon className={`h-5 w-5 ${action.color.split(" ")[1]}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Actions Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActions')}</CardTitle>
          <CardDescription>{t('recentActionsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {t('recentActionsTracking')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
