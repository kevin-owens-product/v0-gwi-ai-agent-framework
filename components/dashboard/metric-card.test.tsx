import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock metric card component structure
const MetricCard = ({ title, value, change, icon }: any) => (
  <div data-testid="metric-card">
    {icon && <div data-testid="icon">{icon}</div>}
    <h3>{title}</h3>
    <p data-testid="value">{value}</p>
    {change && <span data-testid="change">{change}</span>}
  </div>
)

describe('Metric Card Component', () => {
  describe('Rendering', () => {
    it('should render metric card', () => {
      render(<MetricCard title="Total Users" value="10,500" />)
      expect(screen.getByTestId('metric-card')).toBeDefined()
    })

    it('should display title', () => {
      render(<MetricCard title="Total Revenue" value="$125,000" />)
      expect(screen.getByText('Total Revenue')).toBeDefined()
    })

    it('should display value', () => {
      render(<MetricCard title="Active Users" value="8,450" />)
      expect(screen.getByTestId('value')).toBeDefined()
    })
  })

  describe('Change Indicator', () => {
    it('should display positive change', () => {
      render(<MetricCard title="Sales" value="$50,000" change="+12.5%" />)
      const change = screen.getByTestId('change')
      expect(change.textContent).toBe('+12.5%')
    })

    it('should display negative change', () => {
      render(<MetricCard title="Bounce Rate" value="35%" change="-5.2%" />)
      const change = screen.getByTestId('change')
      expect(change.textContent).toBe('-5.2%')
    })

    it('should not display change when not provided', () => {
      render(<MetricCard title="Users" value="1,000" />)
      const change = screen.queryByTestId('change')
      expect(change).toBeNull()
    })
  })

  describe('Icon', () => {
    it('should display icon', () => {
      render(<MetricCard title="Revenue" value="$100k" icon="💰" />)
      const icon = screen.getByTestId('icon')
      expect(icon.textContent).toBe('💰')
    })

    it('should not display icon when not provided', () => {
      render(<MetricCard title="Users" value="1,000" />)
      const icon = screen.queryByTestId('icon')
      expect(icon).toBeNull()
    })
  })

  describe('Value Formatting', () => {
    it('should handle large numbers', () => {
      render(<MetricCard title="Page Views" value="1,234,567" />)
      expect(screen.getByTestId('value').textContent).toBe('1,234,567')
    })

    it('should handle currency values', () => {
      render(<MetricCard title="Revenue" value="$125,450.50" />)
      expect(screen.getByTestId('value').textContent).toBe('$125,450.50')
    })

    it('should handle percentage values', () => {
      render(<MetricCard title="Conversion Rate" value="3.45%" />)
      expect(screen.getByTestId('value').textContent).toBe('3.45%')
    })
  })

  describe('Metric Types', () => {
    it('should render count metric', () => {
      render(<MetricCard title="Total Orders" value="1,524" />)
      expect(screen.getByText('Total Orders')).toBeDefined()
    })

    it('should render currency metric', () => {
      render(<MetricCard title="Revenue" value="$125,000" />)
      expect(screen.getByText('Revenue')).toBeDefined()
    })

    it('should render percentage metric', () => {
      render(<MetricCard title="Growth Rate" value="15.5%" />)
      expect(screen.getByText('Growth Rate')).toBeDefined()
    })

    it('should render duration metric', () => {
      render(<MetricCard title="Avg Session" value="4m 32s" />)
      expect(screen.getByText('Avg Session')).toBeDefined()
    })
  })
})
