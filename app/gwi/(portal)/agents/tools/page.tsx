import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { LoadingText } from "@/components/ui/loading-text"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Wrench, Edit, Trash2, ArrowLeft } from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getTools() {
  const tools = await prisma.systemToolConfiguration.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
  })

  return tools
}

async function ToolsContent() {
  const tools = await getTools()
  const t = await getTranslations('gwi.agents.tools')

  const typeColors: Record<string, string> = {
    api: "bg-blue-100 text-blue-700",
    function: "bg-purple-100 text-purple-700",
    integration: "bg-green-100 text-green-700",
    utility: "bg-orange-100 text-orange-700",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gwi/agents">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          {t('addTool')}
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t('searchPlaceholder')} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {/* Tools Table */}
      <Card>
        <CardContent className="p-0">
          {tools.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('toolName')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead>{t('active')}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                          <Wrench className="h-4 w-4 text-slate-600" />
                        </div>
                        <span className="font-medium">{tool.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeColors[tool.type] || "bg-gray-100 text-gray-700"}>
                        {tool.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {tool.description || "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Switch checked={tool.isActive} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noToolsConfigured')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('addToolsToEnable')}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('addFirstTool')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function ToolsPage() {
  const t = await getTranslations('gwi.agents.tools')

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
      <ToolsContent />
    </Suspense>
  )
}
