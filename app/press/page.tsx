import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function PressPage() {
  const pressReleases = [
    {
      title: "GWI Insights Raises $50M Series B to Scale AI-Powered Consumer Intelligence",
      date: "January 2, 2025",
      excerpt: "Funding will accelerate product development and global expansion.",
    },
    {
      title: "GWI Insights Launches Inbox Agents for Automated Insights Delivery",
      date: "December 10, 2024",
      excerpt: "New feature enables teams to scale insights operations 10x faster.",
    },
    {
      title: "GWI Insights Named Leader in Forrester Wave for AI Research Platforms",
      date: "November 15, 2024",
      excerpt: "Recognition for innovation in AI-powered consumer insights.",
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
