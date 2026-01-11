import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Zap, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const stats = [
  { label: "Enterprise Clients", value: "2,000+" },
  { label: "Markets", value: "50+" },
  { label: "Consumers Represented", value: "3B" },
  { label: "Team Members", value: "750+" },
]

const values = [
  {
    icon: Target,
    title: "Accuracy First",
    description: "Every insight is verified against real data with full citation and source transparency.",
  },
  {
    icon: Users,
    title: "Customer Obsessed",
    description: "We build what our customers need, not what's trendy. Your success is our success.",
  },
  {
    icon: Zap,
    title: "Speed Matters",
    description: "In the fast-paced world of consumer insights, we deliver answers in seconds, not days.",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Enterprise-grade security and compliance. Your data is always protected.",
  },
]

const team = [
  { name: "Sarah Chen", role: "CEO & Co-founder", image: "/professional-woman-ceo.png" },
  { name: "Marcus Williams", role: "CTO & Co-founder", image: "/professional-cto-headshot.png" },
  { name: "Elena Rodriguez", role: "VP of Product", image: "/professional-woman-vp-headshot.png" },
  { name: "David Park", role: "VP of Engineering", image: "/professional-man-engineer-headshot.jpg" },
  { name: "Aisha Patel", role: "Head of AI Research", image: "/professional-woman-researcher.png" },
  { name: "James Morrison", role: "VP of Sales", image: "/professional-man-sales-headshot.jpg" },
]

const milestones = [
  { year: "2009", title: "Founded", description: "Tom Smith founded GWI (GlobalWebIndex) in London" },
  { year: "2014", title: "Global Expansion", description: "Expanded research to 40+ markets worldwide" },
  { year: "2019", title: "Series A", description: "Raised funding led by Stripes Group" },
  { year: "2022", title: "Series B", description: "Raised $179.9M led by Permira, total funding $220M" },
  { year: "2024", title: "AI & Agent Framework", description: "Launched GWI Spark AI assistant and Agent Framework" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Transforming how the world understands consumers</h1>
              <p className="text-xl text-muted-foreground mb-8">
                We're on a mission to make consumer insights accessible, accurate, and actionable for every team.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    GWI was founded in 2009 by Tom Smith with a vision to understand the digital consumer. From our
                    headquarters in London, we've grown to become the world's leading audience research company.
                  </p>
                  <p>
                    Today, we represent 3 billion consumers across 50+ markets worldwide. Our quarterly research
                    surveys provide over 200,000+ profiling points, giving brands unprecedented insight into their
                    audiences' behaviors, attitudes, and interests.
                  </p>
                  <p>
                    With GWI Spark and our Agent Framework, we're pioneering the future where AI is trained on
                    human truth—real-world, human-sourced data powering smarter business decisions.
                  </p>
                </div>
              </div>
              <div className="relative h-80 lg:h-96 rounded-lg overflow-hidden">
                <Image src="/modern-office-collaboration.png" alt="GWI Team" fill className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((value) => (
                <Card key={value.title}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-8">
                  {milestones.map((milestone, _index) => (
                    <div key={milestone.year} className="relative flex gap-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center flex-shrink-0 z-10">
                        <span className="font-bold text-primary">{milestone.year}</span>
                      </div>
                      <div className="pt-3">
                        <h3 className="text-xl font-semibold">{milestone.title}</h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Leadership Team</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Meet the people driving GWI's mission to transform consumer insights.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team.map((member) => (
                <Card key={member.name} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                  </div>
                  <CardContent className="pt-4 text-center">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              We're always looking for talented people to help us transform consumer insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/careers">View Open Positions</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
