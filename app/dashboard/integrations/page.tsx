import { IntegrationsHeader } from "@/components/integrations/integrations-header"
import { IntegrationsGrid } from "@/components/integrations/integrations-grid"
import { ConnectedIntegrations } from "@/components/integrations/connected-integrations"

export default function IntegrationsPage() {
  return (
    <div className="flex-1 space-y-8 p-6">
      <IntegrationsHeader />
      <ConnectedIntegrations />
      <IntegrationsGrid />
    </div>
  )
}
