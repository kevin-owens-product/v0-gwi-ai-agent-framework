import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Database } from "lucide-react"
import { DataSourceEditor } from "@/components/gwi/data-sources/data-source-editor"

export default function NewDataSourcePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/gwi/data-sources">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Database className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Data Source</h1>
            <p className="text-muted-foreground">
              Connect a new external data source to the platform
            </p>
          </div>
        </div>
      </div>

      {/* Editor */}
      <DataSourceEditor />
    </div>
  )
}
