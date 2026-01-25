/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  BarChart3,
  Users,
  Megaphone,
  Database,
  Server,
  FolderOpen,
  Mail,
  ClipboardList,
  Plug,
  Star,
} from 'lucide-react'
import {
  CONNECTOR_PROVIDERS,
  CONNECTOR_CATEGORIES,
  getPopularProviders,
  type ConnectorProviderConfig,
  type ConnectorTypeValue,
} from '@/lib/connectors'

interface ConnectorTypeSelectorProps {
  onSelect: (provider: ConnectorProviderConfig) => void
  selectedProvider?: string
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ANALYTICS: BarChart3,
  CRM: Users,
  ADVERTISING: Megaphone,
  DATA_WAREHOUSE: Database,
  DATABASE: Server,
  FILE_STORAGE: FolderOpen,
  MARKETING: Mail,
  SURVEY: ClipboardList,
  SOCIAL: Megaphone,
}

export function ConnectorTypeSelector({ onSelect, selectedProvider }: ConnectorTypeSelectorProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const popularProviders = useMemo(() => getPopularProviders(), [])

  const filteredProviders = useMemo(() => {
    let providers = Object.values(CONNECTOR_PROVIDERS)

    // Filter by category
    if (selectedCategory !== 'all' && selectedCategory !== 'popular') {
      providers = providers.filter((p) => p.type === selectedCategory)
    }

    if (selectedCategory === 'popular') {
      providers = popularProviders
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      providers = providers.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      )
    }

    return providers
  }, [search, selectedCategory, popularProviders])

  const getCategoryIcon = (category: string) => {
    const Icon = CATEGORY_ICONS[category] || Plug
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-secondary"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="data-[state=active]:bg-secondary"
          >
            <Star className="h-3 w-3 mr-1" />
            Popular
          </TabsTrigger>
          {CONNECTOR_CATEGORIES.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-secondary"
            >
              {getCategoryIcon(category.id)}
              <span className="ml-1">{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredProviders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No connectors found</p>
              {search && (
                <p className="text-sm mt-2">
                  Try a different search term or browse by category
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isSelected={selectedProvider === provider.id}
                  onClick={() => onSelect(provider)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ProviderCardProps {
  provider: ConnectorProviderConfig
  isSelected: boolean
  onClick: () => void
}

function ProviderCard({ provider, isSelected, onClick }: ProviderCardProps) {
  const CategoryIcon = CATEGORY_ICONS[provider.type] || Plug

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      } ${provider.comingSoon ? 'opacity-60' : ''}`}
      onClick={provider.comingSoon ? undefined : onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {provider.icon ? (
              <img
                src={provider.icon}
                alt={provider.name}
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm truncate">{provider.name}</h3>
              {provider.popular && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  Popular
                </Badge>
              )}
              {provider.comingSoon && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  Soon
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {provider.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
