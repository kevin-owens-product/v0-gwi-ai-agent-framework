"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { QuestionBuilder } from "./question-builder"
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
    // For SINGLE_SELECT and MULTI_SELECT: array of option strings
    optionList: [] as string[],
    newOption: "",
    // For SCALE: numeric scale configuration
    scaleMin: 1,
    scaleMax: 10,
    scaleStep: 1,
    scaleLeftLabel: "",
    scaleRightLabel: "",
    // For MATRIX: rows and columns
    matrixRows: [] as string[],
    matrixColumns: [] as string[],
    newMatrixRow: "",
    newMatrixColumn: "",
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
    
    // Parse options based on question type
    let optionList: string[] = []
    let scaleConfig = { min: 1, max: 10, step: 1, leftLabel: "", rightLabel: "" }
    let matrixConfig = { rows: [] as string[], columns: [] as string[] }
    
    if (question.options) {
      const options = question.options as unknown
      if (question.type === "SINGLE_SELECT" || question.type === "MULTI_SELECT") {
        if (Array.isArray(options)) {
          optionList = options.map((opt: unknown) => 
            typeof opt === 'string' ? opt : typeof opt === 'object' && opt !== null && 'label' in opt ? String(opt.label) : String(opt)
          )
        }
      } else if (question.type === "SCALE") {
        if (typeof options === 'object' && options !== null) {
          const scale = options as Record<string, unknown>
          scaleConfig = {
            min: typeof scale.min === 'number' ? scale.min : 1,
            max: typeof scale.max === 'number' ? scale.max : 10,
            step: typeof scale.step === 'number' ? scale.step : 1,
            leftLabel: typeof scale.leftLabel === 'string' ? scale.leftLabel : "",
            rightLabel: typeof scale.rightLabel === 'string' ? scale.rightLabel : "",
          }
        }
      } else if (question.type === "MATRIX") {
        if (typeof options === 'object' && options !== null) {
          const matrix = options as Record<string, unknown>
          matrixConfig = {
            rows: Array.isArray(matrix.rows) ? matrix.rows.map(String) : [],
            columns: Array.isArray(matrix.columns) ? matrix.columns.map(String) : [],
          }
        }
      }
    }
    
    setFormData({
      code: question.code,
      text: question.text,
      type: question.type,
      required: question.required,
      optionList,
      newOption: "",
      scaleMin: scaleConfig.min,
      scaleMax: scaleConfig.max,
      scaleStep: scaleConfig.step,
      scaleLeftLabel: scaleConfig.leftLabel,
      scaleRightLabel: scaleConfig.rightLabel,
      matrixRows: matrixConfig.rows,
      matrixColumns: matrixConfig.columns,
      newMatrixRow: "",
      newMatrixColumn: "",
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
      optionList: [],
      newOption: "",
      scaleMin: 1,
      scaleMax: 10,
      scaleStep: 1,
      scaleLeftLabel: "",
      scaleRightLabel: "",
      matrixRows: [],
      matrixColumns: [],
      newMatrixRow: "",
      newMatrixColumn: "",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.code?.trim()) {
      toast.error("Question code is required")
      return
    }
    if (!formData.text?.trim()) {
      toast.error("Question text is required")
      return
    }
    if (!formData.type) {
      toast.error("Question type is required")
      return
    }

    // Validate type-specific requirements
    if ((formData.type === "SINGLE_SELECT" || formData.type === "MULTI_SELECT") && formData.optionList.length === 0) {
      toast.error("Please add at least one option")
      return
    }
    if (formData.type === "SCALE" && formData.scaleMin >= formData.scaleMax) {
      toast.error("Maximum value must be greater than minimum value")
      return
    }
    if (formData.type === "MATRIX" && (formData.matrixRows.length === 0 || formData.matrixColumns.length === 0)) {
      toast.error("Please add at least one row and one column")
      return
    }

    try {
      const url = editingQuestion
        ? `/api/gwi/surveys/${surveyId}/questions/${editingQuestion.id}`
        : `/api/gwi/surveys/${surveyId}/questions`
      const method = editingQuestion ? "PATCH" : "POST"

      // Build options object based on question type
      let parsedOptions: unknown = null
      if (formData.type === "SINGLE_SELECT" || formData.type === "MULTI_SELECT") {
        parsedOptions = formData.optionList.filter(opt => opt.trim() !== "")
      } else if (formData.type === "SCALE") {
        parsedOptions = {
          min: formData.scaleMin,
          max: formData.scaleMax,
          step: formData.scaleStep,
          leftLabel: formData.scaleLeftLabel || undefined,
          rightLabel: formData.scaleRightLabel || undefined,
        }
      } else if (formData.type === "MATRIX") {
        parsedOptions = {
          rows: formData.matrixRows.filter(r => r.trim() !== ""),
          columns: formData.matrixColumns.filter(c => c.trim() !== ""),
        }
      }

      const body = {
        code: formData.code.trim(),
        text: formData.text.trim(),
        type: formData.type,
        required: formData.required,
        options: parsedOptions,
        order: editingQuestion ? editingQuestion.order : questions.length,
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save question")
      }

      setIsDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Failed to save question:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save question")
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
        {isDialogOpen ? (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-6xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg overflow-y-auto max-h-[95vh]">
              <QuestionBuilder
                surveyId={surveyId}
                question={editingQuestion || null}
                onSave={async (data) => {
                  try {
                    const url = editingQuestion
                      ? `/api/gwi/surveys/${surveyId}/questions/${editingQuestion.id}`
                      : `/api/gwi/surveys/${surveyId}/questions`
                    const method = editingQuestion ? "PATCH" : "POST"

                    const body = {
                      ...data,
                      order: editingQuestion ? editingQuestion.order : questions.length,
                    }

                    const response = await fetch(url, {
                      method,
                      credentials: 'include',
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    })

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({}))
                      throw new Error(errorData.error || "Failed to save question")
                    }

                    setIsDialogOpen(false)
                    setEditingQuestion(null)
                    window.location.reload()
                  } catch (error) {
                    console.error("Failed to save question:", error)
                    toast.error(error instanceof Error ? error.message : "Failed to save question")
                    throw error
                  }
                }}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setEditingQuestion(null)
                }}
              />
            </div>
          </div>
        ) : (
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addQuestion")}
          </Button>
        )}
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
