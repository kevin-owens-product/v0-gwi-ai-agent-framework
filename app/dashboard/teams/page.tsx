import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Mail, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TeamsPageTracker } from "./page-client"

export default function TeamsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <TeamsPageTracker />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">Manage team members and permissions</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <UserPlus className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">18</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Mail className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Invites</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Team Members</h2>
          <Suspense fallback={<TeamMembersSkeleton />}>
            <TeamMembersList />
          </Suspense>
        </div>
      </Card>
    </div>
  )
}

function TeamMembersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  )
}

function TeamMembersList() {
  const members = [
    { name: "John Doe", email: "john@company.com", role: "Admin", status: "active" },
    { name: "Jane Smith", email: "jane@company.com", role: "Editor", status: "active" },
    { name: "Mike Johnson", email: "mike@company.com", role: "Viewer", status: "active" },
    { name: "Sarah Williams", email: "sarah@company.com", role: "Editor", status: "invited" },
  ]

  const roleColors = {
    Admin: "bg-accent text-accent-foreground",
    Editor: "bg-emerald-500/10 text-emerald-500",
    Viewer: "bg-blue-500/10 text-blue-500",
  }

  return (
    <div className="space-y-3">
      {members.map((member, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={roleColors[member.role as keyof typeof roleColors]}>{member.role}</Badge>
            {member.status === "invited" && (
              <Badge variant="outline" className="border-amber-500 text-amber-500">
                Pending
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
