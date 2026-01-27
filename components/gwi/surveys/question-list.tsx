"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  GripVertical,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Hash,
  List,
  CheckSquare,
  Type,
  Calendar,
  BarChart3,
  Grid3X3,
  ExternalLink,
} from "lucide-react"

interface Question {
  id: string
  code: string
  text: string
  type: string
  options: unknown
  validationRules: unknown
  order: number
  required: boolean
  taxonomyLinks: unknown
}

interface QuestionListProps {
  surveyId: string
  questions: Question[]
}

const questionTypeIcons = {
  SINGLE_SELECT: List,
  MULTI_SELECT: CheckSquare,
  SCALE: BarChart3,
  OPEN_TEXT: Type,
  NUMERIC: Hash,
  DATE: Calendar,
  MATRIX: Grid3X3,
}

const questionTypeLabels = {
  SINGLE_SELECT: "Single Select",
  MULTI_SELECT: "Multi Select",
  SCALE: "Scale",
  OPEN_TEXT: "Open Text",
  NUMERIC: "Numeric",
  DATE: "Date",
  MATRIX: "Matrix",
}

export function QuestionList({ surveyId, questions }: QuestionListProps) {
  const t = useTranslations("gwi.surveys.questions")
  const tCommon = useTranslations("common")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    text: "",
    type: "SINGLE_SELECT",
    required: true,
    options: "",
  })

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedQuestions(newExpanded)
  }

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question)
    setFormData({
      code: question.code,
      text: question.text,
      type: question.type,
      required: question.required,
      options: question.options ? JSON.stringify(question.options, null, 2) : "",
    })
    setIsDialogOpen(true)
  }

  const openNewDialog = () => {
    setEditingQuestion(null)
    setFormData({
      code: "",
      text: "",
      type: "SINGLE_SELECT",
      required: true,
      options: "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const url = editingQuestion
        ? `/api/gwi/surveys/${surveyId}/questions/${editingQuestion.id}`
        : `/api/gwi/surveys/${surveyId}/questions`
      const method = editingQuestion ? "PATCH" : "POST"

      const body = {
        ...formData,
        options: formData.options ? JSON.parse(formData.options) : null,
        order: editingQuestion ? editingQuestion.order : questions.length,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to save question:", error)
    }
  }

  const handleDeleteClick = (questionId: string) => {
    setQuestionToDelete(questionId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!questionToDelete) return

    try {
      const response = await fetch(
        `/api/gwi/surveys/${surveyId}/questions/${questionToDelete}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to delete question:", error)
    } finally {
      setShowDeleteConfirm(false)
      setQuestionToDelete(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addQuestion")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? t("editQuestion") : t("addNewQuestion")}
              </DialogTitle>
              <DialogDescription>
                {t("configureSettings")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t("questionCode")}</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="Q1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t("questionType")}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE_SELECT">{t("types.singleSelect")}</SelectItem>
                      <SelectItem value="MULTI_SELECT">{t("types.multiSelect")}</SelectItem>
                      <SelectItem value="SCALE">{t("types.scale")}</SelectItem>
                      <SelectItem value="OPEN_TEXT">{t("types.openText")}</SelectItem>
                      <SelectItem value="NUMERIC">{t("types.numeric")}</SelectItem>
                      <SelectItem value="DATE">{t("types.date")}</SelectItem>
                      <SelectItem value="MATRIX">{t("types.matrix")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">{t("questionText")}</Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  placeholder={t("questionTextPlaceholder")}
                  rows={3}
                />
              </div>

              {(formData.type === "SINGLE_SELECT" ||
                formData.type === "MULTI_SELECT") && (
                <div className="space-y-2">
                  <Label htmlFor="options">{t("optionsJson")}</Label>
                  <Textarea
                    id="options"
                    value={formData.options}
                    onChange={(e) =>
                      setFormData({ ...formData, options: e.target.value })
                    }
                    placeholder={t("optionsPlaceholder")}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, required: checked })
                  }
                />
                <Label htmlFor="required">{t("requiredQuestion")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleSubmit}>
                {editingQuestion ? tCommon("saveChanges") : t("addQuestion")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {questions.length > 0 ? (
          <div className="space-y-2">
            {questions.map((question) => {
              const Icon =
                questionTypeIcons[question.type as keyof typeof questionTypeIcons] ||
                Type
              const isExpanded = expandedQuestions.has(question.id)

              return (
                <div
                  key={question.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4 bg-slate-50">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <span className="text-sm font-mono text-muted-foreground w-12">
                      {question.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{question.text}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      {questionTypeLabels[question.type as keyof typeof questionTypeLabels]}
                    </Badge>
                    {question.required && (
                      <Badge variant="secondary">{tCommon("required")}</Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpanded(question.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/gwi/surveys/${surveyId}/questions/${question.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="p-4 border-t bg-white">
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-muted-foreground">{t("order")}</dt>
                          <dd className="font-medium">{question.order}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">{tCommon("type")}</dt>
                          <dd className="font-medium">{question.type}</dd>
                        </div>
                        {question.options != null && (
                          <div className="col-span-2">
                            <dt className="text-muted-foreground mb-1">{t("options")}</dt>
                            <dd className="font-mono text-xs bg-slate-100 p-2 rounded whitespace-pre-wrap">
                              {JSON.stringify(question.options as object, null, 2)}
                            </dd>
                          </div>
                        )}
                        {question.validationRules != null && (
                          <div className="col-span-2">
                            <dt className="text-muted-foreground mb-1">
                              {t("validationRules")}
                            </dt>
                            <dd className="font-mono text-xs bg-slate-100 p-2 rounded whitespace-pre-wrap">
                              {JSON.stringify(question.validationRules as object, null, 2)}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <List className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">{t("noQuestionsYet")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("startBuilding")}
            </p>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addFirstQuestion")}
            </Button>
          </div>
        )}
      </CardContent>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t("deleteQuestion")}
        description={t("deleteConfirmation")}
        confirmText={tCommon("delete")}
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </Card>
  )
}
