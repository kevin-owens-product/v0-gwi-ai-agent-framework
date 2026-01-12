# Component Documentation Guide

## Table of Contents

- [Overview](#overview)
- [Documentation Standards](#documentation-standards)
- [JSDoc/TSDoc Syntax](#jsdoctstdoc-syntax)
- [Component Documentation Template](#component-documentation-template)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## Overview

This guide establishes standards for documenting React components, hooks, utilities, and API endpoints in the GWI AI Agent Framework. Comprehensive documentation improves code maintainability, developer onboarding, and collaboration.

### Documentation Goals

1. **Clarity**: Make code purpose and usage immediately clear
2. **Completeness**: Document all public APIs, props, and behaviors
3. **Consistency**: Follow consistent patterns across the codebase
4. **Maintainability**: Keep docs in sync with code changes
5. **Discoverability**: Enable IDE autocomplete and tooltips

---

## Documentation Standards

### What to Document

**Always Document:**
- Public components and their props
- Custom React hooks
- Utility functions and classes
- API endpoints and request/response shapes
- Complex algorithms or business logic
- Non-obvious code patterns
- Configuration options

**Optional:**
- Private/internal functions (if complex)
- Obvious getters/setters
- Simple wrapper components

### Documentation Format

Use **TSDoc/JSDoc** comments for TypeScript/JavaScript files:

```typescript
/**
 * Component description goes here
 *
 * @param props - Component props
 * @returns JSX element
 */
```

### Required Sections

1. **Summary**: Brief description (1-2 sentences)
2. **@param**: For all parameters/props
3. **@returns**: Return value description
4. **@example**: Usage example(s)
5. **@see**: Related components/docs (optional)
6. **@deprecated**: If deprecated (with alternative)

---

## JSDoc/TSDoc Syntax

### Basic Component Documentation

```typescript
/**
 * AgentBuilder component for creating and configuring AI agents.
 *
 * This component provides a form-based interface for users to create new agents
 * by configuring name, type, prompt, and data sources.
 *
 * @component
 * @example
 * ```tsx
 * <AgentBuilder onSubmit={handleCreate} initialData={agent} />
 * ```
 */
export function AgentBuilder(props: AgentBuilderProps) {
  // ...
}
```

### Props Documentation

```typescript
/**
 * Props for the AgentBuilder component
 */
export interface AgentBuilderProps {
  /**
   * Callback fired when the form is successfully submitted
   * @param agent - The created agent data
   */
  onSubmit: (agent: Agent) => void;

  /**
   * Initial agent data for editing (optional)
   * @default undefined
   */
  initialData?: Partial<Agent>;

  /**
   * Whether the form is in loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;
}
```

### Hook Documentation

```typescript
/**
 * Custom hook for managing agent state and operations.
 *
 * Provides methods to fetch, create, update, delete, and run agents
 * with built-in loading and error states.
 *
 * @param orgId - Organization ID to filter agents
 * @returns Agent state and operations
 *
 * @example
 * ```tsx
 * const { agents, isLoading, createAgent, runAgent } = useAgents(orgId);
 *
 * const handleCreate = async (data) => {
 *   const agent = await createAgent(data);
 *   console.log('Created:', agent.id);
 * };
 * ```
 */
export function useAgents(orgId: string) {
  // ...
}
```

### Function Documentation

```typescript
/**
 * Validates agent configuration and returns validation errors.
 *
 * @param config - Agent configuration to validate
 * @returns Array of validation error messages, empty if valid
 *
 * @throws {ValidationError} If config is null or undefined
 *
 * @example
 * ```ts
 * const errors = validateAgentConfig({ name: '', type: 'invalid' });
 * // Returns: ['Name is required', 'Invalid agent type']
 * ```
 */
export function validateAgentConfig(config: AgentConfig): string[] {
  // ...
}
```

### API Endpoint Documentation

```typescript
/**
 * GET /api/v1/agents
 *
 * Retrieves a list of agents for the current organization.
 *
 * @route GET /api/v1/agents
 * @query page - Page number (optional, default: 1)
 * @query limit - Results per page (optional, default: 20)
 * @query type - Filter by agent type (optional)
 *
 * @returns {Promise<AgentListResponse>} Paginated list of agents
 *
 * @throws {401} Unauthorized - User not authenticated
 * @throws {403} Forbidden - No access to organization
 * @throws {500} Internal Server Error
 *
 * @example
 * ```ts
 * const response = await fetch('/api/v1/agents?page=1&limit=10');
 * const { agents, total, page } = await response.json();
 * ```
 */
export async function GET(req: NextRequest) {
  // ...
}
```

### Complex Type Documentation

```typescript
/**
 * Configuration for AI agent behavior and capabilities.
 *
 * @interface
 */
export interface AgentConfig {
  /**
   * Unique identifier for the agent
   * @example 'agent-abc123'
   */
  id: string;

  /**
   * Display name for the agent
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /**
   * Type of agent determining its capabilities
   * @see AgentType
   */
  type: AgentType;

  /**
   * System prompt for the agent
   * @minLength 10
   * @maxLength 10000
   */
  prompt: string;

  /**
   * Connected data sources for the agent
   * @default []
   */
  dataSources?: DataSource[];

  /**
   * Model configuration
   */
  model: {
    /**
     * Model provider (e.g., 'anthropic', 'openai')
     */
    provider: string;

    /**
     * Model name (e.g., 'claude-3-opus')
     */
    name: string;

    /**
     * Model temperature (0-1)
     * @default 0.7
     * @minimum 0
     * @maximum 1
     */
    temperature?: number;
  };
}
```

---

## Component Documentation Template

### Full Component Example

```typescript
/**
 * AgentCard displays a summary of an AI agent with actions.
 *
 * Shows agent name, type, status, and provides quick actions like run, edit,
 * and delete. Includes visual indicators for agent state and recent activity.
 *
 * @component
 *
 * @example
 * Basic usage
 * ```tsx
 * <AgentCard agent={myAgent} onRun={handleRun} />
 * ```
 *
 * @example
 * With all actions
 * ```tsx
 * <AgentCard
 *   agent={myAgent}
 *   onRun={handleRun}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   showStats={true}
 * />
 * ```
 *
 * @see Agent
 * @see AgentDetail
 */
export function AgentCard({
  agent,
  onRun,
  onEdit,
  onDelete,
  showStats = false,
  className,
}: AgentCardProps) {
  /**
   * Handles agent run action with loading state
   */
  const handleRun = async () => {
    // ...
  };

  /**
   * Formats the last run time as relative time
   * @returns Human-readable time string (e.g., "2 hours ago")
   */
  const formatLastRun = () => {
    // ...
  };

  return (
    <Card className={className}>
      {/* ... */}
    </Card>
  );
}

/**
 * Props for AgentCard component
 */
export interface AgentCardProps {
  /**
   * Agent data to display
   */
  agent: Agent;

  /**
   * Callback when run action is triggered
   * @param agentId - ID of the agent to run
   */
  onRun?: (agentId: string) => void;

  /**
   * Callback when edit action is triggered
   * @param agentId - ID of the agent to edit
   */
  onEdit?: (agentId: string) => void;

  /**
   * Callback when delete action is triggered
   * @param agentId - ID of the agent to delete
   */
  onDelete?: (agentId: string) => void;

  /**
   * Whether to show statistics (runs, success rate)
   * @default false
   */
  showStats?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}
```

---

## Examples

### 1. Simple UI Component

```typescript
/**
 * Badge component for displaying status, tags, or labels.
 *
 * @component
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error">Failed</Badge>
 * ```
 */
export function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;

  /** Visual variant */
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';

  /** Additional CSS classes */
  className?: string;
}
```

### 2. Form Component

```typescript
/**
 * WorkflowBuilder provides a multi-step interface for creating workflows.
 *
 * Features:
 * - Drag-and-drop step ordering
 * - Agent selection per step
 * - Schedule configuration
 * - Real-time validation
 *
 * @component
 * @example
 * ```tsx
 * <WorkflowBuilder
 *   initialData={workflow}
 *   availableAgents={agents}
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export function WorkflowBuilder({
  initialData,
  availableAgents,
  onSubmit,
  onCancel,
}: WorkflowBuilderProps) {
  // ...
}

export interface WorkflowBuilderProps {
  /**
   * Initial workflow data for editing
   * @default undefined
   */
  initialData?: Workflow;

  /**
   * List of agents available for workflow steps
   */
  availableAgents: Agent[];

  /**
   * Callback when workflow is saved
   * @param workflow - The created/updated workflow
   */
  onSubmit: (workflow: Workflow) => Promise<void>;

  /**
   * Callback when user cancels the form
   */
  onCancel: () => void;
}
```

### 3. Custom Hook

```typescript
/**
 * Hook for managing debounced values.
 *
 * Delays updating the value until after the specified delay has elapsed
 * since the last change. Useful for expensive operations like API calls.
 *
 * @template T - Type of the value to debounce
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 500);
 *
 *   useEffect(() => {
 *     // Only runs when debouncedQuery changes (500ms after typing stops)
 *     fetchResults(debouncedQuery);
 *   }, [debouncedQuery]);
 *
 *   return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 4. Utility Function

```typescript
/**
 * Formats a number as a human-readable count (e.g., 1.2K, 3.4M).
 *
 * @param count - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 *
 * @example
 * ```ts
 * formatCount(1234)     // "1.2K"
 * formatCount(1500000)  // "1.5M"
 * formatCount(999)      // "999"
 * formatCount(1234, 2)  // "1.23K"
 * ```
 */
export function formatCount(count: number, decimals: number = 1): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(decimals) + 'K';
  if (count < 1000000000) return (count / 1000000).toFixed(decimals) + 'M';
  return (count / 1000000000).toFixed(decimals) + 'B';
}
```

### 5. Context Provider

```typescript
/**
 * ThemeProvider manages application theme state (light/dark mode).
 *
 * Provides theme context to all child components and syncs with localStorage
 * and system preferences.
 *
 * @component
 * @example
 * ```tsx
 * // In app root
 * <ThemeProvider defaultTheme="dark" storageKey="app-theme">
 *   <App />
 * </ThemeProvider>
 *
 * // In components
 * function MyComponent() {
 *   const { theme, setTheme } = useTheme();
 *   return <button onClick={() => setTheme('dark')}>Dark Mode</button>;
 * }
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: ThemeProviderProps) {
  // ...
}

export interface ThemeProviderProps {
  /** Child components */
  children: React.ReactNode;

  /**
   * Default theme on first load
   * @default 'system'
   */
  defaultTheme?: 'light' | 'dark' | 'system';

  /**
   * localStorage key for persisting theme
   * @default 'theme'
   */
  storageKey?: string;
}
```

---

## Best Practices

### 1. Keep Descriptions Concise

**Good:**
```typescript
/**
 * Validates email format.
 * @param email - Email to validate
 * @returns true if valid
 */
