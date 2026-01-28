"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { useTranslations } from "next-intl"

export default function TermsPage() {
  const t = useTranslations("legal.terms")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-muted-foreground mb-8">{t("lastUpdated")}</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("acceptance.title")}</h2>
              <p className="text-muted-foreground">{t("acceptance.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("description.title")}</h2>
              <p className="text-muted-foreground">{t("description.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("registration.title")}</h2>
              <p className="text-muted-foreground mb-4">{t("registration.intro")}</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>{t("registration.item1")}</li>
                <li>{t("registration.item2")}</li>
                <li>{t("registration.item3")}</li>
                <li>{t("registration.item4")}</li>
                <li>{t("registration.item5")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("acceptableUse.title")}</h2>
              <p className="text-muted-foreground mb-4">{t("acceptableUse.intro")}</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>{t("acceptableUse.item1")}</li>
                <li>{t("acceptableUse.item2")}</li>
                <li>{t("acceptableUse.item3")}</li>
                <li>{t("acceptableUse.item4")}</li>
                <li>{t("acceptableUse.item5")}</li>
                <li>{t("acceptableUse.item6")}</li>
                <li>{t("acceptableUse.item7")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("intellectualProperty.title")}</h2>
              <p className="text-muted-foreground mb-4">
                <strong>{t("intellectualProperty.ourProperty.label")}</strong> {t("intellectualProperty.ourProperty.text")}
              </p>
              <p className="text-muted-foreground">
                <strong>{t("intellectualProperty.yourContent.label")}</strong> {t("intellectualProperty.yourContent.text")}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("dataPrivacy.title")}</h2>
              <p className="text-muted-foreground">{t("dataPrivacy.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("payment.title")}</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>{t("payment.item1")}</li>
                <li>{t("payment.item2")}</li>
                <li>{t("payment.item3")}</li>
                <li>{t("payment.item4")}</li>
                <li>{t("payment.item5")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("availability.title")}</h2>
              <p className="text-muted-foreground">{t("availability.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("liability.title")}</h2>
              <p className="text-muted-foreground">{t("liability.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("indemnification.title")}</h2>
              <p className="text-muted-foreground">{t("indemnification.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("termination.title")}</h2>
              <p className="text-muted-foreground">{t("termination.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("governingLaw.title")}</h2>
              <p className="text-muted-foreground">{t("governingLaw.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("changes.title")}</h2>
              <p className="text-muted-foreground">{t("changes.content")}</p>
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
