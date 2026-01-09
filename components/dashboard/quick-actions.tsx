import { Button } from "@/components/ui/button"
import { Plus, Play, Upload, Sparkles } from "lucide-react"
import Link from "next/link"

const actions = [
  { name: "New Workflow", icon: Plus, href: "/dashboard/workflows/new", primary: true },
  { name: "Open Playground", icon: Sparkles, href: "/dashboard/playground", primary: false },
  { name: "Run Agent", icon: Play, href: "/dashboard/agents", primary: false },
  { name: "Import Data", icon: Upload, href: "/dashboard/import", primary: false },
]

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Link key={action.name} href={action.href}>
          <Button variant={action.primary ? "default" : "secondary"} size="sm" className="gap-2">
            <action.icon className="h-4 w-4" />
            {action.name}
          </Button>
        </Link>
      ))}
    </div>
  )
}
