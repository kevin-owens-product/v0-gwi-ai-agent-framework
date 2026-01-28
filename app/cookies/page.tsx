"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTranslations } from "next-intl"

export default function CookiesPage() {
  const t = useTranslations("legal.cookies")

  const cookieTypes = [
    {
      name: t("types.essential.name"),
      description: t("types.essential.description"),
      examples: [t("types.essential.example1"), t("types.essential.example2"), t("types.essential.example3")],
      duration: t("types.essential.duration"),
      required: true,
    },
    {
      name: t("types.functional.name"),
      description: t("types.functional.description"),
      examples: [t("types.functional.example1"), t("types.functional.example2"), t("types.functional.example3")],
      duration: t("types.functional.duration"),
      required: false,
    },
    {
      name: t("types.analytics.name"),
      description: t("types.analytics.description"),
      examples: [t("types.analytics.example1"), t("types.analytics.example2"), t("types.analytics.example3")],
      duration: t("types.analytics.duration"),
      required: false,
    },
    {
      name: t("types.marketing.name"),
      description: t("types.marketing.description"),
      examples: [t("types.marketing.example1"), t("types.marketing.example2"), t("types.marketing.example3")],
      duration: t("types.marketing.duration"),
      required: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-muted-foreground mb-8">{t("lastUpdated")}</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("whatAreCookies.title")}</h2>
              <p className="text-muted-foreground">{t("whatAreCookies.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("typesTitle")}</h2>
              <div className="space-y-4">
                {cookieTypes.map((type) => (
                  <Card key={type.name}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {type.name}
                        {type.required && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{t("required")}</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">{type.description}</p>
                      <div className="text-sm">
                        <p className="mb-1">
                          <strong>{t("examples")}:</strong> {type.examples.join(", ")}
                        </p>
                        <p>
                          <strong>{t("duration")}:</strong> {type.duration}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("thirdParty.title")}</h2>
              <p className="text-muted-foreground mb-4">{t("thirdParty.intro")}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("thirdParty.table.provider")}</TableHead>
                    <TableHead>{t("thirdParty.table.purpose")}</TableHead>
                    <TableHead>{t("thirdParty.table.privacyPolicy")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{t("thirdParty.providers.google.name")}</TableCell>
                    <TableCell>{t("thirdParty.providers.google.purpose")}</TableCell>
                    <TableCell className="text-primary">{t("thirdParty.providers.google.link")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t("thirdParty.providers.stripe.name")}</TableCell>
                    <TableCell>{t("thirdParty.providers.stripe.purpose")}</TableCell>
                    <TableCell className="text-primary">{t("thirdParty.providers.stripe.link")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t("thirdParty.providers.intercom.name")}</TableCell>
                    <TableCell>{t("thirdParty.providers.intercom.purpose")}</TableCell>
                    <TableCell className="text-primary">{t("thirdParty.providers.intercom.link")}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("managing.title")}</h2>
              <p className="text-muted-foreground mb-4">{t("managing.intro")}</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>{t("managing.browser.label")}</strong> {t("managing.browser.text")}
                </li>
                <li>
                  <strong>{t("managing.preferences.label")}</strong> {t("managing.preferences.text")}
                </li>
                <li>
                  <strong>{t("managing.optOut.label")}</strong> {t("managing.optOut.text")}
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">{t("managing.note")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("updates.title")}</h2>
              <p className="text-muted-foreground">{t("updates.content")}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("contact.title")}</h2>
              <p className="text-muted-foreground">{t("contact.intro")}</p>
              <p className="text-muted-foreground mt-2">
                {t("contact.email")}
                <br />
                {t("contact.address")}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
