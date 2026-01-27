import { WorkflowList } from "@/components/workflows/workflow-list"
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
