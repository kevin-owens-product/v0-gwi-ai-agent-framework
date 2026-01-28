import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LoadingText } from "@/components/ui/loading-text"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Search, Download, User, Clock } from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getAuditLogs() {
  try {
    const logs = await prisma.gWIAuditLog.findMany({
      include: {
        admin: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return logs
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    throw error
  }
}

async function AuditLogsContent() {
  try {
    const logs = await getAuditLogs()
    const t = await getTranslations('gwi.system.audit')
    const tCommon = await getTranslations('common')

  const actionColors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    VIEW: "bg-gray-100 text-gray-700",
  }

  const getActionColor = (action: string) => {
    for (const [key, value] of Object.entries(actionColors)) {
      if (action.includes(key)) return value
    }
    return "bg-gray-100 text-gray-700"
  }

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
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {t('exportLogs')}
        </Button>
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
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="survey">{t('resourceTypes.survey')}</SelectItem>
                <SelectItem value="pipeline">{t('resourceTypes.pipeline')}</SelectItem>
                <SelectItem value="llm_configuration">{t('resourceTypes.llmConfig')}</SelectItem>
                <SelectItem value="agent_template">{t('resourceTypes.agentTemplate')}</SelectItem>
                <SelectItem value="taxonomy_category">{t('resourceTypes.taxonomy')}</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={tCommon('action')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allActions')}</SelectItem>
                <SelectItem value="create">{tCommon('create')}</SelectItem>
                <SelectItem value="update">{tCommon('update')}</SelectItem>
                <SelectItem value="delete">{tCommon('delete')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent className="p-0">
          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('timestamp')}</TableHead>
                  <TableHead>{t('user')}</TableHead>
                  <TableHead>{tCommon('action')}</TableHead>
                  <TableHead>{t('resource')}</TableHead>
                  <TableHead>{t('ipAddress')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{log.admin.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.admin.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.resourceType}</p>
                        {log.resourceId && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {log.resourceId}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{log.ipAddress || "-"}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={FileText}
              title={t('noAuditLogs')}
              description={t('noAuditLogsDescription')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
  } catch (error) {
    console.error("Error in AuditLogsContent:", error)
    const t = await getTranslations('gwi.system.audit')
    const tCommon = await getTranslations('common')
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{tCommon('errors.loadFailed')}</p>
        </div>
      </div>
    )
  }
}

export default async function AuditPage() {
  const t = await getTranslations('gwi.system.audit')

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
      <AuditLogsContent />
    </Suspense>
  )
}
