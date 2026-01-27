import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Search, Download, Eye, CheckCircle, Clock, MessageSquare } from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getResponses(searchParams: { surveyId?: string; status?: string }) {
  const where: Record<string, unknown> = {}

  if (searchParams.surveyId && searchParams.surveyId !== "all") {
    where.surveyId = searchParams.surveyId
  }

  if (searchParams.status === "completed") {
    where.completedAt = { not: null }
  } else if (searchParams.status === "incomplete") {
    where.completedAt = null
  }

  const responses = await prisma.surveyResponse.findMany({
    where,
    include: {
      survey: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const surveys = await prisma.survey.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return { responses, surveys }
}

async function ResponsesList({
  searchParams,
}: {
  searchParams: { surveyId?: string; status?: string }
}) {
  const { responses, surveys } = await getResponses(searchParams)
  const t = await getTranslations('gwi.surveys.responses')
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
          <Download className="mr-2 h-4 w-4" />
          {t('exportResponses')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                className="pl-9"
              />
            </div>
            <Select defaultValue={searchParams.surveyId || "all"}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder={t('filterBySurvey')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSurveys')}</SelectItem>
                {surveys.map((survey) => (
                  <SelectItem key={survey.id} value={survey.id}>
                    {survey.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue={searchParams.status || "all"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="completed">{t('completed')}</SelectItem>
                <SelectItem value="incomplete">{t('incomplete')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardContent className="p-0">
          {responses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('respondentId')}</TableHead>
                  <TableHead>{t('survey')}</TableHead>
                  <TableHead>{tCommon('status')}</TableHead>
                  <TableHead>{t('startedAt')}</TableHead>
                  <TableHead>{t('completedAt')}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-mono text-sm">
                      {response.respondentId}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/gwi/surveys/${response.survey.id}`}
                        className="hover:text-emerald-600"
                      >
                        {response.survey.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {response.completedAt ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {t('completed')}
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          <Clock className="mr-1 h-3 w-3" />
                          {t('inProgress')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(response.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {response.completedAt
                        ? new Date(response.completedAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/gwi/surveys/${response.surveyId}/responses/${response.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noResponses')}</h3>
              <p className="text-muted-foreground">
                {t('noResponsesDescription')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function SurveyResponsesPage({
  searchParams,
}: {
  searchParams: Promise<{ surveyId?: string; status?: string }>
}) {
  const params = await searchParams
  const t = await getTranslations('gwi.surveys.responses')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-10 w-full bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResponsesList searchParams={params} />
    </Suspense>
  )
}
