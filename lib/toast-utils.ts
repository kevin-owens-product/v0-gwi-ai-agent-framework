'use client';

import { toast, ExternalToast } from 'sonner';

/**
 * Toast Utility Functions
 *
 * Wrapper functions for sonner toast to support internationalization.
 * Components should pass already-translated strings to these functions.
 *
 * Usage with translations:
 * ```tsx
 * import { useTranslations } from 'next-intl';
 * import { showSuccessToast, showErrorToast } from '@/lib/toast-utils';
 *
 * function MyComponent() {
 *   const t = useTranslations('toast');
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       showSuccessToast(t('saveSuccess'));
 *     } catch (error) {
 *       showErrorToast(t('saveError'));
 *     }
 *   };
 * }
 * ```
 *
 * @module lib/toast-utils
 */

// ============================================================================
// SUCCESS TOASTS
// ============================================================================

/**
 * Show a success toast notification
 * @param message - The translated success message
 * @param options - Optional toast configuration
 */
export const showSuccessToast = (message: string, options?: ExternalToast) => {
  toast.success(message, options);
};

// ============================================================================
// ERROR TOASTS
// ============================================================================

/**
 * Show an error toast notification
 * @param message - The translated error message
 * @param options - Optional toast configuration
 */
export const showErrorToast = (message: string, options?: ExternalToast) => {
  toast.error(message, options);
};

// ============================================================================
// LOADING TOASTS
// ============================================================================

/**
 * Show a loading toast notification
 * Returns a toast ID that can be used to update/dismiss the toast
 * @param message - The translated loading message
 * @param options - Optional toast configuration
 * @returns The toast ID for later updates
 */
export const showLoadingToast = (message: string, options?: ExternalToast) => {
  return toast.loading(message, options);
};

// ============================================================================
// INFO TOASTS
// ============================================================================

/**
 * Show an info toast notification
 * @param message - The translated info message
 * @param options - Optional toast configuration
 */
export const showInfoToast = (message: string, options?: ExternalToast) => {
  toast.info(message, options);
};

// ============================================================================
// WARNING TOASTS
// ============================================================================

/**
 * Show a warning toast notification
 * @param message - The translated warning message
 * @param options - Optional toast configuration
 */
export const showWarningToast = (message: string, options?: ExternalToast) => {
  toast.warning(message, options);
};

// ============================================================================
// TOAST MANAGEMENT
// ============================================================================

/**
 * Dismiss a specific toast by ID
 * @param toastId - The toast ID to dismiss
 */
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

// ============================================================================
// PROMISE TOASTS
// ============================================================================

/**
 * Show a toast that tracks a promise
 * Shows loading, success, or error state based on promise resolution
 *
 * @param promise - The promise to track
 * @param messages - Object containing translated loading, success, and error messages
 *
 * @example
 * ```tsx
 * showPromiseToast(
 *   saveData(),
 *   {
 *     loading: t('saving'),
 *     success: t('saved'),
 *     error: t('saveFailed'),
 *   }
 * );
 * ```
 */
export const showPromiseToast = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
) => {
  return toast.promise(promise, messages);
};

// ============================================================================
// CUSTOM TOAST
// ============================================================================

/**
 * Show a custom toast message (neutral, no icon)
 * @param message - The translated message
 * @param options - Optional toast configuration
 */
export const showToast = (message: string, options?: ExternalToast) => {
  toast(message, options);
};

// ============================================================================
// TOAST WITH DESCRIPTION
// ============================================================================

/**
 * Show a success toast with a description
 * @param title - The translated title
 * @param description - The translated description
 * @param options - Optional toast configuration
 */
export const showSuccessToastWithDescription = (
  title: string,
  description: string,
  options?: ExternalToast
) => {
  toast.success(title, { ...options, description });
};

/**
 * Show an error toast with a description
 * @param title - The translated title
 * @param description - The translated description
 * @param options - Optional toast configuration
 */
export const showErrorToastWithDescription = (
  title: string,
  description: string,
  options?: ExternalToast
) => {
  toast.error(title, { ...options, description });
};

// ============================================================================
// TOAST WITH ACTION
// ============================================================================

/**
 * Show a toast with an action button
 * @param message - The translated message
 * @param actionLabel - The translated action button label
 * @param onAction - The action callback
 * @param options - Optional toast configuration
 */
export const showToastWithAction = (
  message: string,
  actionLabel: string,
  onAction: () => void,
  options?: ExternalToast
) => {
  toast(message, {
    ...options,
    action: {
      label: actionLabel,
      onClick: onAction,
    },
  });
};
