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
import { Plus, Search, Edit, Trash2, GitBranch, ArrowLeft, ArrowRight } from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getMappings() {
  const mappings = await prisma.taxonomyMappingRule.findMany({
    orderBy: [{ priority: "desc" }, { name: "asc" }],
  })

  return mappings
}

async function MappingsContent() {
  const mappings = await getMappings()
  const t = await getTranslations('gwi.taxonomy.mappings')
  const tCommon = await getTranslations('common')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gwi/taxonomy">
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
          {t('newMappingRule')}
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

      {/* Mappings Table */}
      <Card>
        <CardContent className="p-0">
          {mappings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('ruleName')}</TableHead>
                  <TableHead>{t('sourceField')}</TableHead>
                  <TableHead></TableHead>
                  <TableHead>{t('targetCategory')}</TableHead>
                  <TableHead>{t('priority')}</TableHead>
                  <TableHead>{tCommon('active')}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <p className="font-medium">{rule.name}</p>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-slate-100 rounded text-sm">
                        {rule.sourceField}
                      </code>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <div>
                        <code className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm">
                          {rule.targetCategoryCode}
                        </code>
                        {rule.targetAttributeCode && (
                          <span className="text-muted-foreground ml-1 text-sm">
                            .{rule.targetAttributeCode}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={rule.isActive} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
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
              <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noMappingRules')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('noMappingRulesDescription')}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('createMappingRule')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function MappingsPage() {
  const t = await getTranslations('gwi.taxonomy.mappings')

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
      <MappingsContent />
    </Suspense>
  )
}
