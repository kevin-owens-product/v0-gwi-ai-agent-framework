"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

const industryKeys = [
  "technology",
  "healthcare",
  "finance",
  "retail",
  "manufacturing",
  "education",
  "mediaEntertainment",
  "professionalServices",
  "nonProfit",
  "government",
  "other",
]

export default function NewClientPage() {
  const t = useTranslations("gwi.services.clients")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    status: "LEAD",
    taxId: "",
    paymentTerms: "30",
    currency: "USD",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/gwi/services/clients", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentTerms: parseInt(formData.paymentTerms),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create client")
      }

      const client = await res.json()
      toast.success(t("clientCreated"))
      router.push(`/gwi/services/clients/${client.id}`)
    } catch (error) {
      console.error("Failed to create client:", error)
      toast.error(error instanceof Error ? error.message : t("failedToCreate"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/gwi/services/clients"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToClients")}
        </Link>
        <h1 className="text-2xl font-bold">{t("addNewClient")}</h1>
        <p className="text-muted-foreground">
          {t("addNewClientDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("form.basicInformation")}</CardTitle>
              <CardDescription>
                {t("form.basicInformationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("form.companyName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("form.companyNamePlaceholder")}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">{t("form.industry")}</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) =>
                      setFormData({ ...formData, industry: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.selectIndustry")} />
                    </SelectTrigger>
                    <SelectContent>
                      {industryKeys.map((key) => (
                        <SelectItem key={key} value={t(`industries.${key}`)}>
                          {t(`industries.${key}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{tCommon("status")}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD">{t("statuses.lead")}</SelectItem>
                      <SelectItem value="PROSPECT">{t("statuses.prospect")}</SelectItem>
                      <SelectItem value="ACTIVE">{tCommon("active")}</SelectItem>
                      <SelectItem value="ON_HOLD">{t("statuses.onHold")}</SelectItem>
                      <SelectItem value="INACTIVE">{tCommon("inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t("form.website")}</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://www.example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("form.billingInformation")}</CardTitle>
              <CardDescription>
                {t("form.billingInformationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">{t("form.paymentTerms")}</Label>
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentTerms: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t("form.dueOnReceipt")}</SelectItem>
                      <SelectItem value="15">{t("form.net15")}</SelectItem>
                      <SelectItem value="30">{t("form.net30")}</SelectItem>
                      <SelectItem value="45">{t("form.net45")}</SelectItem>
                      <SelectItem value="60">{t("form.net60")}</SelectItem>
                      <SelectItem value="90">{t("form.net90")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">{t("form.currency")}</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (E)</SelectItem>
                      <SelectItem value="GBP">GBP (P)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="AUD">AUD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">{t("form.taxId")}</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                    placeholder={t("form.taxIdPlaceholder")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("form.additionalNotes")}</CardTitle>
              <CardDescription>
                {t("form.additionalNotesDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={t("form.notesPlaceholder")}
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/gwi/services/clients">{tCommon("cancel")}</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tCommon("creating")}
                </>
              ) : (
                t("createClient")
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
