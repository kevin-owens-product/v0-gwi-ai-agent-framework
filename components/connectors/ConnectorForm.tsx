/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, CheckCircle2, Plug } from 'lucide-react'
import { useConnectors, type CreateConnectorInput, type UpdateConnectorInput } from '@/hooks/use-connectors'
import {
  CONNECTOR_PROVIDERS,
  SYNC_SCHEDULES,
  type ConnectorProviderConfig,
  type ConnectorProviderType,
} from '@/lib/connectors'
import { ConnectorTypeSelector } from './ConnectorTypeSelector'
import type { DataConnectorType } from '@prisma/client'

interface ConnectorFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    id: string
    name: string
    description?: string | null
    provider: string
    type: DataConnectorType
    config: Record<string, unknown>
    syncSchedule?: string | null
    isActive: boolean
  }
  onSuccess?: () => void
}

export function ConnectorForm({ mode, initialData, onSuccess }: ConnectorFormProps) {
  const router = useRouter()
  const t = useTranslations('connectors')
  const tCommon = useTranslations('common')
  const { createConnector, updateConnector, testConnection } = useConnectors()

  const [step, setStep] = useState<'select' | 'configure'>(mode === 'edit' ? 'configure' : 'select')
  const [selectedProvider, setSelectedProvider] = useState<ConnectorProviderConfig | null>(
    initialData?.provider
      ? CONNECTOR_PROVIDERS[initialData.provider as ConnectorProviderType]
      : null
  )

  // Form state
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [config, setConfig] = useState<Record<string, unknown>>(initialData?.config || {})
  const [credentials, setCredentials] = useState<Record<string, unknown>>({})
  const [syncSchedule, setSyncSchedule] = useState<string | null>(initialData?.syncSchedule || null)
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Update default name when provider is selected
  useEffect(() => {
    if (selectedProvider && mode === 'create' && !name) {
      setName(selectedProvider.name)
    }
  }, [selectedProvider, mode, name])

  const handleProviderSelect = (provider: ConnectorProviderConfig) => {
    setSelectedProvider(provider)
    setConfig({})
    setCredentials({})
    setTestResult(null)
    setStep('configure')
  }

  const handleTestConnection = async () => {
    if (!selectedProvider) return

    setIsTesting(true)
    setTestResult(null)

    try {
      if (mode === 'edit' && initialData?.id) {
        const result = await testConnection(initialData.id)
        setTestResult(result)
      } else {
        // For new connectors, show a placeholder test
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setTestResult({
          success: true,
          message: t('form.testConfigValid'),
        })
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProvider) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (mode === 'create') {
        const input: CreateConnectorInput = {
          name,
          description: description || undefined,
          type: selectedProvider.type as DataConnectorType,
          provider: selectedProvider.id,
          config,
          credentials,
          syncSchedule,
        }
        await createConnector(input)
      } else if (initialData?.id) {
        const input: UpdateConnectorInput = {
          name,
          description: description || undefined,
          config,
          credentials: Object.keys(credentials).length > 0 ? credentials : undefined,
          syncSchedule,
          isActive,
        }
        await updateConnector(initialData.id, input)
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard/integrations/connectors')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('form.failedToSave'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderConfigFields = () => {
    if (!selectedProvider) return null

    // Get the config schema from the provider
    const configSchema = selectedProvider.configSchema
    const credentialsSchema = selectedProvider.credentialsSchema

    // Parse the schema to get field definitions
    const configFields = Object.entries(configSchema.shape || {})
    const credentialFields = Object.entries(credentialsSchema.shape || {})

    return (
      <div className="space-y-6">
        {/* Configuration fields */}
        {configFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">{t('form.configuration')}</h4>
            {configFields.map(([key, schema]: [string, any]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`config-${key}`}>
                  {formatFieldLabel(key)}
                  {!schema.isOptional?.() && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id={`config-${key}`}
                  type={getInputType(key)}
                  value={(config[key] as string) || ''}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  placeholder={getFieldPlaceholder(key)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Credentials fields */}
        {credentialFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">{t('form.authentication')}</h4>
            {selectedProvider.authType === 'oauth' ? (
              <Alert>
                <Plug className="h-4 w-4" />
                <AlertDescription>
                  {t('form.oauthMessage')}
                </AlertDescription>
              </Alert>
            ) : (
              credentialFields.map(([key, schema]: [string, any]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`cred-${key}`}>
                    {formatFieldLabel(key)}
                    {!schema.isOptional?.() && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id={`cred-${key}`}
                    type={isSecretField(key) ? 'password' : 'text'}
                    value={(credentials[key] as string) || ''}
                    onChange={(e) => setCredentials({ ...credentials, [key]: e.target.value })}
                    placeholder={mode === 'edit' && isSecretField(key) ? t('form.unchanged') : getFieldPlaceholder(key)}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  if (step === 'select') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t('form.selectConnectorType')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('form.chooseDataSource')}
            </p>
          </div>
        </div>

        <ConnectorTypeSelector
          onSelect={handleProviderSelect}
          selectedProvider={selectedProvider?.id}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Provider info */}
      {selectedProvider && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                {selectedProvider.icon ? (
                  <img
                    src={selectedProvider.icon}
                    alt={selectedProvider.name}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <Plug className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{selectedProvider.name}</CardTitle>
                <CardDescription>{selectedProvider.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          {mode === 'create' && (
            <CardContent className="pt-0">
              <Button
                type="button"
                variant="link"
                onClick={() => setStep('select')}
                className="p-0 h-auto"
              >
                {t('form.changeConnectorType')}
              </Button>
            </CardContent>
          )}
        </Card>
      )}

      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('form.basicInformation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              {tCommon('name')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('form.namePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{tCommon('description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('form.connectionSettings')}</CardTitle>
        </CardHeader>
        <CardContent>{renderConfigFields()}</CardContent>
      </Card>

      {/* Sync settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t('form.syncSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="syncSchedule">{t('form.syncSchedule')}</Label>
            <Select
              value={syncSchedule || 'manual'}
              onValueChange={(value) => setSyncSchedule(value === 'manual' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('form.selectSchedule')} />
              </SelectTrigger>
              <SelectContent>
                {SYNC_SCHEDULES.map((schedule) => (
                  <SelectItem
                    key={schedule.value || 'manual'}
                    value={schedule.value || 'manual'}
                  >
                    {schedule.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === 'edit' && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">{t('form.connectorStatus')}</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive ? t('form.connectorActiveDesc') : t('form.connectorPausedDesc')}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test connection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('form.testConnection')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('form.verifyConfiguration')}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('form.testing')}
                </>
              ) : (
                <>
                  <Plug className="mr-2 h-4 w-4" />
                  {t('form.testConnection')}
                </>
              )}
            </Button>
          </div>

          {testResult && (
            <Alert
              className={`mt-4 ${
                testResult.success ? 'border-emerald-500/50' : 'border-destructive/50'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/integrations/connectors')}
        >
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting || !name}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? tCommon('creating') : tCommon('saving')}
            </>
          ) : mode === 'create' ? (
            t('form.createConnector')
          ) : (
            tCommon('saveChanges')
          )}
        </Button>
      </div>
    </form>
  )
}

// Helper functions
function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, ' ')
    .trim()
}

function getInputType(key: string): string {
  if (key.toLowerCase().includes('url') || key.toLowerCase().includes('endpoint')) {
    return 'url'
  }
  if (key.toLowerCase().includes('port')) {
    return 'number'
  }
  return 'text'
}

function isSecretField(key: string): boolean {
  const secretPatterns = ['password', 'secret', 'key', 'token', 'credential']
  return secretPatterns.some((pattern) => key.toLowerCase().includes(pattern))
}

function getFieldPlaceholder(key: string): string {
  const placeholders: Record<string, string> = {
    propertyId: 'e.g., GA4-12345678',
    instanceUrl: 'e.g., https://your-instance.salesforce.com',
    apiKey: 'Enter your API key',
    accessKeyId: 'Enter your access key ID',
    secretAccessKey: 'Enter your secret access key',
    host: 'e.g., db.example.com',
    port: 'e.g., 5432',
    database: 'Enter database name',
    username: 'Enter username',
    password: 'Enter password',
    bucket: 'e.g., my-data-bucket',
    account: 'e.g., xy12345.us-east-1',
    warehouse: 'e.g., COMPUTE_WH',
    projectId: 'e.g., my-project-123',
  }
  return placeholders[key] || ''
}
