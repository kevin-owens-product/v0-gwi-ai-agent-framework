import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Briefcase, Globe, Heart, Lightbulb, MapPin, Rocket, Users, Zap } from "lucide-react"
import Link from "next/link"

const benefits = [
  {
    icon: Globe,
    title: "Remote-First",
    description: "Work from anywhere in the world. We believe great work happens everywhere.",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health insurance, mental health support, and wellness stipend.",
  },
  {
    icon: Rocket,
    title: "Growth Budget",
    description: "$2,000 annual learning budget for courses, conferences, and books.",
  },
  {
    icon: Users,
    title: "Team Retreats",
    description: "Annual company retreats to connect and collaborate in person.",
  },
  {
    icon: Zap,
    title: "Latest Tools",
    description: "Top-tier equipment and software to do your best work.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Time",
    description: "20% time to work on projects that excite you.",
  },
]

const openings = [
  {
    id: "1",
    title: "Senior AI/ML Engineer",
    department: "Engineering",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "5+ years",
  },
  {
    id: "2",
    title: "Product Manager - AI Agents",
    department: "Product",
    location: "London (Farringdon) / Remote",
    type: "Full-time",
    experience: "4+ years",
  },
  {
    id: "3",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote (US/EU)",
    type: "Full-time",
    experience: "4+ years",
  },
  {
    id: "4",
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "New York (Chelsea) / Remote",
    type: "Full-time",
    experience: "3+ years",
  },
  {
    id: "5",
    title: "Data Scientist",
    department: "Data",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "3+ years",
  },
  {
    id: "6",
    title: "Technical Writer",
    department: "Product",
    location: "Remote (Global)",
    type: "Full-time",
    experience: "2+ years",
  },
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4">We're Hiring</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Join us in transforming consumer insights</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              We're building the future of AI-powered research. Join a team of passionate builders, researchers, and
              problem-solvers.
            </p>
            <Button size="lg" asChild>
              <a href="#openings">
                View Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>

        {/* Culture */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why work at GWI?</h2>
              <p className="text-muted-foreground">
                We're a diverse team united by our passion for making data accessible and actionable. Here's what makes
                GWI special.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit) => (
                <Card key={benefit.title}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="openings" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {openings.map((job) => (
                <Card key={job.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{job.type}</Badge>
                        <Badge variant="secondary">{job.experience}</Badge>
                        <Button asChild>
                          <Link href={`/careers/${job.id}`}>Apply</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Don't see the right role?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              We're always looking for talented people. Send us your resume and we'll keep you in mind for future
              opportunities.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
