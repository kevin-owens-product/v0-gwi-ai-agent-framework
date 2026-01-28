"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, MessageSquare, Building2, Users, Headphones } from "lucide-react"

export default function ContactPage() {
  const t = useTranslations("landing.contact")

  const contactOptions = [
    {
      icon: Building2,
      titleKey: "options.sales.title",
      descriptionKey: "options.sales.description",
      actionKey: "options.sales.action",
      href: "mailto:sales@gwi.com",
    },
    {
      icon: Headphones,
      titleKey: "options.support.title",
      descriptionKey: "options.support.description",
      actionKey: "options.support.action",
      href: "mailto:support@gwi.com",
    },
    {
      icon: Users,
      titleKey: "options.partnerships.title",
      descriptionKey: "options.partnerships.description",
      actionKey: "options.partnerships.action",
      href: "mailto:partners@gwi.com",
    },
  ]

  const offices = [
    {
      cityKey: "offices.london.city",
      address: "25 Farringdon Street, London EC4A 4AB",
      phone: "+44 20 7731 1614",
    },
    {
      cityKey: "offices.newYork.city",
      address: "45 W 25th St, 8th Floor, New York, NY 10010",
      phone: "+1 646 600 6867",
    },
    {
      cityKey: "offices.athens.city",
      address: "Athens, Greece",
      phone: "+30 210 300 0000",
    },
  ]

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    topic: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">{t("hero.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {contactOptions.map((option) => (
                <Card key={option.titleKey} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <option.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{t(option.titleKey)}</CardTitle>
                    <CardDescription>{t(option.descriptionKey)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <a href={option.href}>{t(option.actionKey)}</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>{t("form.title")}</CardTitle>
                  <CardDescription>{t("form.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{t("form.successTitle")}</h3>
                      <p className="text-muted-foreground">{t("form.successMessage")}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t("form.fields.name")}</Label>
                          <Input
                            id="name"
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("form.fields.workEmail")}</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">{t("form.fields.company")}</Label>
                          <Input
                            id="company"
                            value={formState.company}
                            onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">{t("form.fields.role")}</Label>
                          <Input
                            id="role"
                            value={formState.role}
                            onChange={(e) => setFormState({ ...formState, role: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="topic">{t("form.fields.topic")}</Label>
                        <Select
                          value={formState.topic}
                          onValueChange={(value) => setFormState({ ...formState, topic: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("form.fields.selectTopic")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="demo">{t("form.topics.demo")}</SelectItem>
                            <SelectItem value="pricing">{t("form.topics.pricing")}</SelectItem>
                            <SelectItem value="support">{t("form.topics.support")}</SelectItem>
                            <SelectItem value="partnership">{t("form.topics.partnership")}</SelectItem>
                            <SelectItem value="other">{t("form.topics.other")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">{t("form.fields.message")}</Label>
                        <Textarea
                          id="message"
                          rows={4}
                          value={formState.message}
                          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? t("form.sending") : t("form.sendMessage")}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Offices */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12">{t("officesTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {offices.map((office) => (
                <div key={office.cityKey} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t(office.cityKey)}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{office.address}</p>
                  <p className="text-sm text-muted-foreground">{office.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
