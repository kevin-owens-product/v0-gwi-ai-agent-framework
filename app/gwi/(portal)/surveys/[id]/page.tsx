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
  Play,
  Pause,
  Settings,
  FileText,
  MessageSquare,
  Send,
  Users,
  CheckCircle,
} from "lucide-react"
import { SurveyEditor } from "@/components/gwi/surveys/survey-editor"
import { QuestionList } from "@/components/gwi/surveys/question-list"
import { getTranslations } from "@/lib/i18n/server"

const statusColors = {
  DRAFT: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-green-100 text-green-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-gray-100 text-gray-700",
}

async function getSurvey(id: string) {
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      questions: { orderBy: { order: "asc" } },
      distributions: true,
      _count: {
        select: {
          responses: true,
        },
      },
    },
  })

  return survey
}

async function SurveyDetail({ id }: { id: string }) {
  const survey = await getSurvey(id)

  if (!survey) {
    notFound()
  }

  const completedResponses = await prisma.surveyResponse.count({
    where: { surveyId: id, completedAt: { not: null } },
  })

  const totalTargeted = survey.distributions.reduce(
    (sum, d) => sum + d.targetCount,
    0
  )

  const t = await getTranslations("gwi.surveys")
  const tCommon = await getTranslations("common")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/gwi/surveys">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{survey.name}</h1>
              <Badge
                className={statusColors[survey.status as keyof typeof statusColors]}
              >
                {t(`statuses.${survey.status.toLowerCase()}`)}
              </Badge>
            </div>
            {survey.description && (
              <p className="text-muted-foreground mt-1">{survey.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {survey.status === "DRAFT" && (
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="mr-2 h-4 w-4" />
              {t("detail.activateSurvey")}
            </Button>
          )}
          {survey.status === "ACTIVE" && (
            <Button variant="outline" className="text-yellow-600 border-yellow-300">
              <Pause className="mr-2 h-4 w-4" />
              {t("detail.pauseSurvey")}
            </Button>
          )}
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            {tCommon("settings")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{survey.questions.length}</p>
                <p className="text-sm text-muted-foreground">{t("detail.questions")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{survey._count.responses}</p>
                <p className="text-sm text-muted-foreground">{t("detail.totalResponses")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedResponses}</p>
                <p className="text-sm text-muted-foreground">{t("detail.completed")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTargeted}</p>
                <p className="text-sm text-muted-foreground">{t("detail.targetCount")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("detail.questions")}
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t("detail.responses")}
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {t("detail.distribution")}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {tCommon("settings")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <QuestionList surveyId={survey.id} questions={survey.questions} />
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.surveyResponses")}</CardTitle>
              <CardDescription>
                {t("detail.surveyResponsesDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {survey._count.responses > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button asChild>
                      <Link href={`/gwi/surveys/${survey.id}/responses`}>
                        {t("detail.viewAllResponses")}
                      </Link>
                    </Button>
                  </div>
                  <p className="text-muted-foreground">
                    {t("detail.responsesCollected", { count: survey._count.responses, completed: completedResponses })}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t("detail.noResponsesYet")}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("detail.responsesWillAppear")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.distributionChannels")}</CardTitle>
              <CardDescription>
                {t("detail.distributionDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {survey.distributions.length > 0 ? (
                <div className="space-y-4">
                  {survey.distributions.map((dist) => (
                    <div
                      key={dist.id}
                      className="flex items-center justify-between border p-4 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{dist.channel}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("detail.target")}: {dist.targetCount} | {t("detail.completed")}: {dist.completedCount}
                        </p>
                      </div>
                      <Badge
                        variant={dist.status === "active" ? "default" : "secondary"}
                      >
                        {dist.status}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    {t("detail.addDistributionChannel")}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t("detail.noDistributionChannels")}</p>
                  <Button className="mt-4">{t("detail.addDistributionChannel")}</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <SurveyEditor survey={survey} />
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("detail.surveyInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("detail.version")}</dt>
              <dd className="font-medium">{survey.version}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("detail.createdBy")}</dt>
              <dd className="font-medium">{survey.createdBy.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{tCommon("createdAt")}</dt>
              <dd className="font-medium">
                {new Date(survey.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{tCommon("lastUpdated")}</dt>
              <dd className="font-medium">
                {new Date(survey.updatedAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function SurveyDetailPage({
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
      <SurveyDetail id={id} />
    </Suspense>
  )
}
