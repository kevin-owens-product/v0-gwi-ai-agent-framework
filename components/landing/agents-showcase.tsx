import { Users, Lightbulb, Target, TrendingUp, Heart, Globe } from "lucide-react"

const agents = [
  {
    icon: Users,
    name: "Audience Explorer",
    description: "Discovers who your audience really is—their values, behaviors, and what makes them tick.",
    color: "bg-chart-1/20 text-chart-1",
  },
  {
    icon: Lightbulb,
    name: "Persona Architect",
    description: "Builds rich, data-driven personas that bring your audiences to life with authentic human details.",
    color: "bg-chart-2/20 text-chart-2",
  },
  {
    icon: Target,
    name: "Motivation Decoder",
    description: "Uncovers the 'why' behind consumer choices—the emotional and rational drivers of behavior.",
    color: "bg-chart-3/20 text-chart-3",
  },
  {
    icon: TrendingUp,
    name: "Culture Tracker",
    description: "Spots emerging cultural shifts and changing attitudes before they hit the mainstream.",
    color: "bg-chart-4/20 text-chart-4",
  },
  {
    icon: Heart,
    name: "Brand Relationship Analyst",
    description:
      "Maps how people really feel about brands—loyalty drivers, switching triggers, and emotional connections.",
    color: "bg-chart-5/20 text-chart-5",
  },
  {
    icon: Globe,
    name: "Global Perspective Agent",
    description: "Compares attitudes and behaviors across markets to find universal truths and local nuances.",
    color: "bg-accent/20 text-accent",
  },
]

export function AgentsShowcase() {
  return (
    <section id="agents" className="py-24 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Pre-built human insights agents</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start with specialized agents designed for understanding people, or build your own in the Agent Playground.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.name}
              className="rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${agent.color} flex items-center justify-center mb-4`}>
                <agent.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{agent.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