```

**Bad:**
```typescript
/**
 * This function takes an email string as input and performs validation
 * to check if it matches the standard email format with an @ symbol
 * and a domain name and returns a boolean value...
 */
```

### 2. Use @example Liberally

Examples are the most valuable part of documentation. Include them for:
- All public components
- Complex functions
- Non-obvious usage patterns

### 3. Document Defaults

Always document default values:

```typescript
/**
 * @param pageSize - Items per page (default: 20)
 * @default 20
 */
```

### 4. Link Related Items

Use `@see` to cross-reference:

```typescript
/**
 * AgentBuilder component
 * @see Agent
 * @see useAgents
 * @see /docs/agents.md
 */
```

### 5. Update Docs with Code

**Never** let documentation drift from code. When changing:
- Props: Update prop documentation
- Behavior: Update component description
- Parameters: Update @param tags

### 6. Document Errors

Explain when functions throw errors:

```typescript
/**
 * @throws {ValidationError} If input is invalid
 * @throws {NetworkError} If API call fails
 */
```

### 7. Use TypeScript

TypeScript types serve as inline documentation. Combine with TSDoc:

```typescript
/**
 * Agent status indicator
 */
type AgentStatus = 'idle' | 'running' | 'error' | 'success';
```

### 8. Avoid Redundancy

Don't repeat what's obvious from the name:

**Bad:**
```typescript
/**
 * Gets the agent ID
 * @returns The agent ID
 */
