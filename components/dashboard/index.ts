/**
 * Dashboard Components Barrel Export
 *
 * Centralized exports for all dashboard-specific components.
 *
 * @module components/dashboard
 */

// Layout Components
export { DashboardSidebar, Sidebar } from "./sidebar"
export { DashboardHeader } from "./header"
export { MobileSidebar } from "./mobile-sidebar"

// Hero & Metrics
export { HeroMetrics } from "./hero-metrics"
export { UsageStats } from "./usage-stats"
export { PerformanceCharts } from "./performance-charts"

// Overview & Dashboard
export { DashboardOverview } from "./overview"
export { PlatformOverview } from "./platform-overview"
export { ProjectsOverview } from "./projects-overview"

// Activity & Actions
export { ActiveAgents } from "./active-agents"
export { LiveActivityFeed } from "./live-activity-feed"
export { QuickActions } from "./quick-actions"
export { RecentWorkflows } from "./recent-workflows"
export { RecentReports } from "./recent-reports"

// Insights & AI
export { InsightsPanel } from "./insights-panel"
export { AgentOrchestrator } from "./agent-orchestrator"

// Builder
export { AdvancedDashboardBuilder } from "./advanced-dashboard-builder"

// Legacy alias
export { DashboardHeader as DashboardHeaderLegacy } from "./dashboard-header"
