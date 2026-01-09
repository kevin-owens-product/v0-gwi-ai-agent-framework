import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"

export function ReportsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Reports & Outputs</h1>
        <p className="text-muted-foreground">View and manage all generated reports, presentations, and exports</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button asChild>
          <Link href="/dashboard/reports/new">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>
    </div>
  )
}
