/**
 * Client-Side Event Tracking System
 *
 * This module provides comprehensive client-side event tracking for user interactions,
 * navigation, performance metrics, and feature usage. It integrates with the server-side
 * audit log system and provides real-time analytics capabilities.
 *
 * @module lib/client-tracking
 */

// ============================================================================
// Event Type Definitions
// ============================================================================

/**
 * Category of events being tracked
 */
export type EventCategory =
  | 'authentication'
  | 'navigation'
  | 'agent'
  | 'workflow'
  | 'report'
  | 'audience'
  | 'crosstab'
  | 'chart'
  | 'dashboard'
  | 'brand_tracking'
  | 'data_source'
  | 'integration'
  | 'team'
  | 'api_key'
  | 'settings'
  | 'ui_interaction'
  | 'form'
  | 'search'
  | 'export'
  | 'error'
  | 'performance';

/**
 * Specific action within a category
 */
export type EventAction =
  // Authentication
  | 'login_attempt' | 'login_success' | 'login_failure'
  | 'signup_start' | 'signup_complete' | 'signup_failure'
  | 'logout' | 'password_reset_request' | 'password_reset_complete'

  // Navigation
  | 'page_view' | 'route_change' | 'sidebar_click' | 'breadcrumb_click'
  | 'command_palette_open' | 'command_palette_select'

  // Agent lifecycle
  | 'agent_view' | 'agent_create_start' | 'agent_create_complete'
  | 'agent_edit_start' | 'agent_edit_complete' | 'agent_delete'
  | 'agent_run_start' | 'agent_run_complete' | 'agent_run_error'
  | 'agent_publish' | 'agent_test' | 'agent_clone'

  // Workflow lifecycle
  | 'workflow_view' | 'workflow_create_start' | 'workflow_create_complete'
  | 'workflow_edit_start' | 'workflow_edit_complete' | 'workflow_delete'
  | 'workflow_run_start' | 'workflow_run_complete' | 'workflow_run_error'
  | 'workflow_step_add' | 'workflow_step_remove' | 'workflow_step_reorder'

  // Report lifecycle
  | 'report_view' | 'report_create_start' | 'report_create_complete'
  | 'report_edit' | 'report_delete' | 'report_export' | 'report_share'
  | 'report_template_select'

  // Audience management
  | 'audience_view' | 'audience_create_start' | 'audience_create_complete'
  | 'audience_edit' | 'audience_delete' | 'audience_favorite'
  | 'audience_lookalike_generate' | 'audience_size_estimate' | 'audience_compare'

  // Crosstab operations
  | 'crosstab_view' | 'crosstab_create_start' | 'crosstab_create_complete'
  | 'crosstab_edit' | 'crosstab_delete' | 'crosstab_export'

  // Chart operations
  | 'chart_view' | 'chart_create' | 'chart_edit' | 'chart_delete'
  | 'chart_type_change' | 'chart_export'

  // Dashboard operations
  | 'dashboard_view' | 'dashboard_create' | 'dashboard_edit' | 'dashboard_delete'
  | 'dashboard_widget_add' | 'dashboard_widget_remove' | 'dashboard_share'

  // Brand tracking
  | 'brand_tracking_view' | 'brand_tracking_create' | 'brand_tracking_snapshot'
  | 'brand_tracking_analyze' | 'brand_tracking_compare'

  // Data sources
  | 'data_source_view' | 'data_source_connect' | 'data_source_disconnect'
  | 'data_source_sync' | 'data_source_configure'

  // Integrations
  | 'integration_view' | 'integration_connect' | 'integration_disconnect'
  | 'integration_configure'

  // Team management
  | 'team_member_invite' | 'team_member_add' | 'team_member_remove'
  | 'team_role_change' | 'team_view'

  // API keys
  | 'api_key_create' | 'api_key_rotate' | 'api_key_delete' | 'api_key_view'

  // Settings
  | 'settings_view' | 'settings_update' | 'appearance_change' | 'notification_update'

  // UI interactions
  | 'button_click' | 'link_click' | 'dropdown_open' | 'dropdown_select'
  | 'tab_change' | 'modal_open' | 'modal_close' | 'tooltip_view'

  // Form interactions
  | 'form_start' | 'form_submit' | 'form_error' | 'form_field_change'
  | 'form_validation_error' | 'form_abandon'

  // Search
  | 'search_start' | 'search_complete' | 'search_result_click' | 'filter_apply'

  // Export
  | 'export_csv' | 'export_pdf' | 'export_json' | 'export_image'

  // Errors
  | 'api_error' | 'validation_error' | 'network_error' | 'auth_error'

  // Performance
  | 'page_load' | 'api_call' | 'render_time';

