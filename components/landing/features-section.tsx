import {
  Workflow,
  Brain,
  Shield,
  FileText,
  BarChart3,
  Layers,
  LayoutGrid,
  Users,
  Zap,
  Lock,
  Clock,
  RefreshCw,
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Real LLM Execution",
    description: "Multi-provider support with Anthropic Claude, OpenAI GPT, and GWI Spark. No mock data—production-ready AI.",
    isNew: true,
  },
  {
    icon: FileText,
    title: "Multi-Format Reports",
    description: "Export to PDF, PowerPoint, Excel, CSV, and HTML. AI-powered content generation with templates.",
    isNew: true,
  },
  {
    icon: Clock,
    title: "Scheduled Workflows",
    description: "Automate workflows with cron scheduling. Set recurring runs and automated brand tracking snapshots.",
    isNew: true,
  },
  {
    icon: Lock,
    title: "SSO & SAML 2.0",
    description: "Enterprise-ready authentication with Azure AD, Google Workspace, and custom SAML providers.",
    isNew: true,
  },
  {
    icon: Layers,
    title: "Integrations Hub",
    description: "Connect Slack, Zapier, webhooks, and custom APIs. Build integrations with 5000+ tools.",
    isNew: true,
  },
  {
    icon: RefreshCw,
    title: "Enterprise Reliability",
    description: "Circuit breakers, retry logic, request timeouts, and automatic failover ensure 99.9% uptime.",
    isNew: true,
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Comprehensive usage dashboards with token tracking, cost estimation, and performance metrics.",
    isNew: true,
  },
  {
    icon: Brain,
    title: "Context-Aware Agents",
    description: "Agents access memory context automatically. Persistent knowledge across sessions and workflows.",
    isNew: true,
  },
  {
    icon: LayoutGrid,
    title: "Multi-Mode Playground",
    description: "Switch between Chat, Canvas, and Split views. Build insights visually with drag-and-drop blocks.",
  },
  {
    icon: Workflow,
    title: "Visual Workflow Builder",
    description: "Orchestrate complex analysis with drag-and-drop pipelines, triggers, and scheduled runs.",
  },
  {
    icon: Shield,
    title: "Verified Insights",
    description: "Every insight includes clickable citations, confidence scores, and transparent reasoning chains.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Email invitations, role-based access control, and comprehensive audit logs for security.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            A complete platform for
            <br />
            <span className="text-muted-foreground">human intelligence at scale</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From autonomous task planning to verified insights, GWI Insights provides everything you need to understand
            people deeply.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 hover:border-accent/50 hover:bg-card/80 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                {feature.isNew && (
                  <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">NEW</span>
                )}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
