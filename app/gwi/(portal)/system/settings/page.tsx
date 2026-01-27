import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { LoadingText } from "@/components/ui/loading-text"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Settings, Bell, Shield, Database, Zap } from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

async function getSettings() {
  const settings = await prisma.gWIPortalSettings.findMany({
    orderBy: { category: "asc" },
  })

  return settings
}

async function SettingsContent() {
  const settings = await getSettings()
  const t = await getTranslations('gwi.settings')

  const settingsByCategory = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, typeof settings>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Save className="mr-2 h-4 w-4" />
          {t('saveChanges')}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            {t('tabs.general')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            {t('tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            {t('tabs.security')}
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Database className="h-4 w-4" />
            {t('tabs.integrations')}
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Zap className="h-4 w-4" />
            {t('tabs.performance')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('general.title')}</CardTitle>
              <CardDescription>
                {t('general.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="portal-name">{t('general.portalName')}</Label>
                <Input id="portal-name" defaultValue="GWI Team Portal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t('general.defaultTimezone')}</Label>
                <Input id="timezone" defaultValue="UTC" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('general.darkMode')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('general.darkModeDesc')}
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('general.autoRefresh')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('general.autoRefreshDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications.title')}</CardTitle>
              <CardDescription>
                {t('notifications.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('notifications.pipelineFailure')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.pipelineFailureDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('notifications.llmUsage')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.llmUsageDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('notifications.dataQuality')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('notifications.dataQualityDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-email">{t('notifications.alertEmail')}</Label>
                <Input
                  id="alert-email"
                  type="email"
                  placeholder={t('notifications.alertEmailPlaceholder')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('security.title')}</CardTitle>
              <CardDescription>
                {t('security.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('security.require2fa')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.require2faDesc')}
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('security.sessionTimeout')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.sessionTimeoutDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-duration">{t('security.sessionDuration')}</Label>
                <Input id="session-duration" type="number" defaultValue="24" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('security.auditLogging')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.auditLoggingDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>{t('integrations.title')}</CardTitle>
              <CardDescription>
                {t('integrations.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">{t('integrations.webhookUrl')}</Label>
                <Input
                  id="webhook-url"
                  placeholder={t('integrations.webhookUrlPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">
                  {t('integrations.webhookUrlDesc')}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slack-webhook">{t('integrations.slackWebhook')}</Label>
                <Input
                  id="slack-webhook"
                  placeholder={t('integrations.slackWebhookPlaceholder')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('integrations.enableExternalApis')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('integrations.enableExternalApisDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>{t('performance.title')}</CardTitle>
              <CardDescription>
                {t('performance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('performance.enableCaching')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('performance.enableCachingDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cache-ttl">{t('performance.cacheTtl')}</Label>
                <Input id="cache-ttl" type="number" defaultValue="300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-size">{t('performance.defaultBatchSize')}</Label>
                <Input id="batch-size" type="number" defaultValue="1000" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('performance.parallelProcessing')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('performance.parallelProcessingDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default async function SettingsPage() {
  const t = await getTranslations('gwi.settings')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <LoadingText />
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}
