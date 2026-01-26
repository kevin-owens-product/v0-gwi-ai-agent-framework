import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { LLMConfigurationEditor } from "@/components/gwi/llm/llm-configuration-editor"

export default function NewLLMConfigurationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gwi/llm">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add LLM Configuration
          </h1>
          <p className="text-muted-foreground">
            Configure a new language model for use in the platform
          </p>
        </div>
      </div>

      {/* Editor */}
      <LLMConfigurationEditor />
    </div>
  )
}