getAgentId(): string
```

**Good:**
```typescript
/**
 * @returns Unique identifier for this agent
 */
getAgentId(): string
```

### 9. Document Complex Logic

Explain **why**, not just **what**:

```typescript
/**
 * Implements exponential backoff to handle rate limiting.
 * Retries failed requests with increasing delays: 1s, 2s, 4s, 8s.
 */
async function retryWithBackoff() {
  // ...
}
```

### 10. Use Consistent Terminology

Maintain consistent terms across docs:
- "Agent" not "bot" or "assistant"
- "Workflow" not "pipeline" or "sequence"
- "Organization" not "org" or "company"

---

## Documentation Checklist

Before considering a component "documented", verify:

- [ ] Component has TSDoc comment with description
- [ ] All props are documented with types and descriptions
- [ ] At least one usage example is provided
- [ ] Default values are documented
- [ ] Required vs optional props are clear
- [ ] Complex logic has inline comments
- [ ] Related components are cross-referenced
- [ ] Error cases are documented
- [ ] Return values are described
- [ ] Custom hooks have usage examples

---

## Tools & Resources

### IDE Support

- **VS Code**: Built-in TSDoc support with IntelliSense
- **WebStorm**: TSDoc support with quick documentation
- **Cursor**: AI-assisted documentation generation

### Documentation Generators

- **TypeDoc**: Generate HTML docs from TSDoc comments
- **Storybook**: Interactive component documentation
- **Docusaurus**: Full documentation sites

### Linting

Add ESLint rules to enforce documentation:

```json
{
  "rules": {
    "jsdoc/require-jsdoc": "warn",
    "jsdoc/require-param": "warn",
    "jsdoc/require-returns": "warn"
  }
}
```

---

## Migration Guide

To document an existing undocumented component:

1. **Start with the component description**: What does it do?
2. **Document props interface**: Add description to each prop
3. **Add usage example**: Show simplest usage
4. **Document complex props**: Explain non-obvious props
5. **Add advanced examples**: Show edge cases or advanced usage
6. **Cross-reference**: Link related components
7. **Review**: Read docs from user perspective

### Example Migration

**Before:**
```typescript
export function AgentCard({ agent, onRun, onEdit }) {
  return <div>...</div>;
}
```

**After:**
```typescript
/**
 * AgentCard displays agent summary with quick actions.
 *
 * @component
 * @example
 * ```tsx
 * <AgentCard agent={myAgent} onRun={handleRun} />
 * ```
 */
export function AgentCard({
  agent,
  onRun,
  onEdit,
}: AgentCardProps) {
  return <div>...</div>;
}

export interface AgentCardProps {
  /** Agent to display */
  agent: Agent;
  /** Run callback */
  onRun?: (id: string) => void;
  /** Edit callback */
  onEdit?: (id: string) => void;
}
```

---

**Last Updated**: 2026-01-12
**Version**: 1.0.0
