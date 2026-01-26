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
  FolderTree,
  Tag,
  Layers,
  Settings,
  ChevronRight,
  Plus,
} from "lucide-react"
import { CategoryEditor } from "@/components/gwi/taxonomy/category-editor"

async function getCategory(id: string) {
  const category = await prisma.taxonomyCategory.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true, code: true } },
      children: {
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          isActive: true,
          _count: { select: { attributes: true, children: true } },
        },
        orderBy: { name: "asc" },
      },
      attributes: {
        orderBy: { name: "asc" },
      },
      organization: { select: { id: true, name: true, slug: true } },
      _count: {
        select: {
          attributes: true,
          children: true,
        },
      },
    },
  })

  return category
}

async function getAllCategories() {
  return prisma.taxonomyCategory.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: { name: "asc" },
  })
}

async function CategoryDetail({ id }: { id: string }) {
  const [category, allCategories] = await Promise.all([
    getCategory(id),
    getAllCategories(),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gwi/taxonomy">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
              <Badge
                variant={category.isActive ? "default" : "secondary"}
                className={category.isActive ? "bg-green-100 text-green-700" : ""}
              >
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
              {category.orgId === null && (
                <Badge variant="outline">Global</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono text-muted-foreground">
                {category.code}
              </span>
              {category.parent && (
                <>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  <Link
                    href={`/gwi/taxonomy/categories/${category.parent.id}`}
                    className="text-sm text-muted-foreground hover:text-emerald-600"
                  >
                    {category.parent.name}
                  </Link>
                </>
              )}
            </div>
            {category.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {category.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/gwi/taxonomy/categories/new?parentId=${category.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Child
            </Link>
          </Button>
        </div>
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
                <p className="text-2xl font-bold">{category._count.children}</p>
                <p className="text-sm text-muted-foreground">Child Categories</p>
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
                <p className="text-2xl font-bold">{category._count.attributes}</p>
                <p className="text-sm text-muted-foreground">Attributes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Tag className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">v{category.version}</p>
                <p className="text-sm text-muted-foreground">Version</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {category.organization?.name || "Global"}
                </p>
                <p className="text-sm text-muted-foreground">Scope</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="children" className="space-y-4">
        <TabsList>
          <TabsTrigger value="children" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            Children ({category._count.children})
          </TabsTrigger>
          <TabsTrigger value="attributes" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Attributes ({category._count.attributes})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="children">
          <Card>
            <CardHeader>
              <CardTitle>Child Categories</CardTitle>
              <CardDescription>
                Sub-categories within this taxonomy category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {category.children.length > 0 ? (
                <div className="space-y-2">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/gwi/taxonomy/categories/${child.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {child._count.children > 0 ? (
                          <FolderTree className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Tag className="h-4 w-4 text-emerald-500" />
                        )}
                        <div>
                          <p className="font-medium">{child.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {child.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!child.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {child._count.attributes > 0 && (
                          <Badge variant="outline">
                            {child._count.attributes} attrs
                          </Badge>
                        )}
                        {child._count.children > 0 && (
                          <Badge variant="outline">
                            {child._count.children} children
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href={`/gwi/taxonomy/categories/new?parentId=${category.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Child Category
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No child categories</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add sub-categories to organize this taxonomy
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/gwi/taxonomy/categories/new?parentId=${category.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Child Category
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes">
          <Card>
            <CardHeader>
              <CardTitle>Category Attributes</CardTitle>
              <CardDescription>
                Data attributes defined for this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {category.attributes.length > 0 ? (
                <div className="space-y-2">
                  {category.attributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{attr.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {attr.code}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{attr.dataType}</Badge>
                        {attr.isRequired && (
                          <Badge className="bg-red-100 text-red-700">Required</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href={`/gwi/taxonomy/attributes/new?categoryId=${category.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Attribute
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No attributes defined</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define data attributes for this category
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/gwi/taxonomy/attributes/new?categoryId=${category.id}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Attribute
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <CategoryEditor
            category={{
              id: category.id,
              name: category.name,
              code: category.code,
              description: category.description,
              parentId: category.parentId,
              version: category.version,
              isActive: category.isActive,
              orgId: category.orgId,
            }}
            parentCategories={allCategories.filter((c) => c.id !== category.id)}
          />
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Category Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-medium font-mono text-xs">{category.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Version</dt>
              <dd className="font-medium">{category.version}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created At</dt>
              <dd className="font-medium">
                {new Date(category.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last Updated</dt>
              <dd className="font-medium">
                {new Date(category.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function TaxonomyCategoryDetailPage({
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
      <CategoryDetail id={id} />
    </Suspense>
  )
}
