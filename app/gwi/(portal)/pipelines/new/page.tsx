import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PipelineEditor } from "@/components/gwi/pipelines/pipeline-editor"
import { getTranslations } from "@/lib/i18n/server"

export default async function NewPipelinePage() {
  const t = await getTranslations('gwi.pipelines')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gwi/pipelines">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('createTitle')}</h1>
          <p className="text-muted-foreground">
            {t('createDescription')}
          </p>
        </div>
      </div>

      {/* Editor */}
      <PipelineEditor />
    </div>
  )
}
