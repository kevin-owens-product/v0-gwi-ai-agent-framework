import {
  Workflow,
  Brain,
  Shield,
  GitBranch,
  FileText,
  BarChart3,
  Layers,
  Inbox,
  Command,
  LayoutGrid,
  Sparkles,
  Users,
} from "lucide-react"

const features = [
  {
    icon: LayoutGrid,
    title: "Multi-Mode Playground",
    description: "Switch between Chat, Canvas, and Split views. Build insights visually with drag-and-drop blocks.",
    isNew: true,
  },
  {
    icon: Inbox,
    title: "Inbox Agents",
    description: "AI agents that monitor Slack and email, automatically processing incoming research requests.",
    isNew: true,
  },
  {
    icon: Command,
    title: "Command Palette",
    description: "Press ⌘K anywhere to access templates, saved prompts, and quick actions instantly.",
    isNew: true,
  },
  {
    icon: Workflow,
    title: "Visual Workflow Builder",
    description: "Orchestrate complex analysis with drag-and-drop pipelines, triggers, and scheduled runs.",
  },
  {
    icon: Brain,
    title: "Persistent Memory",
    description: "Agents remember past interactions, building deeper understanding across sessions and projects.",
  },
  {
    icon: Shield,
    title: "Verified Insights",
    description: "Every insight includes clickable citations, confidence scores, and transparent reasoning chains.",
  },
  {
    icon: FileText,
    title: "Report Builder",
    description: "Generate presentations, dashboards, and exports with AI-assisted slide editing and templates.",
    isNew: true,
  },
  {
    icon: Sparkles,
    title: "Reasoning Mode",
    description: "Watch agents think through problems step-by-step with visible reasoning chains.",
  },
  {
    icon: GitBranch,
    title: "Multi-Agent Collaboration",
    description: "Specialized agents hand off tasks seamlessly, working together on complex projects.",
  },
  {
    icon: Users,
    title: "Team Workspaces",
    description: "Collaborate on projects with shared agents, templates, and version-controlled workflows.",
  },
  {
    icon: BarChart3,
    title: "2.8B Consumer Dataset",
    description: "Direct access to GWI's global study with automatic query optimization and market filtering.",
  },
  {
    icon: Layers,
    title: "Enterprise Integrations",
    description: "Connect to Google Docs, Slack, Tableau, Figma, and ad platforms like Meta and DV360.",
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
