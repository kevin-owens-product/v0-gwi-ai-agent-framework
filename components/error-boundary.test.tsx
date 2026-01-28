import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, ErrorFallback, withErrorBoundary } from './error-boundary'

// Suppress console.error for these tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders default error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error message</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.any(Object)
    )
  })

  it('resets error state when Try Again is clicked', () => {
    // Use a stateful wrapper to control error state
    let shouldThrow = true
    function ControlledError() {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>No error</div>
    }

    const { rerender: _rerender } = render(
      <ErrorBoundary>
        <ControlledError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Change state before clicking reset
    shouldThrow = false

    // Click Try Again
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))

    // The component should now render without error
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('shows Reload Page button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
  })
})

describe('ErrorFallback', () => {
  it('renders error message', () => {
    render(<ErrorFallback />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders Try Again button when resetError is provided', () => {
    const resetError = vi.fn()
    render(<ErrorFallback resetError={resetError} />)

    const button = screen.getByRole('button', { name: /try again/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(resetError).toHaveBeenCalledTimes(1)
  })

  it('does not render Try Again button when resetError is not provided', () => {
    render(<ErrorFallback />)

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
  })
})

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    function MyComponent() {
      return <div>My component</div>
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const WrappedComponent = withErrorBoundary(MyComponent)
    render(<WrappedComponent />)

    expect(screen.getByText('My component')).toBeInTheDocument()
  })

  it('catches errors from wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError)
    render(<WrappedComponent shouldThrow={true} />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('sets display name correctly', () => {
    function MyNamedComponent() {
      return <div>Named</div>
    }

    const WrappedComponent = withErrorBoundary(MyNamedComponent)
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(MyNamedComponent)')
  })
})
