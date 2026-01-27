import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Tag,
  Layers,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TaxonomyTree } from "@/components/gwi/taxonomy/taxonomy-tree"
import { getTranslations } from "@/lib/i18n/server"

interface CategoryWithChildren {
  id: string
  name: string
  code: string
  description: string | null
  parentId: string | null
  version: number
  isActive: boolean
  _count: {
    attributes: number
    children: number
  }
  children?: CategoryWithChildren[]
}

async function getTaxonomyData() {
  // Get all categories with counts
  const categories = await prisma.taxonomyCategory.findMany({
    include: {
      _count: {
        select: {
          attributes: true,
          children: true,
        },
      },
    },
    orderBy: [{ name: "asc" }],
  })

  // Build tree structure
  const buildTree = (
    items: typeof categories,
    parentId: string | null = null
  ): CategoryWithChildren[] => {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }))
  }

  const tree = buildTree(categories)

  // Get stats
  const totalCategories = categories.length
  const activeCategories = categories.filter((c) => c.isActive).length
  const totalAttributes = await prisma.taxonomyAttribute.count()
  const totalMappings = await prisma.taxonomyMappingRule.count()

  return {
    tree,
    stats: {
      totalCategories,
      activeCategories,
      totalAttributes,
      totalMappings,
    },
  }
}

async function TaxonomyContent() {
  const { tree, stats } = await getTaxonomyData()
  const t = await getTranslations('gwi.taxonomy')

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
          <Link href="/gwi/taxonomy/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('newCategory')}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FolderTree className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
                <p className="text-sm text-muted-foreground">{t('totalCategories')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeCategories}</p>
                <p className="text-sm text-muted-foreground">{t('activeCategories')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAttributes}</p>
                <p className="text-sm text-muted-foreground">{t('attributes')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <ChevronRight className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMappings}</p>
                <p className="text-sm text-muted-foreground">{t('mappingRules')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/gwi/taxonomy/attributes">
            <Layers className="mr-2 h-4 w-4" />
            {t('manageAttributes')}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/taxonomy/mappings">
            <ChevronRight className="mr-2 h-4 w-4" />
            {t('mappingRules')}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/taxonomy/validation">
            {t('validationTesting')}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Tree */}
      <Card>
        <CardHeader>
          <CardTitle>{t('categoryHierarchy')}</CardTitle>
          <CardDescription>
            {t('categoryHierarchyDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tree.length > 0 ? (
            <TaxonomyTree categories={tree} />
          ) : (
            <div className="text-center py-12">
              <FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium">{t('noCategoriesYet')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('startBuildingTaxonomy')}
              </p>
              <Button asChild>
                <Link href="/gwi/taxonomy/categories/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createFirstCategory')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function TaxonomyPage() {
  const t = await getTranslations('gwi.taxonomy')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('loading')}</p>
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
      <TaxonomyContent />
    </Suspense>
  )
}
