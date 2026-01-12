/**
 * React Hooks for Event Tracking
 *
 * Provides convenient hooks for tracking user interactions, navigation,
 * form submissions, and other events throughout the application.
 *
 * @module hooks/useEventTracking
 */

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  track,
  trackNavigation,
  trackClick,
  trackForm,
  trackError,
  trackApiCall,
  type TrackingEvent,
  type EventMetadata,
} from '@/lib/client-tracking';

/**
 * Main tracking hook with all tracking methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackEvent, trackButtonClick, trackFormSubmit } = useEventTracking();
 *
 *   const handleSubmit = (data) => {
 *     trackFormSubmit('create-agent-form', { agentType: data.type });
 *     // ... submit logic
 *   };
 *
 *   return <button onClick={() => trackButtonClick('create-btn')}>Create</button>;
 * }
 * ```
 */
export function useEventTracking() {
  const pathname = usePathname();

  /**
   * Track a custom event
   */
  const trackEvent = useCallback((event: TrackingEvent) => {
    track({
      ...event,
      metadata: {
        ...event.metadata,
        path: pathname,
      },
    });
  }, [pathname]);

  /**
   * Track button click
   */
  const trackButtonClick = useCallback(
    (buttonId: string, buttonText?: string, metadata?: EventMetadata) => {
      trackClick(buttonId, buttonText, {
        ...metadata,
        path: pathname,
      });
    },
    [pathname]
  );

  /**
   * Track form submission
   */
  const trackFormSubmit = useCallback(
    (formId: string, metadata?: EventMetadata) => {
      trackForm('form_submit', formId, {
        ...metadata,
        path: pathname,
      });
    },
    [pathname]
  );

  /**
   * Track form start
   */
  const trackFormStart = useCallback(
    (formId: string, metadata?: EventMetadata) => {
      trackForm('form_start', formId, {
        ...metadata,
        path: pathname,
      });
    },
    [pathname]
  );

  /**
   * Track form error
   */
  const trackFormError = useCallback(
    (formId: string, errors: string[], metadata?: EventMetadata) => {
      trackForm('form_validation_error', formId, {
        ...metadata,
        validationErrors: errors,
        path: pathname,
      });
    },
    [pathname]
  );

  /**
   * Track form field change
   */
  const trackFieldChange = useCallback(
    (formId: string, fieldName: string, metadata?: EventMetadata) => {
      trackForm('form_field_change', formId, {
        ...metadata,
        fieldName,
        path: pathname,
      });
    },
    [pathname]
  );

  /**
   * Track API error
   */
  const trackApiError = useCallback(
    (endpoint: string, errorMessage: string, metadata?: EventMetadata) => {
      trackError('api_error', errorMessage, {
        ...metadata,
        endpoint,
        path: pathname,
      });
    },
    [pathname]
  );

  return {
    trackEvent,
    trackButtonClick,
    trackFormSubmit,
    trackFormStart,
    trackFormError,
    trackFieldChange,
    trackApiError,
    track,
    trackClick,
    trackForm,
    trackError,
    trackApiCall,
  };
}

/**
 * Hook to automatically track page views
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   usePageViewTracking();
 *   return <div>My Page</div>;
 * }
 * ```
 */
export function usePageViewTracking(metadata?: EventMetadata) {
  const pathname = usePathname();
  const previousPathname = useRef<string>();

  useEffect(() => {
    // Track page view
    track({
      category: 'navigation',
      action: 'page_view',
      label: pathname,
      metadata: {
        ...metadata,
        path: pathname,
        from: previousPathname.current,
      },
    });

    // Track route change if not first load
    if (previousPathname.current) {
      trackNavigation(pathname, previousPathname.current);
    }

    previousPathname.current = pathname;
  }, [pathname, metadata]);
}

/**
 * Hook to track agent-related actions
 *
 * @example
 * ```tsx
 * function AgentBuilder() {
 *   const { trackAgentCreate, trackAgentRun } = useAgentTracking();
 *
 *   const handleCreate = async (data) => {
 *     const agent = await createAgent(data);
 *     trackAgentCreate(agent.id, { agentType: data.type });
 *   };
 * }
 * ```
 */
