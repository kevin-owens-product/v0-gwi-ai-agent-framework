"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, CreditCard, Download, Zap, ArrowUpRight } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"

const invoices = [
  { id: "INV-001", date: "Dec 1, 2024", amount: "$2,499.00", status: "Paid" },
  { id: "INV-002", date: "Nov 1, 2024", amount: "$2,499.00", status: "Paid" },
  { id: "INV-003", date: "Oct 1, 2024", amount: "$2,499.00", status: "Paid" },
  { id: "INV-004", date: "Sep 1, 2024", amount: "$1,999.00", status: "Paid" },
]

export default function BillingSettingsPage() {
  const t = useTranslations("settings.billing")

  return (
    <div className="p-6 max-w-4xl">
      <PageTracker pageName="Settings - Billing" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {t("enterprisePlan")}
                  <Badge className="bg-primary">{t("current")}</Badge>
                </CardTitle>
                <CardDescription>{t("planDescription")}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">$2,499</p>
                <p className="text-sm text-muted-foreground">{t("perMonth")}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">{t("planFeatures")}</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {t("features.unlimitedQueries")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {t("features.allAgents")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {t("features.customDev")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {t("features.prioritySupport")}
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">{t("usageThisPeriod")}</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{t("usage.agentQueries")}</span>
                      <span>12,450 / {t("usage.unlimited")}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{t("usage.reportsGenerated")}</span>
                      <span>89 / 100</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{t("usage.teamSeats")}</span>
                      <span>12 / 25</span>
                    </div>
                    <Progress value={48} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-6">
            <p className="text-sm text-muted-foreground">{t("nextBillingDate", { date: "January 1, 2025" })}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline">{t("changePlan")}</Button>
              <Button variant="outline" className="text-destructive bg-transparent">
                {t("cancelSubscription")}
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>{t("paymentMethod")}</CardTitle>
            <CardDescription>{t("paymentDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 rounded-md bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">{t("cardEnding", { last4: "4242" })}</p>
                  <p className="text-sm text-muted-foreground">{t("cardExpires", { date: "12/2026" })}</p>
                </div>
              </div>
              <Button variant="outline">{t("update")}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>{t("billingHistory")}</CardTitle>
            <CardDescription>{t("billingHistoryDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("invoiceHeaders.invoice")}</TableHead>
                  <TableHead>{t("invoiceHeaders.date")}</TableHead>
                  <TableHead>{t("invoiceHeaders.amount")}</TableHead>
                  <TableHead>{t("invoiceHeaders.status")}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        {t("paid")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t("needMoreCapacity")}</h3>
                <p className="text-sm text-muted-foreground">{t("contactForPricing")}</p>
              </div>
            </div>
            <Button>
              {t("contactSales")}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
