import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function PressPage() {
  const pressReleases = [
    {
      title: "GWI Launches Agent Framework for AI-Powered Consumer Research",
      date: "January 15, 2025",
      excerpt: "New framework enables autonomous AI agents to deliver strategic consumer insights at scale.",
    },
    {
      title: "GWI Spark Integrates with ChatGPT for Real-Time Consumer Insights",
      date: "December 10, 2024",
      excerpt: "Integration brings GWI's consumer data directly into ChatGPT conversations.",
    },
    {
      title: "GWI Completes $179.9M Series B Funding Led by Permira",
      date: "March 22, 2022",
      excerpt: "Investment brings total funding to $220M, accelerating global expansion and AI capabilities.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Press</h1>
            <p className="text-lg text-muted-foreground">Latest news and press releases from GWI Insights.</p>
          </div>

          <div className="mb-12 p-6 rounded-lg border border-border bg-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">Media Kit</h2>
            <p className="text-muted-foreground mb-4">
              Download our media kit for logos, brand guidelines, and company information.
            </p>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Media Kit
            </Button>
          </div>

          <div className="space-y-8">
            {pressReleases.map((release, idx) => (
              <article key={idx} className="pb-8 border-b border-border last:border-0">
                <div className="text-sm text-muted-foreground mb-2">{release.date}</div>
                <h2 className="text-2xl font-semibold text-foreground mb-3 hover:text-accent transition-colors cursor-pointer">
                  {release.title}
                </h2>
                <p className="text-muted-foreground">{release.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