export function useAgentTracking() {
  const pathname = usePathname();

  const trackAgentView = useCallback(
    (agentId: string, metadata?: EventMetadata) => {
      track({
        category: 'agent',
        action: 'agent_view',
        label: agentId,
        metadata: {
          ...metadata,
          resourceId: agentId,
          resourceType: 'agent',
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackAgentCreate = useCallback(
    (agentId: string, metadata?: EventMetadata) => {
      track({
        category: 'agent',
        action: 'agent_create_complete',
        label: agentId,
        metadata: {
          ...metadata,
          resourceId: agentId,
          resourceType: 'agent',
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackAgentRun = useCallback(
    (agentId: string, duration?: number, metadata?: EventMetadata) => {
      track({
        category: 'agent',
        action: 'agent_run_complete',
        label: agentId,
        value: duration,
        metadata: {
          ...metadata,
          resourceId: agentId,
          resourceType: 'agent',
          duration,
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackAgentError = useCallback(
    (agentId: string, errorMessage: string, metadata?: EventMetadata) => {
      track({
        category: 'agent',
        action: 'agent_run_error',
        label: agentId,
        metadata: {
          ...metadata,
          resourceId: agentId,
          resourceType: 'agent',
          errorMessage,
          path: pathname,
        },
      });
    },
    [pathname]
  );

  return {
    trackAgentView,
    trackAgentCreate,
    trackAgentRun,
    trackAgentError,
  };
}

/**
 * Hook to track workflow-related actions
 *
 * @example
 * ```tsx
 * function WorkflowBuilder() {
 *   const { trackWorkflowCreate, trackWorkflowRun } = useWorkflowTracking();
 * }
 * ```
 */
export function useWorkflowTracking() {
  const pathname = usePathname();

  const trackWorkflowView = useCallback(
    (workflowId: string, metadata?: EventMetadata) => {
      track({
        category: 'workflow',
        action: 'workflow_view',
        label: workflowId,
        metadata: {
          ...metadata,
          resourceId: workflowId,
          resourceType: 'workflow',
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackWorkflowCreate = useCallback(
    (workflowId: string, metadata?: EventMetadata) => {
      track({
        category: 'workflow',
        action: 'workflow_create_complete',
        label: workflowId,
        metadata: {
          ...metadata,
          resourceId: workflowId,
          resourceType: 'workflow',
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackWorkflowRun = useCallback(
    (workflowId: string, duration?: number, metadata?: EventMetadata) => {
      track({
        category: 'workflow',
        action: 'workflow_run_complete',
        label: workflowId,
        value: duration,
        metadata: {
          ...metadata,
          resourceId: workflowId,
          resourceType: 'workflow',
          duration,
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackWorkflowStepAdd = useCallback(
    (workflowId: string, metadata?: EventMetadata) => {
      track({
        category: 'workflow',
        action: 'workflow_step_add',
        label: workflowId,
        metadata: {
          ...metadata,
          resourceId: workflowId,
          resourceType: 'workflow',
          path: pathname,
        },
      });
    },
    [pathname]
  );

  return {
    trackWorkflowView,
    trackWorkflowCreate,
    trackWorkflowRun,
    trackWorkflowStepAdd,
  };
}

/**
 * Hook to track report-related actions
 */
export function useReportTracking() {
  const pathname = usePathname();

  const trackReportView = useCallback(
    (reportId: string, metadata?: EventMetadata) => {
      track({
        category: 'report',
        action: 'report_view',
        label: reportId,
        metadata: {
          ...metadata,
          resourceId: reportId,
          resourceType: 'report',
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackReportCreate = useCallback(
    (reportId: string, metadata?: EventMetadata) => {
      track({
        category: 'report',
        action: 'report_create_complete',
        label: reportId,
        metadata: {
          ...metadata,
          resourceId: reportId,
          resourceType: 'report',
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackReportExport = useCallback(
    (reportId: string, format: string, metadata?: EventMetadata) => {
      track({
        category: 'report',
        action: 'report_export',
        label: reportId,
        metadata: {
          ...metadata,
          resourceId: reportId,
          resourceType: 'report',
          exportFormat: format,
          path: pathname,
        },
      });
    },
    [pathname]
  );

  return {
    trackReportView,
    trackReportCreate,
    trackReportExport,
  };
}

/**
 * Hook to track audience-related actions
 */
export function useAudienceTracking() {
  const pathname = usePathname();

  const trackAudienceCreate = useCallback(
    (audienceId: string, metadata?: EventMetadata) => {
      track({
        category: 'audience',
        action: 'audience_create_complete',
        label: audienceId,
        metadata: {
          ...metadata,
          resourceId: audienceId,
          resourceType: 'audience',
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackAudienceSizeEstimate = useCallback(
    (size: number, metadata?: EventMetadata) => {
      track({
        category: 'audience',
        action: 'audience_size_estimate',
        value: size,
        metadata: {
          ...metadata,
          audienceSize: size,
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackLookalikeGenerate = useCallback(
    (audienceId: string, metadata?: EventMetadata) => {
      track({
        category: 'audience',
        action: 'audience_lookalike_generate',
        label: audienceId,
        metadata: {
          ...metadata,
          resourceId: audienceId,
          resourceType: 'audience',
          path: pathname,
        },
      });
    },
    [pathname]
  );

  return {
    trackAudienceCreate,
    trackAudienceSizeEstimate,
    trackLookalikeGenerate,
  };
}

/**
 * Hook to track search interactions
 */
export function useSearchTracking() {
  const pathname = usePathname();

  const trackSearch = useCallback(
    (query: string, resultsCount: number, metadata?: EventMetadata) => {
      track({
        category: 'search',
        action: 'search_complete',
        label: query,
        value: resultsCount,
        metadata: {
          ...metadata,
          query,
          resultsCount,
          path: pathname,
        },
      });
    },
    [pathname]
  );

  const trackFilterApply = useCallback(
    (filters: Record<string, any>, metadata?: EventMetadata) => {
      track({
        category: 'search',
        action: 'filter_apply',
        metadata: {
          ...metadata,
          filters,
          path: pathname,
        },
      });
    },
    [pathname]
  );

  return {
    trackSearch,
    trackFilterApply,
  };
}

/**
 * Hook to automatically track time spent on page
 *
 * @example
 * ```tsx
 * function MyPage() {
 *   useTimeOnPage('my-page');
 *   return <div>Content</div>;
 * }
 * ```
 */
export function useTimeOnPage(pageId: string, metadata?: EventMetadata) {
  const pathname = usePathname();
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const duration = Date.now() - startTime.current;
      track({
        category: 'performance',
        action: 'render_time',
        label: pageId,
        value: duration,
        metadata: {
          ...metadata,
          duration,
          path: pathname,
        },
      });
    };
  }, [pageId, pathname, metadata]);
}

/**
 * Hook to track form interactions automatically
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const { register, handleSubmit } = useForm();
 *   const trackingHandlers = useFormTracking('my-form', handleSubmit);
 *
 *   return (
 *     <form onSubmit={trackingHandlers.onSubmit(onSubmit)}>
 *       <input {...register('name')} onChange={trackingHandlers.onFieldChange('name')} />
 *     </form>
 *   );
 * }
 * ```
 */
export function useFormTracking(
  formId: string,
  submitHandler?: any,
  metadata?: EventMetadata
) {
  const pathname = usePathname();
  const hasStarted = useRef(false);

  // Track form start on first field interaction
  const onFieldChange = useCallback(
    (fieldName: string) => (event: any) => {
      if (!hasStarted.current) {
        hasStarted.current = true;
        trackForm('form_start', formId, {
          ...metadata,
          path: pathname,
        });
      }

      trackForm('form_field_change', formId, {
        ...metadata,
        fieldName,
        path: pathname,
      });
    },
    [formId, pathname, metadata]
  );

  // Track form submission
  const onSubmit = useCallback(
    (handler: any) => async (data: any) => {
      try {
        trackForm('form_submit', formId, {
          ...metadata,
          path: pathname,
        });
        if (handler) {
          await handler(data);
        }
      } catch (error: any) {
        trackForm('form_error', formId, {
          ...metadata,
          errorMessage: error.message,
          path: pathname,
        });
        throw error;
      }
    },
    [formId, pathname, metadata]
  );

  return {
    onFieldChange,
    onSubmit,
  };
}
