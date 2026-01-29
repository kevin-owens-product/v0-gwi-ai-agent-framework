/**
 * Shared time formatting utilities for consistent time display across all GWI tools.
 * Uses translation keys from common.relativeTime namespace.
 */

/**
 * Formats a date string as a relative time ago (e.g., "2 hours ago", "Just now")
 * Uses translation keys for internationalization support.
 *
 * @param dateString - ISO date string, Date object, or null/undefined
 * @param t - Translation function from next-intl (e.g., useTranslations('common.relativeTime'))
 * @returns Formatted relative time string
 */
export function formatTimeAgo(
  dateString: string | Date | null | undefined,
  t: (key: string, values?: Record<string, number>) => string
): string {
  if (!dateString) {
    return t('recently')
  }

  let date: Date
  try {
    date = typeof dateString === 'string' ? new Date(dateString) : dateString
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return t('recently')
    }
  } catch {
    return t('recently')
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return t('justNow')
  }

  if (diffMinutes < 60) {
    return t('minutesAgo', { count: diffMinutes })
  }

  if (diffHours < 24) {
    return t('hoursAgo', { count: diffHours })
  }

  if (diffDays < 30) {
    return t('daysAgo', { count: diffDays })
  }

  // For dates older than 30 days, return "Recently" as fallback
  return t('recently')
}

/**
 * Wrapper for formatTimeAgo that uses the common.relativeTime namespace.
 * This is a convenience function for components that already have access to useTranslations('common').
 *
 * @param dateString - ISO date string, Date object, or null/undefined
 * @param tCommon - Translation function from useTranslations('common')
 * @returns Formatted relative time string
 */
export function formatRelativeTime(
  dateString: string | Date | null | undefined,
  tCommon: (key: string, values?: Record<string, number>) => string
): string {
  const t = (key: string, values?: Record<string, number>) =>
    tCommon(`relativeTime.${key}`, values)
  return formatTimeAgo(dateString, t)
}
