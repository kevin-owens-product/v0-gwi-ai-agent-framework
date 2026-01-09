import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Starter",
    price: "$499",
    period: "/month",
    description: "For teams getting started with AI-powered human insights",
    features: [
      "5 team members",
      "3 pre-built agents",
      "1,000 workflow runs/month",
      "Basic memory (7 days)",
      "Chat & Canvas modes",
      "Email support",
      "Standard integrations",
    ],
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Professional",
    price: "$1,499",
    period: "/month",
    description: "For growing teams with complex research needs",
    features: [
      "25 team members",
      "All pre-built agents",
      "10,000 workflow runs/month",
      "Extended memory (90 days)",
      "Inbox Agents (Slack & Email)",
      "Report Builder with templates",
      "Command palette & templates",
      "Priority support",
      "Custom agent builder",
      "API access",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations requiring maximum scale and control",
    features: [
      "Unlimited team members",
      "Custom agent development",
      "Unlimited workflow runs",
      "Persistent memory",
      "Unlimited Inbox Agents",
      "White-label reports",
      "Dedicated success manager",
      "SSO & SAML",
      "On-premise deployment",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    featured: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the plan that fits your team. All plans include a 14-day free trial with full access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-8 ${
                tier.featured ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-card"
              }`}
            >
              {tier.featured && (
                <div className="text-xs font-medium text-accent uppercase tracking-wider mb-4">Most Popular</div>
              )}
              <h3 className="text-xl font-semibold text-foreground mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                <span className="text-muted-foreground">{tier.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
              <Button
                className={`w-full mb-8 ${tier.featured ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                variant={tier.featured ? "default" : "secondary"}
              >
                {tier.cta}
              </Button>
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-chart-5 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
