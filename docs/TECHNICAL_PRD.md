# GWI Agent Framework - Technical & Product Requirements Document

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Production Ready

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [User Personas](#3-user-personas)
4. [Platform Architecture](#4-platform-architecture)
5. [Feature Specifications](#5-feature-specifications)
6. [Data Models](#6-data-models)
7. [API Specifications](#7-api-specifications)
8. [UI/UX Requirements](#8-uiux-requirements)
9. [Security & Compliance](#9-security--compliance)
10. [Integration Requirements](#10-integration-requirements)
11. [Performance Requirements](#11-performance-requirements)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)

---

## 1. Executive Summary

### 1.1 Product Overview

The GWI Agent Framework is an enterprise SaaS platform that transforms consumer research data into actionable insights through AI-powered agents. The platform enables research teams to automate complex analytical workflows, generate verified reports, and collaborate on multi-agent research projects.

### 1.2 Core Value Proposition

- **Automated Research Workflows**: Multi-step agent pipelines that execute complex research tasks autonomously
- **Verified Insights**: Every output includes citations, confidence scores, and data provenance
- **Enterprise Collaboration**: Team workspaces, shared projects, and role-based access control
- **Extensible Agent System**: Pre-built domain agents plus custom agent creation capabilities

### 1.3 Key Metrics

| Metric | Target |
|--------|--------|
| Query Response Time | < 3 seconds (p95) |
| Agent Task Completion | < 30 seconds |
| Report Generation | < 2 minutes |
| Platform Uptime | 99.9% |
| Citation Accuracy | > 95% |

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

To become the definitive AI-powered research intelligence platform that enables enterprises to extract, verify, and act on consumer insights at unprecedented speed and scale.

### 2.2 Strategic Goals

1. **Democratize Research Access**: Enable non-technical users to perform sophisticated research queries
2. **Ensure Trust Through Verification**: Every insight must be traceable to source data
3. **Enable Collaboration at Scale**: Support enterprise teams with hundreds of concurrent users
4. **Build an Agent Ecosystem**: Foster community-driven agent development through marketplace

### 2.3 Success Criteria

- 80% reduction in time-to-insight for standard research queries
- 90% user satisfaction score for report quality
- 50% of workflows automated within 6 months of adoption
- Active agent marketplace with 100+ community agents by EOY

---

## 3. User Personas

### 3.1 Primary Personas

#### Research Analyst (Sarah)
- **Role**: Senior Consumer Insights Analyst
- **Goals**: Generate audience profiles, track trends, create client deliverables
- **Pain Points**: Manual data compilation, inconsistent methodologies, time-consuming report formatting
- **Key Features**: Playground, Pre-built Agents, Report Builder, Templates

#### Insights Manager (Michael)
- **Role**: Head of Consumer Insights
- **Goals**: Oversee team output, ensure quality standards, manage client relationships
- **Pain Points**: Limited visibility into team work, inconsistent deliverable quality, resource allocation
- **Key Features**: Dashboard, Team Analytics, Workflow Approval, Project Management

#### Data Engineer (Priya)
- **Role**: Research Technology Lead
- **Goals**: Build custom integrations, create specialized agents, maintain data pipelines
- **Pain Points**: Limited API flexibility, lack of customization options, vendor lock-in
- **Key Features**: Agent Builder, API Access, Custom Integrations, Developer Tools

### 3.2 Secondary Personas

#### Marketing Strategist (External Client)
- **Role**: Brand Marketing Director
- **Goals**: Receive actionable audience insights, understand consumer behavior
- **Needs**: Clear visualizations, exportable reports, presentation-ready content

#### Platform Administrator
- **Role**: IT/Security Administrator
- **Goals**: Manage access, ensure compliance, monitor usage
- **Needs**: SSO configuration, audit logs, usage dashboards, security controls

---

## 4. Platform Architecture

### 4.1 High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Web App   │  │  Mobile App │  │   API/SDK   │              │
│  │  (Next.js)  │  │   (Future)  │  │  (REST/WS)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Authentication │ Rate Limiting │ Request Routing       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Agent     │  │   Workflow   │  │    Report    │          │
│  │   Service    │  │    Engine    │  │   Generator  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Memory     │  │  Verification│  │  Integration │          │
│  │   Service    │  │    Engine    │  │    Hub       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │   Pinecone   │          │
│  │  (Primary)   │  │   (Cache)    │  │  (Vectors)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     S3       │  │  ClickHouse  │  │  GWI Data    │          │
│  │  (Storage)   │  │ (Analytics)  │  │    Lake      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   OpenAI     │  │   Anthropic  │  │    Custom    │          │
│  │   GPT-4      │  │    Claude    │  │    Models    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### 4.2 Technology Stack

#### Frontend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 15 (App Router) | Server components, streaming, edge runtime |
| Styling | Tailwind CSS v4 | Utility-first, design tokens, dark mode |
| Components | shadcn/ui + Radix | Accessible, customizable, consistent |
| State | React Context + SWR | Server state sync, real-time updates |
| Charts | Recharts | Declarative, responsive, customizable |
| Forms | React Hook Form + Zod | Type-safe validation, performance |

#### Backend
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Node.js 20 LTS | Performance, ecosystem, TypeScript |
| API | Next.js Route Handlers | Unified codebase, edge deployment |
| AI SDK | Vercel AI SDK | Streaming, multi-provider, type-safe |
| Queue | Vercel Queues / BullMQ | Async job processing, retries |
| Real-time | WebSockets / SSE | Live updates, streaming responses |

#### Data Storage
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Primary DB | PostgreSQL (Neon/Supabase) | ACID, JSON support, full-text search |
| Cache | Redis (Upstash) | Session storage, rate limiting, pub/sub |
| Vector DB | Pinecone | Semantic search, embeddings storage |
| Object Store | Vercel Blob / S3 | Reports, exports, media files |
| Analytics | ClickHouse | Time-series, aggregations, high volume |

#### Infrastructure
| Component | Technology | Rationale |
|-----------|------------|-----------|
| Hosting | Vercel | Edge network, auto-scaling, DX |
| CDN | Vercel Edge Network | Global distribution, caching |
| Monitoring | Vercel Analytics + Sentry | Performance, errors, traces |
| Auth | NextAuth.js / Clerk | SSO, RBAC, enterprise features |

### 4.3 Service Architecture

#### Agent Service
Responsible for executing AI agents with access to data sources, memory, and tools.

\`\`\`typescript
interface AgentService {
  // Execute a single agent query
  execute(params: AgentExecuteParams): AsyncGenerator<AgentChunk>;
  
  // Spawn sub-agents for complex tasks
  spawn(parentId: string, config: SubAgentConfig): Promise<AgentInstance>;
  
  // Manage agent lifecycle
  pause(agentId: string): Promise<void>;
  resume(agentId: string): Promise<void>;
  terminate(agentId: string): Promise<void>;
}
\`\`\`

#### Workflow Engine
Orchestrates multi-step agent pipelines with conditional logic and human-in-the-loop.

\`\`\`typescript
interface WorkflowEngine {
  // Create and execute workflows
  create(definition: WorkflowDefinition): Promise<Workflow>;
  execute(workflowId: string, inputs: Record<string, any>): Promise<WorkflowRun>;
  
  // Step management
  approveStep(runId: string, stepId: string): Promise<void>;
  rejectStep(runId: string, stepId: string, reason: string): Promise<void>;
  
  // Monitoring
  getStatus(runId: string): Promise<WorkflowStatus>;
  getLogs(runId: string): AsyncGenerator<LogEntry>;
}
\`\`\`

#### Memory Service
Persists context across sessions with semantic retrieval capabilities.

\`\`\`typescript
interface MemoryService {
  // Store memories
  store(params: StoreMemoryParams): Promise<Memory>;
  
  // Retrieve relevant memories
  recall(query: string, filters?: MemoryFilters): Promise<Memory[]>;
  
  // Memory management
  forget(memoryId: string): Promise<void>;
  summarize(sessionId: string): Promise<MemorySummary>;
}
\`\`\`

---

## 5. Feature Specifications

### 5.1 Dashboard

#### Overview
The central command center providing real-time visibility into platform activity, agent performance, and key metrics.

#### Components

**Hero Metrics (4 cards)**
| Metric | Description | Visualization |
|--------|-------------|---------------|
| Total Queries | Queries processed in period | Number + sparkline + trend |
| Active Workflows | Currently running workflows | Number + sparkline + trend |
| Reports Generated | Completed reports | Number + sparkline + trend |
| Avg Response Time | Query latency | Duration + sparkline + trend |

**Performance Charts**
- Query Volume: Area chart showing queries over time (hourly/daily/weekly)
- Agent Usage: Horizontal bar chart showing usage by agent type

**Live Activity Feed**
- Real-time stream of platform events
- Clickable items linking to relevant resources
- Status indicators (running, completed, failed)
- Progress bars for in-progress items

**Agent Orchestrator**
- Grid of active agents with status
- Load indicators (percentage)
- Quick-run action buttons
- Status badges (active, idle, paused)

**Insights Panel**
- AI-generated insights from recent data
- Confidence scores (High/Medium/Low)
- "New" badges for fresh insights
- Click-through to detailed reports

#### User Actions
- Filter by time range (24h, 7d, 30d, 90d, Custom)
- Refresh data manually
- Navigate to detailed views from any component
- Quick-start new workflows/queries

---

### 5.2 Agent Playground

#### Overview
Interactive environment for testing and running AI agents with real-time streaming responses.

#### Components

**Chat Interface**
- Message list with user/assistant distinction
- Streaming text display with typing indicator
- Citation badges linking to sources
- Message actions (copy, feedback, regenerate)
- Sub-agent status indicators during complex tasks

**Configuration Sidebar**
- Agent selector (dropdown with descriptions)
- Data source multi-select (checkboxes)
- Model settings:
  - Temperature slider (0.0 - 1.0)
  - Max tokens input
  - Output format selector (paragraph, bullets, structured)
- Memory toggle (enable/disable context persistence)
- Citation toggle (enable/disable source display)

**Session Management**
- Conversation history list
- Save session functionality
- Load previous sessions
- Clear conversation
- Export options (JSON, Markdown, Text)

**Header Actions**
- Share session (generate link)
- Save to project
- Export conversation
- Settings access

#### Agent Types

| Agent | Description | Capabilities |
|-------|-------------|--------------|
| Audience Profiler | Build demographic profiles | Segment analysis, persona generation |
| Trend Analyst | Track consumer trends | Time-series analysis, forecasting |
| Creative Brief Builder | Generate briefs | Template filling, copy suggestions |
| Competitive Intel | Analyze competitors | Brand comparison, positioning |
| Survey Designer | Create questionnaires | Question generation, methodology |
| Data Explorer | Query raw data | SQL generation, visualization |

#### Streaming Response Format
\`\`\`typescript
interface StreamChunk {
  type: 'text' | 'citation' | 'sub-agent' | 'tool-call' | 'error';
  content: string;
  metadata?: {
    citations?: Citation[];
    subAgent?: SubAgentStatus;
    toolCall?: ToolCallInfo;
  };
}
\`\`\`

---

### 5.3 Workflow Builder

#### Overview
Visual interface for creating multi-step agent pipelines with drag-and-drop functionality.

#### Components

**Workflow Canvas**
- Drag-and-drop node placement
- Connection lines between nodes
- Zoom and pan controls
- Mini-map for large workflows
- Grid snap alignment

**Node Types**

| Node Type | Icon | Description |
|-----------|------|-------------|
| Agent | Bot | Execute an AI agent |
| Condition | GitBranch | Branch based on criteria |
| Human Review | User | Pause for approval |
| Data Input | Database | Load external data |
| Transform | Shuffle | Modify data format |
| Output | FileOutput | Export results |
| Notification | Bell | Send alerts |

**Node Configuration Panel**
- Appears on node selection
- Agent-specific settings
- Input/output mapping
- Condition logic builder
- Timeout and retry settings

**Workflow Properties**
- Name and description
- Schedule (manual, cron, trigger)
- Notification settings
- Access permissions
- Version history

#### Workflow Definition Schema
\`\`\`typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggers: WorkflowTrigger[];
  settings: WorkflowSettings;
}

interface WorkflowNode {
  id: string;
  type: 'agent' | 'condition' | 'human' | 'input' | 'transform' | 'output' | 'notification';
  position: { x: number; y: number };
  config: NodeConfig;
  inputs: string[];
  outputs: string[];
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}
\`\`\`

---

### 5.4 Agent Library & Store

#### Overview
Catalog of pre-built and community agents with detailed documentation and usage analytics.

#### Components

**Agent Grid**
- Card-based layout with agent icons
- Rating (5-star) and usage count
- Category badges
- Quick-run button
- Favorite toggle

**Filters & Search**
- Text search (name, description, capabilities)
- Category filter (Research, Creative, Analysis, etc.)
- Rating filter (4+, 3+, etc.)
- Source filter (Official, Community, Custom)
- Sort options (Popular, Recent, Rating)

**Agent Detail Page**
- Hero section with icon, name, description
- Capabilities list
- Data source requirements
- Example prompts (clickable to playground)
- API reference
- Reviews and ratings
- Version history
- Related agents

**Agent Builder (Custom)**
- Step-by-step wizard:
  1. Basic info (name, description, icon)
  2. System prompt editor
  3. Data source configuration
  4. Tool/capability selection
  5. Output format settings
  6. Testing interface
  7. Publishing options

#### Agent Schema
\`\`\`typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  icon: string;
  category: AgentCategory;
  capabilities: string[];
  dataSources: DataSource[];
  systemPrompt: string;
  outputFormats: OutputFormat[];
  tools: Tool[];
  rating: number;
  usageCount: number;
  author: User;
  version: string;
  isOfficial: boolean;
  isPublic: boolean;
  pricing: 'free' | 'premium' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

---

### 5.5 Reports & Outputs

#### Overview
Repository of generated reports with viewing, editing, and export capabilities.

#### Components

**Reports Grid**
- Card layout with thumbnails
- Type badges (Presentation, Dashboard, Document)
- Status indicators (Draft, Final, Archived)
- Date and author info
- Quick actions (view, edit, share, delete)

**Report Viewer**
- Slide/page navigation
- Full-screen mode
- Zoom controls
- Citation sidebar
- Comments/annotations
- Version comparison

**Report Builder**
- Template selection
- Section management (add, remove, reorder)
- Content editor (rich text)
- Chart insertion
- Data binding from agents
- Brand/style customization
- Collaboration (real-time editing)

**Export Options**
- PowerPoint (.pptx)
- PDF
- Google Slides
- Word (.docx)
- HTML
- Markdown

#### Report Schema
\`\`\`typescript
interface Report {
  id: string;
  name: string;
  description: string;
  type: 'presentation' | 'dashboard' | 'document' | 'export';
  status: 'draft' | 'review' | 'final' | 'archived';
  template: ReportTemplate;
  sections: ReportSection[];
  citations: Citation[];
  metadata: {
    project: Project;
    workflow?: Workflow;
    agents: Agent[];
    dataSources: DataSource[];
  };
  collaborators: User[];
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
\`\`\`

---

### 5.6 Memory & Context Management

#### Overview
Interface for viewing, managing, and configuring persistent memory across agent sessions.

#### Components

**Memory Stats**
- Total memories stored
- Memory by type (facts, preferences, insights)
- Storage usage
- Recall accuracy metrics

**Memory Browser**
- Searchable list of stored memories
- Type filters (fact, preference, insight, context)
- Source indicators (which agent/session)
- Confidence scores
- Actions (view, edit, delete, pin)

**Memory Timeline**
- Chronological view of memory additions
- Session grouping
- Relationship visualization

**Memory Settings**
- Retention policies
- Auto-summarization rules
- Privacy controls
- Export/import

#### Memory Schema
\`\`\`typescript
interface Memory {
  id: string;
  type: 'fact' | 'preference' | 'insight' | 'context';
  content: string;
  embedding: number[];
  confidence: number;
  source: {
    agentId: string;
    sessionId: string;
    timestamp: Date;
  };
  metadata: Record<string, any>;
  expiresAt?: Date;
  isPinned: boolean;
}
\`\`\`

---

### 5.7 Projects

#### Overview
Organizational structure for grouping related workflows, reports, and team collaboration.

#### Components

**Project List**
- Grid/list toggle view
- Status badges (Active, On Hold, Completed)
- Progress indicators
- Team member avatars
- Last activity timestamp

**Project Detail**
- Header with name, description, status
- Tab navigation:
  - Overview (stats, timeline, activity)
  - Workflows (associated workflows)
  - Reports (generated outputs)
  - Agents (configured agents)
  - Team (members, permissions)
  - Settings (project config)

**Project Creation**
- Name and description
- Template selection (optional)
- Team member invitation
- Initial workflow setup
- Data source configuration

#### Project Schema
\`\`\`typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  color: string;
  icon: string;
  team: ProjectMember[];
  workflows: Workflow[];
  reports: Report[];
  agents: Agent[];
  settings: ProjectSettings;
  metadata: {
    client?: string;
    deadline?: Date;
    budget?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

---

### 5.8 Integrations Hub

#### Overview
Centralized management of external service connections and data source configurations.

#### Integration Categories

**Productivity**
| Integration | Features |
|-------------|----------|
| Google Workspace | Docs, Slides, Sheets export; Drive storage |
| Microsoft 365 | Word, PowerPoint, Excel export; OneDrive |
| Slack | Notifications, report sharing, bot commands |
| Notion | Page export, database sync |

**Data Visualization**
| Integration | Features |
|-------------|----------|
| Tableau | Dashboard embedding, data push |
| Power BI | Report export, dataset sync |
| Looker | Dashboard integration |

**Advertising Platforms**
| Integration | Features |
|-------------|----------|
| Meta Ads | Audience sync, performance data |
| Google Ads | Audience creation, reporting |
| DV360 | Segment activation |
| The Trade Desk | Audience push |

**CRM & Marketing**
| Integration | Features |
|-------------|----------|
| Salesforce | Contact sync, report attachment |
| HubSpot | List sync, workflow triggers |
| Marketo | Audience segments |

#### Integration Schema
\`\`\`typescript
interface Integration {
  id: string;
  name: string;
  provider: string;
  category: IntegrationCategory;
  status: 'connected' | 'disconnected' | 'error';
  config: IntegrationConfig;
  credentials: EncryptedCredentials;
  permissions: string[];
  lastSync?: Date;
  syncStatus?: 'syncing' | 'synced' | 'failed';
  metadata: Record<string, any>;
}
\`\`\`

---

### 5.9 Settings & Administration

#### Setting Sections

**General**
- Organization name and logo
- Default timezone
- Date/number formats
- Language preferences

**Profile**
- User name and avatar
- Email and contact info
- Notification preferences
- Theme selection

**Team Management**
- Member list with roles
- Invitation system
- Role management (Admin, Editor, Viewer)
- Activity audit log

**Billing**
- Current plan display
- Usage metrics
- Payment method
- Invoice history
- Plan upgrade/downgrade

**Security**
- Password management
- Two-factor authentication
- Active sessions
- API key management
- SSO configuration (Enterprise)

**Notifications**
- Email notification preferences
- In-app notification settings
- Slack integration settings
- Digest frequency

**API Keys**
- Key generation
- Permission scoping
- Usage tracking
- Rate limit display
- Key rotation

**Appearance**
- Theme selection (Light/Dark/System)
- Accent color customization
- Density settings (Compact/Default/Comfortable)

---

### 5.10 Analytics & Insights

#### Overview
Platform-wide analytics for understanding usage patterns, performance, and ROI.

#### Components

**Overview Metrics**
- Total queries, workflows, reports
- Active users (daily/weekly/monthly)
- Average response times
- Cost per query

**Usage Charts**
- Query volume over time
- Agent utilization breakdown
- Peak usage hours
- Feature adoption funnel

**Agent Performance**
- Response time by agent
- User satisfaction ratings
- Error rates
- Citation accuracy

**Top Queries**
- Most common query patterns
- Query success rates
- Average tokens used
- Cost analysis

**Team Activity**
- Per-user activity metrics
- Collaboration patterns
- Report contribution
- Workflow ownership

---

## 6. Data Models

### 6.1 Core Entities

\`\`\`sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'member',
  organization_id UUID REFERENCES organizations(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  plan VARCHAR(50) DEFAULT 'starter',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  color VARCHAR(7),
  icon VARCHAR(50),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  system_prompt TEXT NOT NULL,
  capabilities TEXT[],
  data_sources TEXT[],
  settings JSONB DEFAULT '{}',
  is_official BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES users(id),
  rating DECIMAL(2,1) DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  definition JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  schedule VARCHAR(100),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Runs
CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  status VARCHAR(50) DEFAULT 'pending',
  inputs JSONB,
  outputs JSONB,
  logs JSONB[],
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (Playground)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  agent_id UUID REFERENCES agents(id),
  name VARCHAR(255),
  messages JSONB[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  confidence DECIMAL(3,2),
  source_session_id UUID REFERENCES sessions(id),
  source_agent_id UUID REFERENCES agents(id),
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  template_id UUID,
  content JSONB NOT NULL,
  citations JSONB[],
  thumbnail_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  provider VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'disconnected',
  credentials_encrypted TEXT,
  config JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### 6.2 Indexes

\`\`\`sql
-- Performance indexes
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_workflows_project ON workflows(project_id);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_memories_user_project ON memories(user_id, project_id);
CREATE INDEX idx_reports_project ON reports(project_id);
CREATE INDEX idx_audit_logs_org_created ON audit_logs(organization_id, created_at DESC);

-- Vector similarity search
CREATE INDEX idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops);

-- Full-text search
CREATE INDEX idx_agents_search ON agents USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_reports_search ON reports USING gin(to_tsvector('english', name || ' ' || description));
\`\`\`

---

## 7. API Specifications

### 7.1 REST API Endpoints

#### Authentication
\`\`\`
POST   /api/auth/login          # Email/password login
POST   /api/auth/register       # New user registration
POST   /api/auth/logout         # End session
POST   /api/auth/refresh        # Refresh access token
GET    /api/auth/me             # Current user info
\`\`\`

#### Agents
\`\`\`
GET    /api/agents              # List agents (with filters)
GET    /api/agents/:id          # Get agent details
POST   /api/agents              # Create custom agent
PUT    /api/agents/:id          # Update agent
DELETE /api/agents/:id          # Delete agent
POST   /api/agents/:id/execute  # Execute agent (streaming)
POST   /api/agents/:id/rate     # Rate agent
\`\`\`

#### Workflows
\`\`\`
GET    /api/workflows           # List workflows
GET    /api/workflows/:id       # Get workflow details
POST   /api/workflows           # Create workflow
PUT    /api/workflows/:id       # Update workflow
DELETE /api/workflows/:id       # Delete workflow
POST   /api/workflows/:id/run   # Execute workflow
GET    /api/workflows/:id/runs  # Get run history
GET    /api/workflow-runs/:id   # Get run details
POST   /api/workflow-runs/:id/approve  # Approve step
POST   /api/workflow-runs/:id/reject   # Reject step
\`\`\`

#### Sessions (Playground)
\`\`\`
GET    /api/sessions            # List sessions
GET    /api/sessions/:id        # Get session
POST   /api/sessions            # Create session
PUT    /api/sessions/:id        # Update session
DELETE /api/sessions/:id        # Delete session
POST   /api/sessions/:id/message  # Send message (streaming)
\`\`\`

#### Projects
\`\`\`
GET    /api/projects            # List projects
GET    /api/projects/:id        # Get project details
POST   /api/projects            # Create project
PUT    /api/projects/:id        # Update project
DELETE /api/projects/:id        # Delete project
GET    /api/projects/:id/members  # List members
POST   /api/projects/:id/members  # Add member
DELETE /api/projects/:id/members/:userId  # Remove member
\`\`\`

#### Reports
\`\`\`
GET    /api/reports             # List reports
GET    /api/reports/:id         # Get report
POST   /api/reports             # Create report
PUT    /api/reports/:id         # Update report
DELETE /api/reports/:id         # Delete report
POST   /api/reports/:id/export  # Export report
POST   /api/reports/:id/share   # Share report
\`\`\`

#### Memory
\`\`\`
GET    /api/memory              # List memories
POST   /api/memory              # Store memory
DELETE /api/memory/:id          # Delete memory
POST   /api/memory/recall       # Semantic search
POST   /api/memory/summarize    # Summarize session
\`\`\`

### 7.2 WebSocket Events

\`\`\`typescript
// Client -> Server
interface ClientEvents {
  'session:join': { sessionId: string };
  'session:leave': { sessionId: string };
  'message:send': { sessionId: string; content: string };
  'workflow:subscribe': { workflowRunId: string };
}

// Server -> Client
interface ServerEvents {
  'message:chunk': { sessionId: string; chunk: StreamChunk };
  'message:complete': { sessionId: string; messageId: string };
  'workflow:update': { runId: string; status: WorkflowStatus };
  'agent:status': { agentId: string; status: AgentStatus };
  'notification': { type: string; data: any };
}
\`\`\`

### 7.3 Response Formats

\`\`\`typescript
// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Error response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Streaming response (SSE)
interface StreamEvent {
  event: 'chunk' | 'citation' | 'tool' | 'error' | 'done';
  data: string; // JSON stringified
}
\`\`\`

---

## 8. UI/UX Requirements

### 8.1 Design System

#### Color Palette
\`\`\`css
/* Primary - Teal/Cyan accent */
--primary: 180 100% 50%;
--primary-foreground: 0 0% 100%;

/* Background - Dark theme */
--background: 240 10% 4%;
--foreground: 0 0% 98%;

/* Cards and surfaces */
--card: 240 10% 6%;
--card-foreground: 0 0% 98%;

/* Muted elements */
--muted: 240 5% 15%;
--muted-foreground: 240 5% 65%;

/* Borders */
--border: 240 5% 15%;

/* Accent for highlights */
--accent: 180 100% 50%;
--accent-foreground: 0 0% 100%;

/* Status colors */
--success: 142 76% 36%;
--warning: 38 92% 50%;
--error: 0 84% 60%;
--info: 199 89% 48%;
\`\`\`

#### Typography
\`\`\`css
/* Font families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
\`\`\`

#### Spacing Scale
\`\`\`css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
\`\`\`

### 8.2 Component Library

| Component | Variants | States |
|-----------|----------|--------|
| Button | Primary, Secondary, Ghost, Destructive | Default, Hover, Active, Disabled, Loading |
| Input | Default, With icon, With addon | Default, Focus, Error, Disabled |
| Card | Default, Interactive, Highlighted | Default, Hover, Selected |
| Badge | Default, Outline, Success, Warning, Error | - |
| Avatar | Image, Initials, Icon | Default, With status |
| Dropdown | Default, With search, Multi-select | Open, Closed |
| Dialog | Default, Alert, Form | Open, Closed |
| Tabs | Default, Pills, Underline | Active, Inactive |
| Table | Default, Sortable, Selectable | Loading, Empty |
| Chart | Line, Area, Bar, Pie, Donut | Loading, Empty, Error |

### 8.3 Responsive Breakpoints

\`\`\`css
/* Mobile first approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
\`\`\`

### 8.4 Animation Guidelines

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions | 150ms | ease-out |
| Transitions | 200ms | ease-in-out |
| Page transitions | 300ms | ease-in-out |
| Loading states | 1000ms | linear (loop) |

### 8.5 Accessibility Requirements

- WCAG 2.1 AA compliance minimum
- Keyboard navigation for all interactive elements
- Screen reader support with ARIA labels
- Color contrast ratio minimum 4.5:1 for text
- Focus indicators visible and consistent
- Skip navigation links
- Semantic HTML structure
- Alt text for all meaningful images

---

## 9. Security & Compliance

### 9.1 Authentication & Authorization

#### Authentication Methods
- Email/password with bcrypt hashing
- OAuth 2.0 (Google, Microsoft, GitHub)
- SAML 2.0 SSO (Enterprise)
- Magic link authentication
- Two-factor authentication (TOTP)

#### Session Management
- JWT access tokens (15 min expiry)
- Refresh tokens (7 day expiry, rotation)
- Secure, httpOnly cookies
- Session invalidation on password change

#### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| Owner | Full access, billing, delete org |
| Admin | Manage users, settings, all features |
| Editor | Create/edit projects, workflows, reports |
| Viewer | Read-only access to assigned projects |

### 9.2 Data Protection

#### Encryption
- TLS 1.3 for data in transit
- AES-256 for data at rest
- Field-level encryption for sensitive data (API keys, credentials)
- Encrypted backups

#### Data Residency
- Region selection for data storage (US, EU, APAC)
- No cross-region data transfer without consent
- Data processing agreements available

### 9.3 Compliance

| Standard | Status | Notes |
|----------|--------|-------|
| SOC 2 Type II | Required | Annual audit |
| GDPR | Required | EU data protection |
| CCPA | Required | California privacy |
| HIPAA | Optional | Healthcare customers |
| ISO 27001 | Planned | Information security |

### 9.4 Audit Logging

All actions logged with:
- Timestamp
- User ID
- IP address
- User agent
- Action type
- Resource affected
- Before/after state (for mutations)

Retention: 90 days (standard), 1 year (enterprise)

---

## 10. Integration Requirements

### 10.1 Data Sources

#### GWI Core Data
- Survey data (demographics, attitudes, behaviors)
- Brand perception data
- Media consumption data
- Custom research data

#### External Data (Optional)
- Social listening (Brandwatch, Sprinklr)
- Web analytics (Google Analytics, Adobe)
- CRM data (Salesforce, HubSpot)
- First-party data (CSV, API)

### 10.2 Output Destinations

#### File Exports
- PowerPoint (.pptx)
- PDF
- Excel (.xlsx)
- CSV
- JSON

#### Cloud Storage
- Google Drive
- OneDrive
- Dropbox
- S3/GCS

#### Visualization Tools
- Tableau Server
- Power BI Service
- Looker

#### Advertising Platforms
- Meta Business Suite
- Google Ads
- DV360
- The Trade Desk

### 10.3 Webhook Events

\`\`\`typescript
// Outbound webhooks
type WebhookEvent = 
  | 'workflow.completed'
  | 'workflow.failed'
  | 'report.published'
  | 'agent.executed'
  | 'memory.created'
  | 'project.updated';

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
  signature: string; // HMAC-SHA256
}
\`\`\`

---

## 11. Performance Requirements

### 11.1 Response Time SLAs

| Operation | Target (p50) | Target (p95) | Max |
|-----------|--------------|--------------|-----|
| Page load | 500ms | 1s | 3s |
| API response | 100ms | 300ms | 1s |
| Agent query | 1s | 3s | 10s |
| Report generation | 5s | 30s | 2min |
| File export | 2s | 10s | 1min |

### 11.2 Throughput Requirements

| Metric | Minimum | Target |
|--------|---------|--------|
| Concurrent users | 1,000 | 10,000 |
| Queries per second | 100 | 1,000 |
| Workflow runs per hour | 500 | 5,000 |

### 11.3 Availability

- Target uptime: 99.9% (43.8 min downtime/month)
- Planned maintenance: Off-peak hours with 72h notice
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 5 minutes

### 11.4 Scalability

- Horizontal scaling for API servers
- Auto-scaling based on CPU/memory thresholds
- Database read replicas for query distribution
- CDN for static assets and API caching
- Queue-based processing for heavy workloads

---

## 12. Deployment & Infrastructure

### 12.1 Environment Structure

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Feature development | dev.gwi-agents.internal |
| Staging | Pre-production testing | staging.gwi-agents.com |
| Production | Live users | app.gwi-agents.com |

### 12.2 CI/CD Pipeline

\`\`\`yaml
# Simplified pipeline stages
stages:
  - lint        # ESLint, Prettier, TypeScript
  - test        # Unit tests, integration tests
  - build       # Next.js build
  - deploy-preview  # Vercel preview deployment
  - e2e-test    # Playwright E2E tests
  - deploy-prod # Production deployment (manual gate)
\`\`\`

### 12.3 Monitoring & Alerting

#### Metrics to Monitor
- Request latency (p50, p95, p99)
- Error rates (4xx, 5xx)
- CPU and memory utilization
- Database connection pool
- Queue depth and processing time
- AI API latency and costs

#### Alerting Thresholds
| Metric | Warning | Critical |
|--------|---------|----------|
| Error rate | > 1% | > 5% |
| P95 latency | > 2s | > 5s |
| CPU usage | > 70% | > 90% |
| Memory usage | > 75% | > 90% |
| Queue depth | > 1000 | > 5000 |

### 12.4 Disaster Recovery

- Multi-region database replication
- Automated daily backups (30-day retention)
- Point-in-time recovery capability
- Documented runbooks for common incidents
- Quarterly DR drills

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Agent | An AI-powered assistant configured for specific research tasks |
| Workflow | A multi-step pipeline of agents and actions |
| Memory | Persistent context stored across sessions |
| Citation | Reference to source data supporting an insight |
| Playground | Interactive environment for testing agents |

## Appendix B: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2024 | GWI Team | Initial release |

---

*This document is confidential and intended for internal use only.*
