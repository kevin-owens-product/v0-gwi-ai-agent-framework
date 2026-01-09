import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const cookieTypes = [
  {
    name: "Essential Cookies",
    description: "Required for the website to function properly",
    examples: ["Session ID", "Authentication token", "Security cookies"],
    duration: "Session - 1 year",
    required: true,
  },
  {
    name: "Functional Cookies",
    description: "Remember your preferences and settings",
    examples: ["Language preference", "Theme settings", "Timezone"],
    duration: "1 year",
    required: false,
  },
  {
    name: "Analytics Cookies",
    description: "Help us understand how you use our service",
    examples: ["Page views", "Feature usage", "Performance metrics"],
    duration: "2 years",
    required: false,
  },
  {
    name: "Marketing Cookies",
    description: "Used to deliver relevant advertisements",
    examples: ["Ad targeting", "Campaign tracking", "Conversion tracking"],
    duration: "90 days - 2 years",
    required: false,
  },
]

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 15, 2024</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are placed on your device when you visit a website. They are widely
                used to make websites work more efficiently and provide information to the site owners. We use cookies
                and similar technologies to enhance your experience on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
              <div className="space-y-4">
                {cookieTypes.map((type) => (
                  <Card key={type.name}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {type.name}
                        {type.required && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Required</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">{type.description}</p>
                      <div className="text-sm">
                        <p className="mb-1">
                          <strong>Examples:</strong> {type.examples.join(", ")}
                        </p>
                        <p>
                          <strong>Duration:</strong> {type.duration}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground mb-4">
                We use services from the following third parties that may set cookies on your device:
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Privacy Policy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Google Analytics</TableCell>
                    <TableCell>Usage analytics</TableCell>
                    <TableCell className="text-primary">policies.google.com</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Stripe</TableCell>
                    <TableCell>Payment processing</TableCell>
                    <TableCell className="text-primary">stripe.com/privacy</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Intercom</TableCell>
                    <TableCell>Customer support</TableCell>
                    <TableCell className="text-primary">intercom.com/legal</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
              <p className="text-muted-foreground mb-4">You can control and manage cookies in several ways:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies. Check your
                  browser's help documentation for instructions.
                </li>
                <li>
                  <strong>Cookie Preferences:</strong> Use our cookie preference center (accessible via the cookie
                  banner) to manage non-essential cookies.
                </li>
                <li>
                  <strong>Opt-Out Links:</strong> Many advertising networks offer opt-out mechanisms through sites like
                  aboutads.info.
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Note that blocking some cookies may impact your experience on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other
                operational, legal, or regulatory reasons. Please check this page periodically for updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <p className="text-muted-foreground mt-2">
                Email: privacy@gwi.com
                <br />
                Address: 123 Tech Hub, Shoreditch, London EC2A 4BX
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
