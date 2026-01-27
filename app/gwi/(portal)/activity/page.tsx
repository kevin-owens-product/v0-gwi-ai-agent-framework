import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Activity,
  Search,
  User,
  Database,
  Settings,
  FileText,
  Bot,
  Brain,
  Workflow,
  Shield,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

const actionIcons: Record<string, typeof Activity> = {
  CREATE: FileText,
  UPDATE: Settings,
  DELETE: Database,
  LOGIN: User,
  PIPELINE: Workflow,
  AGENT: Bot,
  LLM: Brain,
  ACCESS: Shield,
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  VIEW: "bg-slate-100 text-slate-700",
}

async function getAuditLogs() {
  const logs = await prisma.gWIAuditLog.findMany({
    include: {
      admin: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const todayCount = await prisma.gWIAuditLog.count({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  })

  return { logs, todayCount }
}

async function ActivityContent() {
  const { logs, todayCount } = await getAuditLogs()
  const t = await getTranslations('gwi.activity')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayCount}</p>
                <p className="text-sm text-muted-foreground">{t('actionsToday')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(logs.map((l) => l.adminId)).size}
                </p>
                <p className="text-sm text-muted-foreground">{t('activeUsers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(logs.map((l) => l.resourceType)).size}
                </p>
                <p className="text-sm text-muted-foreground">{t('resourceTypes')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('searchPlaceholder')} className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('resourceType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allResources')}</SelectItem>
                <SelectItem value="pipeline">{t('resources.pipeline')}</SelectItem>
                <SelectItem value="survey">{t('resources.survey')}</SelectItem>
                <SelectItem value="llm">{t('resources.llm')}</SelectItem>
                <SelectItem value="agent">{t('resources.agent')}</SelectItem>
                <SelectItem value="data_source">{t('resources.dataSource')}</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('action')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allActions')}</SelectItem>
                <SelectItem value="CREATE">{t('actions.create')}</SelectItem>
                <SelectItem value="UPDATE">{t('actions.update')}</SelectItem>
                <SelectItem value="DELETE">{t('actions.delete')}</SelectItem>
                <SelectItem value="VIEW">{t('actions.view')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
          <CardDescription>{t('recentActivityDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => {
                const Icon = actionIcons[log.action.split("_")[0]] || Activity
                const actionType = log.action.split("_")[0]
                const colorClass = actionColors[actionType] || "bg-slate-100 text-slate-700"

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-slate-50"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass.split(" ")[0]}`}>
                      <Icon className={`h-5 w-5 ${colorClass.split(" ")[1]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{log.admin.name || log.admin.email}</p>
                        <Badge className={colorClass}>{log.action}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {log.resourceType}
                        {log.resourceId && ` (${log.resourceId.slice(0, 8)}...)`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                        {log.ipAddress && ` ${t('from')} ${log.ipAddress}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noActivityYet')}</h3>
              <p className="text-muted-foreground">
                {t('actionsWillAppear')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function ActivityPage() {
  const t = await getTranslations('gwi.activity')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      }
    >
      <ActivityContent />
    </Suspense>
  )
}
