import Link from "next/link"
import { ArrowLeft, Users, TrendingUp, Target, Package, Lightbulb, Search, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SolutionsPage() {
  const solutions = [
    {
      title: "Sales Teams",
      description: "Close more deals with AI-powered audience intelligence and automated proposal generation",
      icon: TrendingUp,
      href: "/solutions/sales",
      metrics: ["60% faster proposals", "2.5x more opportunities", "45% higher win rates"],
    },
    {
      title: "Insights Teams",
      description: "Deliver faster, deeper consumer insights with AI agents that analyze behavior at scale",
      icon: Users,
      href: "/solutions/insights",
      metrics: ["75% faster delivery", "5x more studies", "90% lower costs"],
    },
    {
      title: "Ad Sales & Revenue",
      description: "Accelerate ad sales with audience packages, media planning, and pitch generation",
      icon: Target,
      href: "/solutions/ad-sales",
      metrics: ["70% faster RFPs", "3x more packages", "40% higher win rates"],
    },
    {
      title: "Marketing & Brand",
      description: "Create campaigns that resonate with real people using human insights and trend analysis",
      icon: TrendingUp,
      href: "/solutions/marketing",
      metrics: ["60% faster campaigns", "2.5x engagement", "50% better perception"],
    },
    {
      title: "Product Development",
      description: "Build products people want by understanding real needs and validating concepts with data",
      icon: Package,
      href: "/solutions/product",
      metrics: ["80% faster research", "3x more concepts", "45% higher PMF"],
    },
    {
      title: "Market Research",
      description: "Transform data into strategic intelligence with automated research and reporting",
      icon: Search,
      href: "/solutions/market-research",
      metrics: ["75% faster projects", "5x more studies", "90% cost reduction"],
    },
    {
      title: "Innovation & Strategy",
      description: "Turn insights into breakthrough innovations grounded in real human needs",
      icon: Lightbulb,
      href: "/solutions/innovation",
      metrics: ["10x more concepts", "65% faster validation", "2x success rate"],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Solutions for Every Team</h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl text-pretty">
              Purpose-built AI agents and workflows designed for the unique needs of your team. Discover how GWI
              Insights transforms work across your organization.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions.map((solution, i) => (
                <Card key={i} className="p-6 border-border/40 hover:border-primary/50 transition-all group">
                  <Link href={solution.href} className="block">
                    <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                      <solution.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{solution.description}</p>
                    <div className="space-y-1 mb-4">
                      {solution.metrics.map((metric, j) => (
                        <div key={j} className="text-xs text-muted-foreground">
                          • {metric}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      Learn more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Team?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              See how GWI Insights can accelerate your specific use case.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
