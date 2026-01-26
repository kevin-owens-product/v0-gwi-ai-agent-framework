import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CheckCircle,
  XCircle,
  Play,
  TestTube,
  AlertTriangle,
  FileJson,
  FolderTree,
  RefreshCw,
} from "lucide-react"

async function getTaxonomyData() {
  const [categories, mappingRules, attributes] = await Promise.all([
    prisma.taxonomyCategory.findMany({
      where: { isActive: true },
      include: { attributes: true },
      orderBy: { name: "asc" },
    }),
    prisma.taxonomyMappingRule.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    }),
    prisma.taxonomyAttribute.count(),
  ])

  return { categories, mappingRules, attributeCount: attributes }
}

async function TaxonomyValidationContent() {
  const { categories, mappingRules, attributeCount } = await getTaxonomyData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Taxonomy Validation</h1>
          <p className="text-muted-foreground">
            Test and validate taxonomy mappings and rules
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Play className="mr-2 h-4 w-4" />
          Run All Tests
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FolderTree className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileJson className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{attributeCount}</p>
                <p className="text-sm text-muted-foreground">Attributes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mappingRules.length}</p>
                <p className="text-sm text-muted-foreground">Mapping Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Tests Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Mapping
          </CardTitle>
          <CardDescription>
            Enter sample data to test taxonomy mapping rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Field</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select source field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="age">Age</SelectItem>
                  <SelectItem value="gender">Gender</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select target category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.code}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Input (JSON)</label>
            <Textarea
              placeholder='{"age": 25, "gender": "male", "country": "US"}'
              className="font-mono text-sm"
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Play className="mr-2 h-4 w-4" />
              Test Mapping
            </Button>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Results from the last validation test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TestTube className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Test Results Yet</h3>
            <p className="text-muted-foreground max-w-md">
              Enter test data and run a mapping test to see results here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mapping Rules Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Mapping Rules</CardTitle>
          <CardDescription>
            Rules used for taxonomy mapping validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mappingRules.length > 0 ? (
            <div className="space-y-3">
              {mappingRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {rule.sourceField} → {rule.targetCategoryCode}
                        {rule.targetAttributeCode && `.${rule.targetAttributeCode}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Priority: {rule.priority}</Badge>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
              <p className="text-muted-foreground">No mapping rules configured</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function TaxonomyValidationPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Taxonomy Validation</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <TaxonomyValidationContent />
    </Suspense>
  )
}
