import Link from "next/link"
import { ArrowLeft, Users, Share2, MessageSquare, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CollaborationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/docs">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Docs
          </Button>
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Team Collaboration</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Best practices for effective team collaboration on AI agents and insights.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Collaboration Features</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-blue-500" />
                    Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Share agents, dashboards, and reports with team members or external stakeholders.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Add comments and annotations to insights for team discussion.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-yellow-500" />
                    Workspaces
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Organize projects into workspaces with dedicated access controls.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Team Roles & Permissions</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-semibold text-foreground">Role</th>
                          <th className="text-left py-2 font-semibold text-foreground">View</th>
                          <th className="text-left py-2 font-semibold text-foreground">Create</th>
                          <th className="text-left py-2 font-semibold text-foreground">Edit</th>
                          <th className="text-left py-2 font-semibold text-foreground">Delete</th>
                          <th className="text-left py-2 font-semibold text-foreground">Admin</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b">
                          <td className="py-2 font-medium">Owner</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">✓</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-medium">Admin</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">-</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-medium">Member</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">Own</td>
                          <td className="py-2">Own</td>
                          <td className="py-2">-</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium">Viewer</td>
                          <td className="py-2">✓</td>
                          <td className="py-2">-</td>
                          <td className="py-2">-</td>
                          <td className="py-2">-</td>
                          <td className="py-2">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Collaboration Workflows</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">1. Agent Development</h3>
                  <p className="text-muted-foreground mb-2">
                    Collaborate on agent development with version control and review workflows.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li>Draft mode for work-in-progress agents</li>
                    <li>Review and approval process before publishing</li>
                    <li>Version history with rollback capability</li>
                    <li>Change notifications to team members</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">2. Insight Review</h3>
                  <p className="text-muted-foreground mb-2">
                    Structured review process for validating and sharing insights.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li>Assign reviewers to validate findings</li>
                    <li>Add context with inline comments</li>
                    <li>Track review status and approvals</li>
                    <li>Export approved insights for distribution</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">3. Dashboard Sharing</h3>
                  <p className="text-muted-foreground mb-2">
                    Share live dashboards with internal teams or external clients.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li>Generate shareable links with expiration</li>
                    <li>Control access levels (view, interact, edit)</li>
                    <li>Embed dashboards in external applications</li>
                    <li>Track engagement and views</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Team Best Practices</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Establish naming conventions:</strong> Use consistent names for agents, dashboards, and reports</li>
              <li><strong>Document your work:</strong> Add descriptions and context to all shared assets</li>
              <li><strong>Use workspaces:</strong> Organize by project, client, or team to reduce clutter</li>
              <li><strong>Set up notifications:</strong> Stay informed of changes to shared assets</li>
              <li><strong>Regular reviews:</strong> Schedule periodic reviews of active agents and dashboards</li>
              <li><strong>Archive unused items:</strong> Keep workspaces clean by archiving inactive assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/best-practices/security">
                <Button variant="outline">Security Best Practices</Button>
              </Link>
              <Link href="/docs/workflows-intro">
                <Button variant="outline">Workflow Introduction</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
