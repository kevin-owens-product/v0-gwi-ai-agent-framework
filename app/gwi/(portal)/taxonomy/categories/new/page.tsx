import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CategoryEditor } from "@/components/gwi/taxonomy/category-editor"

interface SearchParams {
  parentId?: string
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

async function NewCategoryContent({ parentId }: { parentId?: string }) {
  const categories = await getAllCategories()

  // Validate parentId if provided
  let validParentId: string | undefined
  if (parentId) {
    const parentExists = categories.find((c) => c.id === parentId)
    if (parentExists) {
      validParentId = parentId
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gwi/taxonomy">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Category</h1>
          <p className="text-muted-foreground">
            Set up a new taxonomy category for data classification
          </p>
        </div>
      </div>

      {/* Editor */}
      <CategoryEditor
        parentCategories={categories}
        defaultParentId={validParentId}
      />
    </div>
  )
}

export default async function NewTaxonomyCategoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { parentId } = await searchParams

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
            <div>
              <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mt-2" />
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <NewCategoryContent parentId={parentId} />
    </Suspense>
  )
}
