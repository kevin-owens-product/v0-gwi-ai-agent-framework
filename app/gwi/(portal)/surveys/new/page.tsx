import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SurveyEditor } from "@/components/gwi/surveys/survey-editor"

export default function NewSurveyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gwi/surveys">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Survey</h1>
          <p className="text-muted-foreground">
            Set up a new survey questionnaire
          </p>
        </div>
      </div>

      {/* Editor */}
      <SurveyEditor />
    </div>
  )
}
