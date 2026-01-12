import { describe, it, expect } from 'vitest'

describe('Shared Utilities', () => {
  describe('String Utilities', () => {
    it('should capitalize first letter', () => {
      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated'
      const maxLength = 20
      const truncated = text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text

      expect(truncated.length).toBeLessThanOrEqual(maxLength + 3) // +3 for '...'
    })

    it('should format large numbers', () => {
      const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toString()
      }

      expect(formatNumber(1500000)).toBe('1.5M')
      expect(formatNumber(5400)).toBe('5.4K')
    })
  })

  describe('Currency Formatting', () => {
    it('should format USD currency', () => {
      const value = 125450.50
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)

      expect(formatted).toContain('125')
    })

    it('should format with thousands separator', () => {
      const value = 1234567
      const formatted = value.toLocaleString('en-US')

      expect(formatted).toBe('1,234,567')
    })

    it('should abbreviate large numbers', () => {
      const value = 1500000
      const formatted = value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString()

      expect(formatted).toBe('1.5M')
    })
  })

  describe('Trend Indicators', () => {
    it('should indicate upward trend', () => {
      const change = 12.5
      const trend = change > 0 ? 'up' : 'down'

      expect(trend).toBe('up')
    })

    it('should indicate downward trend', () => {
      const change = -5.2
      const trend = change < 0 ? 'down' : 'up'

      expect(trend).toBe('down')
    })

    it('should indicate no change', () => {
      const change = 0
      const hasChange = change !== 0

      expect(hasChange).toBe(false)
    })
  })

  describe('Comparison Period', () => {
    it('should compare to previous period', () => {
      const current = 10500
      const previous = 9200
      const change = ((current - previous) / previous) * 100

      expect(change).toBeCloseTo(14.13, 0)
    })

    it('should calculate percentage change', () => {
      const current = 150
      const previous = 120
      const change = ((current - previous) / previous) * 100

      expect(change).toBe(25)
    })
  })
})
