import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bot } from "lucide-react"
import { AgentTemplateEditor } from "@/components/gwi/agents/agent-template-editor"
import { getTranslations } from "@/lib/i18n/server"

export default async function NewAgentTemplatePage() {
  const t = await getTranslations('gwi.agents.templates')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gwi/agents">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('createTitle')}</h1>
            <p className="text-muted-foreground">
              {t('createDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Editor */}
      <AgentTemplateEditor />
    </div>
  )
}
