import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, HelpCircle, Minus } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Starter",
    description: "For small teams getting started with AI insights",
    price: 299,
    period: "per month",
    features: [
      { name: "5 team members", included: true },
      { name: "3 pre-built agents", included: true },
      { name: "1,000 queries/month", included: true },
      { name: "Basic memory (30 days)", included: true },
      { name: "Email support", included: true },
      { name: "Custom agents", included: false },
      { name: "Workflow automation", included: false },
      { name: "API access", included: false },
      { name: "SSO/SAML", included: false },
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    description: "For growing teams that need more power",
    price: 799,
    period: "per month",
    features: [
      { name: "25 team members", included: true },
      { name: "All pre-built agents", included: true },
      { name: "10,000 queries/month", included: true },
      { name: "Extended memory (90 days)", included: true },
      { name: "Priority support", included: true },
      { name: "5 custom agents", included: true },
      { name: "Scheduled workflows", included: true },
      { name: "Multi-format reports (PDF, PPT, Excel)", included: true },
      { name: "50 integrations", included: true },
      { name: "Advanced analytics dashboard", included: true },
      { name: "API access", included: true },
      { name: "SSO/SAML", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    price: null,
    period: "custom pricing",
    features: [
      { name: "Unlimited team members", included: true },
      { name: "All pre-built agents", included: true },
      { name: "Unlimited queries", included: true },
      { name: "Unlimited memory", included: true },
      { name: "Dedicated support & CSM", included: true },
      { name: "Unlimited custom agents", included: true },
      { name: "Advanced scheduled workflows", included: true },
      { name: "All report formats + custom templates", included: true },
      { name: "Unlimited integrations + custom connectors", included: true },
      { name: "SSO/SAML (Azure AD, Google, custom)", included: true },
      { name: "99.99% SLA with circuit breakers", included: true },
      { name: "Full API access + webhooks", included: true },
      { name: "Dedicated infrastructure", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

const faqs = [
  {
    question: "What counts as a query?",
    answer:
      "A query is any request made to an agent, including follow-up questions within the same conversation. Complex multi-step workflows count as a single query.",
  },
  {
    question: "Can I change plans at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.",
  },
  {
    question: "What happens if I exceed my query limit?",
    answer:
      "We'll notify you when you're approaching your limit. You can purchase additional queries or upgrade your plan.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes, all plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What integrations are included?",
    answer:
      "All plans include access to our core integrations (Google Workspace, Slack, Tableau). Enterprise plans include custom integrations.",
  },
  {
    question: "How does data security work?",
    answer:
      "All data is encrypted at rest and in transit. We're SOC 2 Type II certified and GDPR compliant. Enterprise plans include additional security features.",
  },
]

const comparisonFeatures = [
  { name: "Team Members", starter: "5", professional: "25", enterprise: "Unlimited" },
  { name: "Pre-built Agents", starter: "3", professional: "All", enterprise: "All" },
  { name: "Custom Agents", starter: "-", professional: "5", enterprise: "Unlimited" },
  { name: "Monthly Queries", starter: "1,000", professional: "10,000", enterprise: "Unlimited" },
  { name: "Real LLM Execution", starter: "✓", professional: "✓", enterprise: "✓" },
  { name: "Memory Retention", starter: "30 days", professional: "90 days", enterprise: "Unlimited" },
  { name: "Scheduled Workflows", starter: "-", professional: "✓", enterprise: "✓" },
  { name: "Report Formats", starter: "CSV, HTML", professional: "All Formats", enterprise: "All Formats" },
  { name: "Workflow Automation", starter: "-", professional: "Basic", enterprise: "Advanced" },
  { name: "API Access", starter: "-", professional: "Yes", enterprise: "Full" },
  { name: "Integrations Hub", starter: "5", professional: "50", enterprise: "Unlimited" },
  { name: "Email Notifications", starter: "✓", professional: "✓", enterprise: "✓" },
  { name: "Circuit Breakers", starter: "✓", professional: "✓", enterprise: "✓" },
  { name: "Advanced Analytics", starter: "-", professional: "✓", enterprise: "✓" },
  { name: "Support", starter: "Email", professional: "Priority", enterprise: "Dedicated" },
  { name: "SSO/SAML", starter: "-", professional: "-", enterprise: "✓" },
  { name: "Audit Logs", starter: "-", professional: "90 days", enterprise: "Unlimited" },
  { name: "SLA", starter: "99.9%", professional: "99.9%", enterprise: "99.99%" },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your team. All plans include a 14-day free trial.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative ${plan.popular ? "border-primary shadow-lg shadow-primary/10" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      {plan.price ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground">{plan.period}</span>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold">Custom</div>
                      )}
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-3">
                          {feature.included ? (
                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                          ) : (
                            <Minus className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "" : "text-muted-foreground/50"}>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                      <Link href={plan.price ? "/signup" : "/contact"}>{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-medium">Feature</th>
                    <th className="text-center py-4 px-4 font-medium">Starter</th>
                    <th className="text-center py-4 px-4 font-medium">Professional</th>
                    <th className="text-center py-4 px-4 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature) => (
                    <tr key={feature.name} className="border-b">
                      <td className="py-4 px-4 text-muted-foreground">{feature.name}</td>
                      <td className="text-center py-4 px-4">{feature.starter}</td>
                      <td className="text-center py-4 px-4">{feature.professional}</td>
                      <td className="text-center py-4 px-4">{feature.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto grid gap-6">
              {faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 hover:bg-primary-foreground/10 bg-transparent"
                asChild
              >
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
