import { AgentGrid } from "@/components/agents/agent-grid"
import { AgentFilters } from "@/components/agents/agent-filters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"
import Link from "next/link"

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Library</h1>
          <p className="text-muted-foreground">Browse, configure, and deploy AI agents for your research workflows.</p>
        </div>
        <Link href="/dashboard/agents/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All Agents</TabsTrigger>
            <TabsTrigger value="official">Official</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search agents..." className="pl-10 bg-secondary" />
            </div>
            <AgentFilters />
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          <AgentGrid filter="all" />
        </TabsContent>
        <TabsContent value="official" className="mt-0">
          <AgentGrid filter="official" />
        </TabsContent>
        <TabsContent value="custom" className="mt-0">
          <AgentGrid filter="custom" />
        </TabsContent>
        <TabsContent value="community" className="mt-0">
          <AgentGrid filter="community" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
