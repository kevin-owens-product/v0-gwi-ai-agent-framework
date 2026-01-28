import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
  showInfoToast,
  showWarningToast,
  dismissToast,
  dismissAllToasts,
  showPromiseToast,
  showToast,
  showSuccessToastWithDescription,
  showErrorToastWithDescription,
  showToastWithAction,
} from './toast-utils'

// Mock sonner toast - define all mocks inside factory to avoid hoisting issues
const mockSuccess = vi.fn()
const mockError = vi.fn()
const mockLoading = vi.fn()
const mockInfo = vi.fn()
const mockWarning = vi.fn()
const mockDismiss = vi.fn()
const mockPromise = vi.fn()
const mockToastFn = vi.fn()

vi.mock('sonner', () => {
  // Create fresh mock functions for each test run
  const success = vi.fn()
  const error = vi.fn()
  const loading = vi.fn()
  const info = vi.fn()
  const warning = vi.fn()
  const dismiss = vi.fn()
  const promise = vi.fn()
  const toastFn = vi.fn()
  
  const mockToast = Object.assign(toastFn, {
    success,
    error,
    loading,
    info,
    warning,
    dismiss,
    promise,
  })
  
  // Store references globally so tests can access them
  ;(globalThis as any).__mockToastSuccess = success
  ;(globalThis as any).__mockToastError = error
  ;(globalThis as any).__mockToastLoading = loading
  ;(globalThis as any).__mockToastInfo = info
  ;(globalThis as any).__mockToastWarning = warning
  ;(globalThis as any).__mockToastDismiss = dismiss
  ;(globalThis as any).__mockToastPromise = promise
  ;(globalThis as any).__mockToastFn = toastFn
  
  return {
    toast: mockToast,
    default: mockToast,
  }
})

// Helper to get mock functions
const getMocks = () => ({
  success: (globalThis as any).__mockToastSuccess as ReturnType<typeof vi.fn>,
  error: (globalThis as any).__mockToastError as ReturnType<typeof vi.fn>,
  loading: (globalThis as any).__mockToastLoading as ReturnType<typeof vi.fn>,
  info: (globalThis as any).__mockToastInfo as ReturnType<typeof vi.fn>,
  warning: (globalThis as any).__mockToastWarning as ReturnType<typeof vi.fn>,
  dismiss: (globalThis as any).__mockToastDismiss as ReturnType<typeof vi.fn>,
  promise: (globalThis as any).__mockToastPromise as ReturnType<typeof vi.fn>,
  toastFn: (globalThis as any).__mockToastFn as ReturnType<typeof vi.fn>,
})

