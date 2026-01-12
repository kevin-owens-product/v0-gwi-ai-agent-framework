import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WorkflowList } from "@/components/workflows/workflow-list"
import { WorkflowFilters } from "@/components/workflows/workflow-filters"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { WorkflowsPageTracker } from "./page-client"

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <WorkflowsPageTracker />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground">Create and manage your automated research pipelines.</p>
        </div>
        <Link href="/dashboard/workflows/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search workflows..." className="pl-10 bg-secondary" />
        </div>
        <WorkflowFilters />
      </div>

      <WorkflowList />
    </div>
  )
}
