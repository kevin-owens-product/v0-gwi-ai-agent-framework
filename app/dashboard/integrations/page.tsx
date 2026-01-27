import { getTranslations } from "@/lib/i18n/server"
import { IntegrationsHeader } from "@/components/integrations/integrations-header"
import { IntegrationsGrid } from "@/components/integrations/integrations-grid"
import { ConnectedIntegrations } from "@/components/integrations/connected-integrations"
import { IntegrationsPageTracker } from "./page-client"

export default async function IntegrationsPage() {
  // Pre-fetch translations for server component - child components will use their own hooks
  await getTranslations('dashboard.integrations')

  return (
    <div className="flex-1 space-y-8 p-6">
      <IntegrationsPageTracker />
      <IntegrationsHeader />
      <ConnectedIntegrations />
      <IntegrationsGrid />
    </div>
  )
}
