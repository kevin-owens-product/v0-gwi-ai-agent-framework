import { MemoryOverview } from "@/components/memory/memory-overview"
import { MemoryBrowser } from "@/components/memory/memory-browser"
import { MemoryStats } from "@/components/memory/memory-stats"
import { Button } from "@/components/ui/button"
import { Settings, Trash2 } from "lucide-react"
import { MemoryPageTracker } from "./page-client"

export default function MemoryPage() {
  return (
    <div className="space-y-6">
      <MemoryPageTracker />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Memory & Context</h1>
          <p className="text-muted-foreground">
            Manage persistent agent memory, project context, and conversation history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive bg-transparent">
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <MemoryStats />
      <MemoryOverview />
      <MemoryBrowser />
    </div>
  )
}
