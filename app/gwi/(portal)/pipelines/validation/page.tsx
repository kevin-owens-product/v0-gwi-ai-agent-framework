import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  FileCode,
  Workflow,
} from "lucide-react"

const severityColors: Record<string, string> = {
  error: "bg-red-100 text-red-700",
  warning: "bg-yellow-100 text-yellow-700",
  info: "bg-blue-100 text-blue-700",
}

const severityIcons: Record<string, typeof AlertTriangle> = {
  error: XCircle,
  warning: AlertTriangle,
  info: CheckCircle,
}

async function getValidationRules() {
  const rules = await prisma.pipelineValidationRule.findMany({
    include: {
      pipeline: { select: { name: true, type: true } },
    },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  })

  const activeCount = rules.filter((r) => r.isActive).length
  const errorRules = rules.filter((r) => r.severity === "error").length
  const warningRules = rules.filter((r) => r.severity === "warning").length

  return { rules, activeCount, errorRules, warningRules }
}

async function ValidationRulesContent() {
  const { rules, activeCount, errorRules, warningRules } = await getValidationRules()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Validation Rules</h1>
          <p className="text-muted-foreground">
            Configure data validation rules for pipelines
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rules.length}</p>
                <p className="text-sm text-muted-foreground">Total Rules</p>
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
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorRules}</p>
                <p className="text-sm text-muted-foreground">Error Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warningRules}</p>
                <p className="text-sm text-muted-foreground">Warning Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Validation Rules</CardTitle>
          <CardDescription>
            Rules that validate data during pipeline execution
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Pipeline</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Rule Definition</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => {
                  const SeverityIcon = severityIcons[rule.severity] || AlertTriangle
                  return (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                            <FileCode className="h-4 w-4 text-slate-600" />
                          </div>
                          <span className="font-medium">{rule.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/gwi/pipelines/${rule.pipelineId}`}
                          className="flex items-center gap-2 hover:text-emerald-600"
                        >
                          <Workflow className="h-4 w-4" />
                          <span>{rule.pipeline.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${severityColors[rule.severity]} gap-1`}>
                          <SeverityIcon className="h-3 w-3" />
                          {rule.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded max-w-xs truncate block">
                          {JSON.stringify(rule.rule).slice(0, 50)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Switch checked={rule.isActive} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Rule
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileCode className="mr-2 h-4 w-4" />
                              View Definition
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Validation Rules</h3>
              <p className="text-muted-foreground mb-4">
                Add validation rules to ensure data quality in your pipelines
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Rule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Common Rule Templates</CardTitle>
          <CardDescription>
            Quick-start templates for common validation scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Required Field", description: "Ensure a field is not null or empty" },
              { name: "Data Type Check", description: "Validate field matches expected type" },
              { name: "Range Validation", description: "Check numeric values are within range" },
              { name: "Pattern Match", description: "Validate against regex pattern" },
              { name: "Referential Integrity", description: "Ensure foreign key exists" },
              { name: "Uniqueness Check", description: "Verify no duplicate values" },
            ].map((template) => (
              <div
                key={template.name}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PipelineValidationPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Validation Rules</h1>
            <p className="text-muted-foreground">Loading rules...</p>
          </div>
        </div>
      }
    >
      <ValidationRulesContent />
    </Suspense>
  )
}
