"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Book,
  ChevronRight,
  ExternalLink,
  FileText,
  Headphones,
  MessageCircle,
  Play,
  Search,
  Video,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { PageTracker } from "@/components/tracking/PageTracker"

const quickLinks = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of GWI Agents",
    icon: Play,
    href: "/docs/quickstart",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step tutorials",
    icon: Video,
    href: "/docs/tutorials",
  },
  {
    title: "API Documentation",
    description: "Integrate with our APIs",
    icon: FileText,
    href: "/docs/api",
  },
  {
    title: "Contact Support",
    description: "Get help from our team",
    icon: Headphones,
    href: "/contact",
  },
]

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I create my first agent?",
        answer:
          "Navigate to the Agents page from the sidebar and click 'Create Agent'. Follow the step-by-step wizard to configure your agent's name, description, data sources, and behavior settings.",
      },
      {
        question: "What data sources are available?",
        answer:
          "GWI provides access to multiple data sources including GWI Core (our flagship consumer survey), GWI USA, GWI Zeitgeist (trending topics), and the ability to upload custom data. Data source availability depends on your subscription tier.",
      },
      {
        question: "How do I invite team members?",
        answer:
          "Go to Settings > Team and click 'Invite Member'. Enter their email address and select their role (Admin, Editor, or Viewer). They'll receive an invitation email to join your workspace.",
      },
    ],
  },
  {
    category: "Agents & Workflows",
    questions: [
      {
        question: "What's the difference between agents and workflows?",
        answer:
          "Agents are AI-powered specialists that handle specific types of research tasks. Workflows combine multiple agents in a sequence to automate complex, multi-step research processes.",
      },
      {
        question: "Can I customize pre-built agents?",
        answer:
          "Yes! You can duplicate any pre-built agent and modify its configuration, including the system prompt, data sources, and output format. Your customized version will be saved to your personal agent library.",
      },
      {
        question: "How do I schedule a workflow?",
        answer:
          "Open your workflow and click the 'Schedule' button. You can set up recurring runs (daily, weekly, monthly) or trigger workflows based on events like new data availability.",
      },
    ],
  },
  {
    category: "Data & Privacy",
    questions: [
      {
        question: "How is my data protected?",
        answer:
          "All data is encrypted at rest and in transit using industry-standard AES-256 encryption. We're SOC 2 Type II certified and GDPR compliant. Your queries and custom data are never shared with other customers.",
      },
      {
        question: "Can I export my data?",
        answer:
          "Yes, you can export data in multiple formats including CSV, Excel, PowerPoint, and JSON. Enterprise customers also have access to direct database connections and API exports.",
      },
      {
        question: "How often is the GWI data updated?",
        answer:
          "GWI Core data is updated quarterly with fresh consumer surveys. GWI Zeitgeist provides weekly updates on trending topics. Some specialized datasets may have different update frequencies.",
      },
    ],
  },
  {
    category: "Billing & Plans",
    questions: [
      {
        question: "What counts as a query?",
        answer:
          "A query is any request made to an agent, including follow-up questions within the same conversation. Complex multi-step workflows count as a single query regardless of how many agents are involved.",
      },
      {
        question: "Can I upgrade or downgrade my plan?",
        answer:
          "Yes, you can change your plan at any time from Settings > Billing. Upgrades take effect immediately with prorated billing. Downgrades take effect at the start of your next billing cycle.",
      },
      {
        question: "Do you offer annual billing discounts?",
        answer:
          "Yes! Annual billing saves you 20% compared to monthly billing. Contact our sales team to set up annual billing or switch from monthly.",
      },
    ],
  },
]

const guides = [
  {
    title: "Building Effective Personas",
    description: "Learn how to create detailed, actionable audience personas",
    duration: "15 min read",
    level: "Beginner",
    href: "/docs/guides/personas",
  },
  {
    title: "Workflow Automation Best Practices",
    description: "Design efficient multi-agent workflows for your research",
    duration: "20 min read",
    level: "Intermediate",
    href: "/docs/guides/workflows",
  },
  {
    title: "Advanced Prompt Engineering",
    description: "Get better results with optimized agent prompts",
    duration: "25 min read",
    level: "Advanced",
    href: "/docs/guides/prompts",
  },
  {
    title: "API Integration Guide",
    description: "Connect GWI agents to your existing tools",
    duration: "30 min read",
    level: "Advanced",
    href: "/docs/guides/api-integration",
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-8">
      <PageTracker pageName="Help Center" metadata={{ searchQuery: !!searchQuery }} />
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">How can we help?</h1>
        <p className="text-muted-foreground mb-6">Search our knowledge base or browse topics below</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.title} href={link.href}>
            <Card className="h-full hover:border-primary transition-colors">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{link.title}</h3>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {faqs.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <Link key={guide.title} href={guide.href}>
                <Card className="h-full hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <Book className="h-5 w-5 text-primary" />
                      <Badge variant="outline">{guide.level}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{guide.duration}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/docs">
                View All Documentation
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Chat with our support team in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Available Monday-Friday, 9 AM - 6 PM EST. Average response time: 2 minutes.
                </p>
                <Button className="w-full">Start Chat</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Submit a Ticket</CardTitle>
                <CardDescription>Get help via email within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For complex issues or feature requests. Include as much detail as possible.
                </p>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/contact">Submit Ticket</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-3xl mx-auto mt-6">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Enterprise Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Need dedicated support? Enterprise plans include a dedicated Customer Success Manager and priority
                    response times.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
