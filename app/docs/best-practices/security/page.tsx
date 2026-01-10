import Link from "next/link"
import { ArrowLeft, Shield, Lock, Eye, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/docs">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Docs
          </Button>
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Security Best Practices</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Comprehensive security guidelines for protecting your data and API integrations.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Security Overview</h2>
            <p className="text-muted-foreground mb-4">
              The GWI AI Platform implements enterprise-grade security measures. Follow these
              best practices to maintain the highest level of protection for your organization.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-green-500" />
                    Data Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    All data is encrypted at rest (AES-256) and in transit (TLS 1.3).
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Role-based access control (RBAC) with granular permissions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">API Key Security</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Key Management
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Never expose API keys in client-side code or public repositories</li>
                    <li>Use environment variables to store keys securely</li>
                    <li>Rotate API keys every 90 days or immediately if compromised</li>
                    <li>Use separate keys for development, staging, and production</li>
                    <li>Implement key scoping to limit permissions per key</li>
                  </ul>
                </CardContent>
              </Card>
              <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-foreground">{`# Store API keys in environment variables
export GWI_API_KEY="sk_live_..."

# Never commit keys to version control
# Add to .gitignore:
.env
.env.local
*.key`}</pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Authentication & Authorization</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Single Sign-On (SSO)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-2">
                    Enable SSO with your identity provider for centralized access management.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li>SAML 2.0 support</li>
                    <li>OAuth 2.0 / OpenID Connect</li>
                    <li>Okta, Azure AD, Google Workspace</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-2">
                    Require MFA for all user accounts to prevent unauthorized access.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li>TOTP authenticator apps</li>
                    <li>Hardware security keys (WebAuthn)</li>
                    <li>SMS backup codes</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Protection</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Data Residency:</strong> Choose your data region (US, EU, APAC) to meet compliance requirements</li>
              <li><strong>Data Retention:</strong> Configure automatic data deletion policies</li>
              <li><strong>Audit Logging:</strong> All access and changes are logged for compliance</li>
              <li><strong>Data Masking:</strong> Sensitive fields can be automatically masked in outputs</li>
              <li><strong>Export Controls:</strong> Restrict data export capabilities by role</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Network Security</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`# IP Allowlisting Configuration
{
  "networkSecurity": {
    "ipAllowlist": {
      "enabled": true,
      "addresses": [
        "203.0.113.0/24",
        "198.51.100.0/24"
      ]
    },
    "webhookSigning": {
      "enabled": true,
      "algorithm": "HMAC-SHA256"
    },
    "rateLimiting": {
      "requestsPerMinute": 1000,
      "burstLimit": 100
    }
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Compliance</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">SOC 2 Type II</h3>
                  <p className="text-muted-foreground text-sm">
                    Annual audit of security, availability, and confidentiality controls.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">GDPR</h3>
                  <p className="text-muted-foreground text-sm">
                    Full compliance with EU data protection regulations.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">ISO 27001</h3>
                  <p className="text-muted-foreground text-sm">
                    Certified information security management system.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/api/auth">
                <Button variant="outline">API Authentication</Button>
              </Link>
              <Link href="/docs/best-practices/verification">
                <Button variant="outline">Data Verification</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