/**
 * Event metadata structure
 */
export interface EventMetadata {
  // Common fields
  path?: string;
  referrer?: string;

  // Component context
  componentName?: string;
  componentProps?: Record<string, any>;

  // Resource identifiers
  resourceId?: string;
  resourceType?: string;

  // User interaction details
  elementId?: string;
  elementType?: string;
  elementText?: string;

  // Form details
  formId?: string;
  fieldName?: string;
  fieldValue?: any;
  validationErrors?: string[];

  // Search details
  query?: string;
  filters?: Record<string, any>;
  resultsCount?: number;

  // Performance metrics
  duration?: number;
  loadTime?: number;
  renderTime?: number;

  // Error details
  errorMessage?: string;
  errorCode?: string;
  errorStack?: string;

  // Feature-specific data
  agentType?: string;
  workflowSteps?: number;
  reportType?: string;
  audienceSize?: number;
  chartType?: string;

  // Additional custom fields
  [key: string]: any;
}

/**
 * Complete event structure
 */
export interface TrackingEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  metadata?: EventMetadata;
  timestamp?: Date;
}

// ============================================================================
// Client-Side Tracking Implementation
// ============================================================================

/**
 * Configuration for the tracking system
 */
interface TrackingConfig {
  enabled: boolean;
  debug: boolean;
  endpoint: string;
  batchSize: number;
  flushInterval: number;
  includeUserAgent: boolean;
  includePerformance: boolean;
}

/**
 * Default tracking configuration
 */
const DEFAULT_CONFIG: TrackingConfig = {
  enabled: true,
  debug: false, // Disable console logging
  endpoint: '/api/v1/tracking',
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  includeUserAgent: true,
  includePerformance: true,
};

/**
 * Main tracking class
 */
