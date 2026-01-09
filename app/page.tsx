import { LandingHeader } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { LogoCloud } from "@/components/landing/logo-cloud"
import { FeaturesSection } from "@/components/landing/features-section"
import { PlaygroundShowcase } from "@/components/landing/playground-showcase"
import { AgentsShowcase } from "@/components/landing/agents-showcase"
import { InboxAgentsSection } from "@/components/landing/inbox-agents-section"
import { ReportsSection } from "@/components/landing/reports-section"
import { WorkflowDemo } from "@/components/landing/workflow-demo"
import { StatsSection } from "@/components/landing/stats-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <LogoCloud />
        <FeaturesSection />
        <PlaygroundShowcase />
        <AgentsShowcase />
        <InboxAgentsSection />
        <ReportsSection />
        <WorkflowDemo />
        <StatsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
