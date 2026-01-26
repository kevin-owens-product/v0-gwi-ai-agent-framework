import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Target, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
}

async function getDistributions() {
  const distributions = await prisma.surveyDistribution.findMany({
    include: {
      survey: { select: { id: true, name: true, status: true } },
    },
    orderBy: { startDate: "desc" },
    take: 50,
  })

  const totals = await prisma.surveyDistribution.aggregate({
    _sum: {
      targetCount: true,
      completedCount: true,
    },
  })

  return { distributions, totals }
}

export default async function SurveyDistributionPage() {
  const { distributions, totals } = await getDistributions()

  const totalTarget = totals._sum.targetCount || 0
  const totalCompleted = totals._sum.completedCount || 0
  const overallProgress = totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Survey Distribution</h1>
        <p className="text-muted-foreground">
          Manage survey distribution channels and track completion rates
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTarget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Distributions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {distributions.filter((d) => d.status === "active").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Distributions</CardTitle>
          <CardDescription>Survey distribution channels and progress</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {distributions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Survey</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Date Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributions.map((dist) => {
                  const progress =
                    dist.targetCount > 0
                      ? (dist.completedCount / dist.targetCount) * 100
                      : 0
                  return (
                    <TableRow key={dist.id}>
                      <TableCell>
                        <Link
                          href={`/gwi/surveys/${dist.survey.id}`}
                          className="text-emerald-600 hover:underline"
                        >
                          {dist.survey.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{dist.channel}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[dist.status] || "bg-slate-100"}>
                          {dist.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {dist.targetCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {dist.completedCount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-16" />
                          <span className="text-sm text-muted-foreground">
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(dist.startDate).toLocaleDateString()} -
                        {dist.endDate
                          ? new Date(dist.endDate).toLocaleDateString()
                          : "Ongoing"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No distributions found</h3>
              <p className="text-muted-foreground">
                Create survey distributions to start collecting responses
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
