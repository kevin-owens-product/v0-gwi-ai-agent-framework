"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowLeft, Shield, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function CompliancePage() {
  const t = useTranslations("landing.compliance")

  const certifications = [
    { nameKey: "certifications.soc2", statusKey: "status.certified" },
    { nameKey: "certifications.iso27001", statusKey: "status.certified" },
    { nameKey: "certifications.gdpr", statusKey: "status.compliant" },
    { nameKey: "certifications.ccpa", statusKey: "status.compliant" },
    { nameKey: "certifications.hipaa", statusKey: "status.available" },
  ]

  const features = [
    "features.dataEncryption",
    "features.rbac",
    "features.mfa",
    "features.auditLogs",
    "features.dataResidency",
    "features.securityAudits",
    "features.incidentResponse",
    "features.dpa",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Button>
          </Link>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-accent" />
              <h1 className="text-4xl font-bold text-foreground">{t("title")}</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t("certificationsTitle")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{t(cert.nameKey)}</h3>
                  </div>
                  <Badge variant="secondary">{t(cert.statusKey)}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t("securityFeaturesTitle")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((featureKey, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                  <span className="text-foreground">{t(featureKey)}</span>
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
