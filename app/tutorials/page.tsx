import Link from "next/link"
import { ArrowLeft, BookOpen, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function TutorialsPage() {
  const tutorials = [
    {
      title: "Getting Started with GWI Insights",
      description: "Learn the basics of the platform and create your first insight.",
      duration: "15 min",
      level: "Beginner",
      category: "Fundamentals",
    },
    {
      title: "Building Custom Agents",
      description: "Create powerful agents tailored to your specific needs.",
      duration: "30 min",
      level: "Intermediate",
      category: "Agents",
    },
    {
      title: "Automating Workflows",
      description: "Set up automated workflows to save time and scale insights.",
      duration: "25 min",
      level: "Intermediate",
      category: "Workflows",
    },
    {
      title: "Advanced Report Builder",
      description: "Master the report builder and create stunning presentations.",
      duration: "40 min",
      level: "Advanced",
      category: "Reports",
    },
    {
      title: "Using Inbox Agents",
      description: "Configure inbox agents to automatically handle incoming requests.",
      duration: "20 min",
      level: "Intermediate",
      category: "Automation",
    },
    {
      title: "API Integration Guide",
      description: "Integrate GWI Insights with your existing tools and workflows.",
      duration: "35 min",
      level: "Advanced",
      category: "API",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-bold text-foreground">Tutorials</h1>
            </div>
            <p className="text-lg text-muted-foreground">Step-by-step guides to help you master GWI Insights.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {tutorials.map((tutorial, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-card p-6 hover:border-accent transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge variant="secondary">{tutorial.category}</Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {tutorial.duration}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{tutorial.title}</h3>
                <p className="text-muted-foreground mb-4">{tutorial.description}</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{tutorial.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
