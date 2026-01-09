import Link from "next/link"
import { ArrowLeft, Shield, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function CompliancePage() {
  const certifications = [
    { name: "SOC 2 Type II", status: "Certified" },
    { name: "ISO 27001", status: "Certified" },
    { name: "GDPR", status: "Compliant" },
    { name: "CCPA", status: "Compliant" },
    { name: "HIPAA", status: "Available" },
  ]

  const features = [
    "Data encryption at rest and in transit",
    "Role-based access control (RBAC)",
    "Multi-factor authentication (MFA)",
    "Audit logs and activity tracking",
    "Data residency options",
    "Regular security audits",
    "Incident response procedures",
    "Data processing agreements (DPA)",
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
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-bold text-foreground">Compliance</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              We take security and compliance seriously to protect your data.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Certifications</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{cert.name}</h3>
                  </div>
                  <Badge variant="secondary">{cert.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Security Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
