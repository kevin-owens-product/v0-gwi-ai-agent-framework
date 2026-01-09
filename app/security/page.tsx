import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Shield, Lock, Key, Eye, Server, FileCheck, Users } from "lucide-react"
import Link from "next/link"

const certifications = [
  { name: "SOC 2 Type II", description: "Audited annually" },
  { name: "GDPR Compliant", description: "EU data protection" },
  { name: "ISO 27001", description: "Information security" },
  { name: "CCPA Compliant", description: "California privacy" },
]

const securityFeatures = [
  {
    icon: Lock,
    title: "Encryption at Rest & Transit",
    description: "All data is encrypted using AES-256 encryption at rest and TLS 1.3 in transit.",
  },
  {
    icon: Key,
    title: "Access Controls",
    description: "Role-based access control (RBAC) with granular permissions and SSO support.",
  },
  {
    icon: Eye,
    title: "Audit Logging",
    description: "Comprehensive audit logs for all user actions and API access.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Hosted on enterprise-grade cloud infrastructure with 99.99% uptime SLA.",
  },
  {
    icon: FileCheck,
    title: "Regular Penetration Testing",
    description: "Third-party security assessments and penetration testing conducted quarterly.",
  },
  {
    icon: Users,
    title: "Employee Security Training",
    description: "All employees undergo regular security awareness training.",
  },
]

const dataResidency = [
  { region: "United States", location: "AWS US-East", flag: "🇺🇸" },
  { region: "European Union", location: "AWS EU-West", flag: "🇪🇺" },
  { region: "Asia Pacific", location: "AWS Singapore", flag: "🇸🇬" },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Enterprise-Grade Security</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Your data security is our top priority. We've built GWI with security at every layer.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {certifications.map((cert) => (
                <Badge key={cert.name} variant="secondary" className="text-sm py-2 px-4">
                  <Check className="mr-2 h-4 w-4" />
                  {cert.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Security Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {securityFeatures.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Residency */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">Data Residency</h2>
              <p className="text-muted-foreground text-center mb-12">
                Choose where your data is stored to meet compliance requirements.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {dataResidency.map((region) => (
                  <Card key={region.region}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-4">{region.flag}</div>
                      <h3 className="font-semibold mb-1">{region.region}</h3>
                      <p className="text-sm text-muted-foreground">{region.location}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">Compliance & Certifications</h2>
              <p className="text-muted-foreground text-center mb-12">
                We maintain the highest standards of compliance and undergo regular third-party audits.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {certifications.map((cert) => (
                  <Card key={cert.name}>
                    <CardContent className="pt-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">{cert.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Have security questions?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Our security team is happy to discuss our practices and answer any questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">Contact Security Team</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs/security">View Security Docs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
