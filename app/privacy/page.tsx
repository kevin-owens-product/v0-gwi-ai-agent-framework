"use client"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { useTranslations } from "next-intl"

export default function PrivacyPage() {
  const t = useTranslations("legal.privacy")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-muted-foreground mb-8">{t("lastUpdated")}</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("introduction.title")}</h2>
              <p className="text-muted-foreground mb-4">{t("introduction.p1")}</p>
              <p className="text-muted-foreground">{t("introduction.p2")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("informationCollected.title")}</h2>
              <h3 className="text-xl font-medium mb-3">{t("informationCollected.youProvide.title")}</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>{t("informationCollected.youProvide.item1")}</li>
                <li>{t("informationCollected.youProvide.item2")}</li>
                <li>{t("informationCollected.youProvide.item3")}</li>
                <li>{t("informationCollected.youProvide.item4")}</li>
                <li>{t("informationCollected.youProvide.item5")}</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">{t("informationCollected.automatic.title")}</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>{t("informationCollected.automatic.item1")}</li>
                <li>{t("informationCollected.automatic.item2")}</li>
                <li>{t("informationCollected.automatic.item3")}</li>
                <li>{t("informationCollected.automatic.item4")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("howWeUse.title")}</h2>
              <p className="text-muted-foreground mb-4">{t("howWeUse.intro")}</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>{t("howWeUse.item1")}</li>
                <li>{t("howWeUse.item2")}</li>
                <li>{t("howWeUse.item3")}</li>
                <li>{t("howWeUse.item4")}</li>
                <li>{t("howWeUse.item5")}</li>
                <li>{t("howWeUse.item6")}</li>
                <li>{t("howWeUse.item7")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("sharing.title")}</h2>
              <p className="text-muted-foreground mb-4">{t("sharing.intro")}</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>{t("sharing.serviceProviders.label")}</strong> {t("sharing.serviceProviders.text")}
                </li>
                <li>
                  <strong>{t("sharing.legal.label")}</strong> {t("sharing.legal.text")}
                </li>
                <li>
                  <strong>{t("sharing.businessTransfers.label")}</strong> {t("sharing.businessTransfers.text")}
                </li>
                <li>
                  <strong>{t("sharing.consent.label")}</strong> {t("sharing.consent.text")}
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("dataSecurity.title")}</h2>
              <p className="text-muted-foreground">{t("dataSecurity.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("dataRetention.title")}</h2>
              <p className="text-muted-foreground">{t("dataRetention.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("yourRights.title")}</h2>
              <p className="text-muted-foreground mb-4">{t("yourRights.intro")}</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>{t("yourRights.item1")}</li>
                <li>{t("yourRights.item2")}</li>
                <li>{t("yourRights.item3")}</li>
                <li>{t("yourRights.item4")}</li>
                <li>{t("yourRights.item5")}</li>
                <li>{t("yourRights.item6")}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("internationalTransfers.title")}</h2>
              <p className="text-muted-foreground">{t("internationalTransfers.content")}</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{t("childrensPrivacy.title")}</h2>
              <p className="text-muted-foreground">{t("childrensPrivacy.content")}</p>
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