class ClientTracker {
  private config: TrackingConfig;
  private eventQueue: TrackingEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();

    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  /**
   * Initialize tracking system
   */
  private initializeTracking(): void {
    // Track page load performance
    if (this.config.includePerformance && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => this.trackPageLoad(), 0);
      });
    }

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush(); // Flush events when page becomes hidden
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.flush(true); // Force synchronous flush
    });

    // Start automatic flush timer
    this.startFlushTimer();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Track a single event
   */
  public track(event: TrackingEvent): void {
    if (!this.config.enabled) return;

    const enrichedEvent: TrackingEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
      metadata: {
        ...event.metadata,
        sessionId: this.sessionId,
        path: window.location.pathname,
        referrer: document.referrer,
        userAgent: this.config.includeUserAgent ? navigator.userAgent : undefined,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      },
    };

    if (this.config.debug) {
      console.log('[Tracking]', enrichedEvent);
    }

    this.eventQueue.push(enrichedEvent);

    // Flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Track page load performance
   */
  private trackPageLoad(): void {
    if (!('performance' in window)) return;

    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!perfData) return;

    this.track({
      category: 'performance',
      action: 'page_load',
      metadata: {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoadedTime: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        domInteractiveTime: perfData.domInteractive - perfData.fetchStart,
        dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcpTime: perfData.connectEnd - perfData.connectStart,
        requestTime: perfData.responseStart - perfData.requestStart,
        responseTime: perfData.responseEnd - perfData.responseStart,
        renderTime: perfData.domComplete - perfData.domInteractive,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      },
    });
  }

  /**
   * Track navigation event
   */
  public trackNavigation(to: string, from?: string): void {
    this.track({
      category: 'navigation',
      action: 'route_change',
      label: to,
      metadata: {
        from,
        to,
      },
    });
  }

  /**
   * Track button click
   */
  public trackClick(
    elementId: string,
    elementText?: string,
    metadata?: EventMetadata
  ): void {
    this.track({
      category: 'ui_interaction',
      action: 'button_click',
      label: elementText || elementId,
      metadata: {
        elementId,
        elementText,
        ...metadata,
      },
    });
  }

  /**
   * Track form interaction
   */
  public trackForm(
    action: 'form_start' | 'form_submit' | 'form_error' | 'form_field_change' | 'form_validation_error' | 'form_abandon',
    formId: string,
    metadata?: EventMetadata
  ): void {
    this.track({
      category: 'form',
      action,
      label: formId,
      metadata: {
        formId,
        ...metadata,
      },
    });
  }

  /**
   * Track error
   */
  public trackError(
    errorType: 'api_error' | 'validation_error' | 'network_error' | 'auth_error',
    errorMessage: string,
    metadata?: EventMetadata
  ): void {
    this.track({
      category: 'error',
      action: errorType,
      label: errorMessage,
      metadata: {
        errorMessage,
        ...metadata,
      },
    });
  }

  /**
   * Track API call performance
   */
  public trackApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    metadata?: EventMetadata
  ): void {
    this.track({
      category: 'performance',
      action: 'api_call',
      label: `${method} ${endpoint}`,
      value: duration,
      metadata: {
        endpoint,
        method,
        duration,
        status,
        ...metadata,
      },
    });
  }

  /**
   * Flush events to server
   */
  public flush(synchronous: boolean = false): void {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    const payload = {
      events,
      sessionId: this.sessionId,
    };

    if (synchronous && 'sendBeacon' in navigator) {
      // Use sendBeacon for synchronous requests (e.g., on page unload)
      navigator.sendBeacon(
        this.config.endpoint,
        JSON.stringify(payload)
      );
    } else {
      // Use fetch for async requests
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((error) => {
        if (this.config.debug) {
          console.error('[Tracking] Failed to send events:', error);
        }
      });
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Stop tracking and flush remaining events
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush(true);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let trackerInstance: ClientTracker | null = null;

/**
 * Get or create the tracker instance
 */
export function getTracker(config?: Partial<TrackingConfig>): ClientTracker {
  if (!trackerInstance) {
    trackerInstance = new ClientTracker(config);
  }
  return trackerInstance;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Track a custom event
 */
export function track(event: TrackingEvent): void {
  getTracker().track(event);
}

/**
 * Track navigation
 */
export function trackNavigation(to: string, from?: string): void {
  getTracker().trackNavigation(to, from);
}

/**
 * Track button click
 */
export function trackClick(
  elementId: string,
  elementText?: string,
  metadata?: EventMetadata
): void {
  getTracker().trackClick(elementId, elementText, metadata);
}

/**
 * Track form interaction
 */
export function trackForm(
  action: 'form_start' | 'form_submit' | 'form_error' | 'form_field_change' | 'form_validation_error' | 'form_abandon',
  formId: string,
  metadata?: EventMetadata
): void {
  getTracker().trackForm(action, formId, metadata);
}

/**
 * Track error
 */
export function trackError(
  errorType: 'api_error' | 'validation_error' | 'network_error' | 'auth_error',
  errorMessage: string,
  metadata?: EventMetadata
): void {
  getTracker().trackError(errorType, errorMessage, metadata);
}

/**
 * Track API call
 */
export function trackApiCall(
  endpoint: string,
  method: string,
  duration: number,
  status: number,
  metadata?: EventMetadata
): void {
  getTracker().trackApiCall(endpoint, method, duration, status, metadata);
}

/**
 * Flush all queued events
 */
export function flushEvents(): void {
  getTracker().flush();
}

// ============================================================================
// React Integration Utilities
// ============================================================================

/**
 * HOC to track component lifecycle
 */
export function withTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  // Import React dynamically to avoid UMD global reference
  return (props: P) => {
    if (typeof window === 'undefined') return null;

    const React = require('react');

    React.useEffect(() => {
      track({
        category: 'ui_interaction',
        action: 'page_view',
        label: componentName,
        metadata: {
          componentName,
        },
      });
    }, []);

    return React.createElement(Component, props);
  };
}

/**
 * Hook for tracking within components
 */
export function useTracking() {
  // Note: This function should be called within a React component context
  return {
    track,
    trackNavigation,
    trackClick,
    trackForm,
    trackError,
    trackApiCall,
  };
}
