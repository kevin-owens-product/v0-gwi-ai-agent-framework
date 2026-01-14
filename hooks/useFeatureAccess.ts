import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface FeatureAccessData {
  hasAccess: boolean
  value?: string | number | boolean | object | null
  limit?: number | null
  usage?: number
  percentage?: number
  isNearLimit?: boolean
  isAtLimit?: boolean
}

/**
 * Hook to check feature access for the current organization
 */
export function useFeatureAccess(featureKey: string) {
  const { data, error, isLoading, mutate } = useSWR<FeatureAccessData>(
    featureKey ? `/api/v1/organization/features/${featureKey}` : null,
    fetcher
  )

  return {
    hasAccess: data?.hasAccess ?? false,
    value: data?.value,
    limit: data?.limit,
    usage: data?.usage,
    percentage: data?.percentage ?? 0,
    isNearLimit: data?.isNearLimit ?? false,
    isAtLimit: data?.isAtLimit ?? false,
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Hook to get all features for the current organization
 */
export function useOrganizationFeatures() {
  const { data, error, isLoading, mutate } = useSWR<any[]>(
    '/api/v1/organization/features',
    fetcher
  )

  return {
    features: data ?? [],
    isLoading,
    error,
    refresh: mutate,
  }
}
