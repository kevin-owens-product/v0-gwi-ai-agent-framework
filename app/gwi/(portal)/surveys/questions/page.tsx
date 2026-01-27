import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, HelpCircle } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "@/lib/i18n/server"

async function getQuestions() {
  const questions = await prisma.surveyQuestion.findMany({
    include: {
      survey: { select: { id: true, name: true, status: true } },
    },
    orderBy: [{ survey: { name: "asc" } }, { order: "asc" }],
    take: 100,
  })

  const stats = await prisma.surveyQuestion.groupBy({
    by: ["type"],
    _count: true,
  })

  return { questions, stats }
}

export default async function SurveyQuestionsPage() {
  const { questions, stats } = await getQuestions()
  const t = await getTranslations('gwi.surveys.questions')

  const totalQuestions = questions.length
  const typeStats = stats.reduce(
    (acc, s) => ({ ...acc, [s.type]: s._count }),
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalQuestions')}</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('types.singleSelect')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.SINGLE_SELECT || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('types.multiSelect')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.MULTI_SELECT || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('types.openText')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeStats.OPEN_TEXT || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allQuestions')}</CardTitle>
          <CardDescription>{t('allQuestionsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {questions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('code')}</TableHead>
                  <TableHead>{t('questionText')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('survey')}</TableHead>
                  <TableHead>{t('required')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-mono text-sm">
                      {question.code}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {question.text}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`types.${question.type.toLowerCase()}`) || question.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/gwi/surveys/${question.survey.id}`}
                        className="text-emerald-600 hover:underline"
                      >
                        {question.survey.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {question.required ? (
                        <Badge className="bg-red-100 text-red-700">{t('required')}</Badge>
                      ) : (
                        <Badge variant="outline">{t('optional')}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noQuestions')}</h3>
              <p className="text-muted-foreground">
                {t('noQuestionsDescription')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