describe('Toast Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset global mocks
    const mocks = getMocks()
    vi.clearAllMocks()
  })

  describe('showSuccessToast', () => {
    it('should call toast.success with message', () => {
      const mocks = getMocks()
      showSuccessToast('Success message')

      expect(mocks.success).toHaveBeenCalledWith('Success message', undefined)
    })

    it('should call toast.success with options', () => {
      const mocks = getMocks()
      showSuccessToast('Success message', { duration: 5000 })

      expect(mocks.success).toHaveBeenCalledWith('Success message', {
        duration: 5000,
      })
    })
  })

  describe('showErrorToast', () => {
    it('should call toast.error with message', () => {
      const mocks = getMocks()
      showErrorToast('Error message')

      expect(mocks.error).toHaveBeenCalledWith('Error message', undefined)
    })

    it('should call toast.error with options', () => {
      const mocks = getMocks()
      showErrorToast('Error message', { duration: 5000 })

      expect(mocks.error).toHaveBeenCalledWith('Error message', {
        duration: 5000,
      })
    })
  })

  describe('showLoadingToast', () => {
    it('should call toast.loading and return toast ID', () => {
      const mocks = getMocks()
      mocks.loading.mockReturnValue('toast-id-123')
      const result = showLoadingToast('Loading message')

      expect(mocks.loading).toHaveBeenCalledWith('Loading message', undefined)
      expect(result).toBe('toast-id-123')
    })
  })

  describe('showInfoToast', () => {
    it('should call toast.info with message', () => {
      const mocks = getMocks()
      showInfoToast('Info message')

      expect(mocks.info).toHaveBeenCalledWith('Info message', undefined)
    })
  })

  describe('showWarningToast', () => {
    it('should call toast.warning with message', () => {
      const mocks = getMocks()
      showWarningToast('Warning message')

      expect(mocks.warning).toHaveBeenCalledWith('Warning message', undefined)
    })
  })

  describe('dismissToast', () => {
    it('should call toast.dismiss with toast ID', () => {
      const mocks = getMocks()
      dismissToast('toast-id-123')

      expect(mocks.dismiss).toHaveBeenCalledWith('toast-id-123')
    })

    it('should handle numeric toast ID', () => {
      const mocks = getMocks()
      dismissToast(123)

      expect(mocks.dismiss).toHaveBeenCalledWith(123)
    })
  })

  describe('dismissAllToasts', () => {
    it('should call toast.dismiss without arguments', () => {
      const mocks = getMocks()
      dismissAllToasts()

      expect(mocks.dismiss).toHaveBeenCalledWith()
    })
  })

  describe('showPromiseToast', () => {
    it('should call toast.promise with promise and messages', () => {
      const mocks = getMocks()
      const promise = Promise.resolve('result')
      const messages = {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      }

      showPromiseToast(promise, messages)

      expect(mocks.promise).toHaveBeenCalledWith(promise, messages)
    })
  })

  describe('showToast', () => {
    it('should call toast with message', () => {
      const mocks = getMocks()
      // Verify function exists and can be called without errors
      expect(typeof showToast).toBe('function')
      // Call the function - it should not throw
      expect(() => showToast('Custom message')).not.toThrow()
      expect(mocks.toastFn).toHaveBeenCalled()
    })
  })

  describe('showSuccessToastWithDescription', () => {
    it('should call toast.success with title and description', () => {
      const mocks = getMocks()
      showSuccessToastWithDescription('Title', 'Description')

      expect(mocks.success).toHaveBeenCalledWith('Title', {
        description: 'Description',
      })
    })

    it('should merge with additional options', () => {
      const mocks = getMocks()
      showSuccessToastWithDescription('Title', 'Description', { duration: 5000 })

      expect(mocks.success).toHaveBeenCalledWith('Title', {
        description: 'Description',
        duration: 5000,
      })
    })
  })

  describe('showErrorToastWithDescription', () => {
    it('should call toast.error with title and description', () => {
      const mocks = getMocks()
      showErrorToastWithDescription('Title', 'Description')

      expect(mocks.error).toHaveBeenCalledWith('Title', {
        description: 'Description',
      })
    })

    it('should merge with additional options', () => {
      const mocks = getMocks()
      showErrorToastWithDescription('Title', 'Description', { duration: 5000 })

      expect(mocks.error).toHaveBeenCalledWith('Title', {
        description: 'Description',
        duration: 5000,
      })
    })
  })

  describe('showToastWithAction', () => {
    it('should call toast with message and action', () => {
      const mocks = getMocks()
      const onAction = vi.fn()

      // Verify function exists and can be called without errors
      expect(typeof showToastWithAction).toBe('function')
      // Call the function - it should not throw
      expect(() => showToastWithAction('Message', 'Action Label', onAction)).not.toThrow()
      expect(mocks.toastFn).toHaveBeenCalled()
    })

    it('should merge with additional options', () => {
      const mocks = getMocks()
      const onAction = vi.fn()

      // Verify function exists and can be called without errors
      expect(typeof showToastWithAction).toBe('function')
      // Call the function - it should not throw
      expect(() => showToastWithAction('Message', 'Action Label', onAction, { duration: 5000 })).not.toThrow()
      expect(mocks.toastFn).toHaveBeenCalled()
    })
  })
})
