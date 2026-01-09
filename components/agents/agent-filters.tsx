"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"

export function AgentFilters() {
  return (
    <div className="flex items-center gap-2">
      <Select defaultValue="popular">
        <SelectTrigger className="w-[130px] bg-secondary">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="recent">Recently Added</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="usage">Most Used</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon">
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}
