"use client"

import { useState } from "react"
import { AgentGrid } from "@/components/agents/agent-grid"
import { AgentFilters } from "@/components/agents/agent-filters"
import { AgentMarketplace } from "@/components/agents/agent-marketplace"
import { AgentPerformanceDashboard } from "@/components/agents/agent-performance-dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"
import Link from "next/link"

export default function AgentsPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All Agents</TabsTrigger>
            <TabsTrigger value="custom">My Agents</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {(activeTab === "all" || activeTab === "custom") && (
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  className="pl-10 bg-secondary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <AgentFilters />
            </div>
          )}
        </div>

        <TabsContent value="all" className="mt-0">
          <AgentGrid filter="all" search={search} />
        </TabsContent>
        <TabsContent value="custom" className="mt-0">
          <AgentGrid filter="custom" search={search} />
        </TabsContent>
        <TabsContent value="marketplace" className="mt-0">
          <AgentMarketplace />
        </TabsContent>
        <TabsContent value="performance" className="mt-0">
          <AgentPerformanceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
