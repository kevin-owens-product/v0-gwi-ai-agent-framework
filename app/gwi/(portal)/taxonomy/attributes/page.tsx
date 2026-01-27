import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LoadingText } from "@/components/ui/loading-text"
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
import { Plus, Search, Edit, Trash2, Layers, ArrowLeft } from "lucide-react"

async function getAttributes() {
  const attributes = await prisma.taxonomyAttribute.findMany({
    include: {
      category: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  })

  const categories = await prisma.taxonomyCategory.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  })

  return { attributes, categories }
}

async function AttributesContent() {
  const { attributes, categories } = await getAttributes()

  const dataTypeColors: Record<string, string> = {
    string: "bg-blue-100 text-blue-700",
    number: "bg-green-100 text-green-700",
    boolean: "bg-purple-100 text-purple-700",
    date: "bg-orange-100 text-orange-700",
    array: "bg-pink-100 text-pink-700",
    object: "bg-yellow-100 text-yellow-700",
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Attributes</h1>
            <p className="text-muted-foreground">
              Manage taxonomy attributes and their definitions
            </p>
          </div>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          New Attribute
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search attributes..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="array">Array</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attributes Table */}
      <Card>
        <CardContent className="p-0">
          {attributes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attribute</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.map((attr) => (
                  <TableRow key={attr.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{attr.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {attr.code}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/gwi/taxonomy/categories/${attr.category.id}`}
                        className="hover:text-emerald-600"
                      >
                        {attr.category.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          dataTypeColors[attr.dataType] || "bg-slate-100 text-slate-700"
                        }
                      >
                        {attr.dataType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attr.isRequired ? (
                        <Badge className="bg-red-100 text-red-700">Required</Badge>
                      ) : (
                        <span className="text-muted-foreground">Optional</span>
                      )}
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
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No attributes yet</h3>
              <p className="text-muted-foreground mb-4">
                Define attributes for your taxonomy categories
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Attribute
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AttributesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attributes</h1>
            <LoadingText />
          </div>
        </div>
      }
    >
      <AttributesContent />
    </Suspense>
  )
}
