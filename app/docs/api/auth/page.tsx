"use client"

import Link from "next/link"
import { ArrowLeft, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function AuthPage() {
  const t = useTranslations("docs")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/docs">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.backToDocs")}
          </Button>
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">{t("api.auth.title")}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("api.auth.subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("api.auth.apiKeys.title")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("api.auth.apiKeys.description")}
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm">
              <pre className="text-foreground">{`Authorization: Bearer YOUR_API_KEY`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("api.auth.gettingKey.title")}</h2>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-4">
              <li>{t("api.auth.gettingKey.steps.login")}</li>
              <li>{t("api.auth.gettingKey.steps.navigate")}</li>
              <li>{t("api.auth.gettingKey.steps.generate")}</li>
              <li>{t("api.auth.gettingKey.steps.name")}</li>
              <li>{t("api.auth.gettingKey.steps.copy")}</li>
            </ol>
            <Link href="/dashboard/settings/api-keys">
              <Button variant="outline">{t("api.auth.gettingKey.manageButton")}</Button>
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">{t("api.auth.examples.title")}</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("api.auth.examples.curl.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground">{`curl https://api.gwi.ai/v1/agents \\
  -H "Authorization: Bearer sk_live_abc123..."`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("api.auth.examples.javascript.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground">{`const response = await fetch('https://api.gwi.ai/v1/agents', {
  headers: {
    'Authorization': 'Bearer sk_live_abc123...',
    'Content-Type': 'application/json'
  }
});`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("api.auth.examples.python.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground">{`import requests

response = requests.get(
    'https://api.gwi.ai/v1/agents',
    headers={'Authorization': 'Bearer sk_live_abc123...'}
)`}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("api.auth.keyTypes.title")}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("api.auth.keyTypes.live.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("api.auth.keyTypes.live.description")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t("api.auth.keyTypes.test.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t("api.auth.keyTypes.test.description")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("api.auth.security.title")}</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>{t("api.auth.security.neverExpose.name")}</strong> - {t("api.auth.security.neverExpose.description")}</li>
              <li><strong>{t("api.auth.security.envVars.name")}</strong> - {t("api.auth.security.envVars.description")}</li>
              <li><strong>{t("api.auth.security.rotate.name")}</strong> - {t("api.auth.security.rotate.description")}</li>
              <li><strong>{t("api.auth.security.separateKeys.name")}</strong> - {t("api.auth.security.separateKeys.description")}</li>
              <li><strong>{t("api.auth.security.monitor.name")}</strong> - {t("api.auth.security.monitor.description")}</li>
              <li><strong>{t("api.auth.security.revoke.name")}</strong> - {t("api.auth.security.revoke.description")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("api.auth.errors.title")}</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Missing or invalid API key
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid API key provided",
    "status": 401
  }
}

// Expired API key
{
  "error": {
    "code": "key_expired",
    "message": "API key has expired",
    "status": 401
  }
}

// Rate limit exceeded
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests",
    "status": 429,
    "retryAfter": 60
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("api.auth.relatedDocs.title")}</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/api">
                <Button variant="outline">{t("api.auth.relatedDocs.apiReference")}</Button>
              </Link>
              <Link href="/dashboard/settings/api-keys">
                <Button variant="outline">{t("api.auth.relatedDocs.manageKeys")}</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
