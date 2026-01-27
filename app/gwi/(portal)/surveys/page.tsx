import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Trash2,
  Play,
  Pause,
  FileText,
  MessageSquare,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

const statusColors = {
  DRAFT: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-gray-100 text-gray-700",
}

async function getSurveys(searchParams: { status?: string; search?: string }) {
  const where: Record<string, unknown> = {}

  if (searchParams.status && searchParams.status !== "all") {
    where.status = searchParams.status
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  const surveys = await prisma.survey.findMany({
    where,
    include: {
      createdBy: { select: { name: true } },
      _count: {
        select: {
          questions: true,
          responses: true,
          distributions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return surveys
}

async function SurveyList({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  const surveys = await getSurveys(searchParams)
  const t = await getTranslations('gwi.surveys')
  const tc = await getTranslations('gwi.common')

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
          <Link href="/gwi/surveys/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('newSurvey')}
          </Link>
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
                defaultValue={searchParams.search}
              />
            </div>
            <Select defaultValue={searchParams.status || "all"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="DRAFT">{t('statuses.draft')}</SelectItem>
                <SelectItem value="ACTIVE">{t('statuses.active')}</SelectItem>
                <SelectItem value="PAUSED">{t('statuses.paused')}</SelectItem>
                <SelectItem value="COMPLETED">{t('statuses.completed')}</SelectItem>
                <SelectItem value="ARCHIVED">{t('statuses.archived')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Survey Table */}
      <Card>
        <CardContent className="p-0">
          {surveys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('surveyName')}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">{t('questions')}</TableHead>
                  <TableHead className="text-center">{t('responses')}</TableHead>
                  <TableHead>{t('createdBy')}</TableHead>
                  <TableHead>{t('createdAt')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/gwi/surveys/${survey.id}`}
                          className="font-medium hover:text-emerald-600"
                        >
                          {survey.name}
                        </Link>
                        {survey.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {survey.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          statusColors[survey.status as keyof typeof statusColors]
                        }
                      >
                        {t(`statuses.${survey.status.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {survey._count.questions}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        {survey._count.responses}
                      </div>
                    </TableCell>
                    <TableCell>{survey.createdBy.name}</TableCell>
                    <TableCell>
                      {new Date(survey.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/gwi/surveys/${survey.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              {tc('edit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/gwi/surveys/${survey.id}/responses`}>
                              <Eye className="mr-2 h-4 w-4" />
                              {tc('viewResponses')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            {tc('duplicate')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {survey.status === "DRAFT" && (
                            <DropdownMenuItem className="text-green-600">
                              <Play className="mr-2 h-4 w-4" />
                              {tc('activate')}
                            </DropdownMenuItem>
                          )}
                          {survey.status === "ACTIVE" && (
                            <DropdownMenuItem className="text-yellow-600">
                              <Pause className="mr-2 h-4 w-4" />
                              {tc('pause')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            {tc('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noSurveysFound')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('getStartedSurvey')}
              </p>
              <Button asChild>
                <Link href="/gwi/surveys/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('newSurvey')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function SurveysPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const t = await getTranslations('gwi.surveys')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
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
      <SurveyList searchParams={params} />
    </Suspense>
  )
}
