import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { LLMConfigurationEditor } from "@/components/gwi/llm/llm-configuration-editor"
import { getTranslations } from "@/lib/i18n/server"

export default async function NewLLMConfigurationPage() {
  const t = await getTranslations('gwi.llm.configurations')

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
            {t('addTitle')}
          </h1>
          <p className="text-muted-foreground">
            {t('addDescription')}
          </p>
        </div>
      </div>

      {/* Editor */}
      <LLMConfigurationEditor />
    </div>
  )
}
