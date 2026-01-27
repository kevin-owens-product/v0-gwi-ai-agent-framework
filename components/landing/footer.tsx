"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

export function Footer() {
  const t = useTranslations("landing.footer")
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { labelKey: "features", href: "/#features" },
      { labelKey: "agents", href: "/#agents" },
      { labelKey: "pricing", href: "/pricing" },
      { labelKey: "changelog", href: "/changelog" },
      { labelKey: "roadmap", href: "/roadmap" },
    ],
    resources: [
      { labelKey: "documentation", href: "/docs" },
      { labelKey: "apiReference", href: "/docs/api" },
      { labelKey: "tutorials", href: "/tutorials" },
      { labelKey: "blog", href: "/blog" },
      { labelKey: "caseStudies", href: "/case-studies" },
    ],
    company: [
      { labelKey: "about", href: "/about" },
      { labelKey: "careers", href: "/careers" },
      { labelKey: "press", href: "/press" },
      { labelKey: "contact", href: "/contact" },
      { labelKey: "partners", href: "/partners" },
    ],
    legal: [
      { labelKey: "privacy", href: "/privacy" },
      { labelKey: "terms", href: "/terms" },
      { labelKey: "security", href: "/security" },
      { labelKey: "cookies", href: "/cookies" },
      { labelKey: "compliance", href: "/compliance" },
    ],
  }

  return (
    <footer className="border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <span className="text-sm font-bold text-accent-foreground">G</span>
              </div>
              <span className="text-lg font-semibold text-foreground">{t("brandName")}</span>
            </Link>
            <p className="text-sm text-muted-foreground">{t("brandDesc")}</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("product")}</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("resources")}</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("company")}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("legal")}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">{t("copyright", { year: currentYear })}</p>
          <div className="flex items-center gap-6">
            <Link
              href="https://twitter.com/GWI_Data"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("twitter")}
            </Link>
            <Link
              href="https://linkedin.com/company/gwidotcom"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("linkedin")}
            </Link>
            <Link
              href="https://www.gwi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("gwicom")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
