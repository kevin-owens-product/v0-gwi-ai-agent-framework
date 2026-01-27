import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Database,
  Search,
  Table,
  FileJson,
  RefreshCw,
  Eye,
  Copy,
  ChevronRight,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getDataSourcesWithSchemas() {
  const dataSources = await prisma.gWIDataSourceConnection.findMany({
    where: { isActive: true },
    include: {
      createdBy: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  })

  return dataSources
}

// Mock schema data - in production this would come from the actual data sources
const mockSchemas: Record<string, Array<{ name: string; columns: Array<{ name: string; type: string; nullable: boolean }> }>> = {
  postgresql: [
    {
      name: "surveys",
      columns: [
        { name: "id", type: "uuid", nullable: false },
        { name: "title", type: "varchar(255)", nullable: false },
        { name: "status", type: "varchar(50)", nullable: false },
        { name: "created_at", type: "timestamp", nullable: false },
      ],
    },
    {
      name: "responses",
      columns: [
        { name: "id", type: "uuid", nullable: false },
        { name: "survey_id", type: "uuid", nullable: false },
        { name: "respondent_id", type: "varchar(100)", nullable: true },
        { name: "data", type: "jsonb", nullable: false },
      ],
    },
  ],
  bigquery: [
    {
      name: "analytics_events",
      columns: [
        { name: "event_id", type: "STRING", nullable: false },
        { name: "event_type", type: "STRING", nullable: false },
        { name: "timestamp", type: "TIMESTAMP", nullable: false },
        { name: "properties", type: "JSON", nullable: true },
      ],
    },
  ],
}

async function DataSourceSchemasContent() {
  const dataSources = await getDataSourcesWithSchemas()
  const t = await getTranslations('gwi.dataSources.schemas')
  const tCommon = await getTranslations('common')

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
          <RefreshCw className="mr-2 h-4 w-4" />
          {t('refreshSchemas')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dataSources.length}</p>
                <p className="text-sm text-muted-foreground">{t('dataSources')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Table className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">{t('totalTables')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <FileJson className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">{t('totalColumns')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('searchPlaceholder')} className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('dataSource')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSources')}</SelectItem>
                {dataSources.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    {ds.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schema Browser */}
      {dataSources.length > 0 ? (
        <div className="space-y-4">
          {dataSources.map((ds) => {
            const schemas = mockSchemas[ds.type.toLowerCase()] || []
            return (
              <Card key={ds.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Database className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{ds.name}</CardTitle>
                        <CardDescription>
                          {ds.type} - {t('lastSynced')}:{" "}
                          {ds.lastSyncAt
                            ? new Date(ds.lastSyncAt).toLocaleString()
                            : t('never')}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{ds.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {schemas.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                      {schemas.map((table) => (
                        <AccordionItem key={table.name} value={table.name}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                              <Table className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono">{table.name}</span>
                              <Badge variant="secondary" className="ml-2">
                                {t('columnsCount', { count: table.columns.length })}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="border rounded-lg overflow-hidden mt-2">
                              <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="text-left px-4 py-2 font-medium">
                                      {t('column')}
                                    </th>
                                    <th className="text-left px-4 py-2 font-medium">
                                      {tCommon('type')}
                                    </th>
                                    <th className="text-left px-4 py-2 font-medium">
                                      {t('nullable')}
                                    </th>
                                    <th className="w-[80px]"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.columns.map((col) => (
                                    <tr
                                      key={col.name}
                                      className="border-t hover:bg-slate-50"
                                    >
                                      <td className="px-4 py-2 font-mono">
                                        {col.name}
                                      </td>
                                      <td className="px-4 py-2">
                                        <code className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                                          {col.type}
                                        </code>
                                      </td>
                                      <td className="px-4 py-2">
                                        {col.nullable ? tCommon('yes') : tCommon('no')}
                                      </td>
                                      <td className="px-4 py-2">
                                        <Button variant="ghost" size="sm">
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8">
                      <Table className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {t('schemaNotDiscovered')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t('noDataSources')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('noDataSourcesDescription')}
            </p>
            <Button asChild>
              <Link href="/gwi/data-sources">
                <ChevronRight className="mr-2 h-4 w-4" />
                {t('goToDataSources')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default async function DataSourceSchemasPage() {
  const t = await getTranslations('gwi.dataSources.schemas')

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
      <DataSourceSchemasContent />
    </Suspense>
  )
}
