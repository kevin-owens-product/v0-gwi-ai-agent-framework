import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WorkflowList } from "@/components/workflows/workflow-list"
import { WorkflowFilters } from "@/components/workflows/workflow-filters"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { WorkflowsPageTracker, WorkflowsPageContent } from "./page-client"

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <WorkflowsPageTracker />
      <WorkflowsPageContent />
      <WorkflowList />
    </div>
  )
}
