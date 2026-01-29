# Documentation Index

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Complete

---

## Overview

This index provides a comprehensive guide to all documentation for the GWI AI Agent Framework. Documentation is organized by category and covers architecture, development, testing, security, and operations.

---

## Quick Start

**New Engineers:**
1. [Development Setup](./development/DEVELOPMENT_SETUP.md)
2. [System Overview](./architecture/SYSTEM_OVERVIEW.md)
3. [Code Standards](./development/CODE_STANDARDS.md)
4. [Development Workflow](./development/DEVELOPMENT_WORKFLOW.md)

**Product Teams:**
1. [Platform PRD](../PLATFORM_PRD.md)
2. [Technical PRD](./TECHNICAL_PRD.md)
3. [Core Features](./features/CORE_FEATURES.md)
4. [API Overview](./api/API_OVERVIEW.md)

---

## Architecture Documentation

### System Architecture

- **[System Overview](./architecture/SYSTEM_OVERVIEW.md)** - Platform purpose, three-portal architecture, tech stack
- **[Application Architecture](./architecture/APPLICATION_ARCHITECTURE.md)** - Next.js structure, API organization, middleware
- **[Database Architecture](./architecture/DATABASE_ARCHITECTURE.md)** - Prisma schema, relationships, multi-tenancy
- **[Authentication Architecture](./architecture/AUTHENTICATION_ARCHITECTURE.md)** - Three auth systems, RBAC, permissions

### Data Models

- **[Core Data Models](./data-models/CORE_DATA_MODELS.md)** - Organization, User, Agent, Workflow, Report, Dashboard, Memory
- **[Enterprise Data Models](./data-models/ENTERPRISE_DATA_MODELS.md)** - Hierarchy, SSO, Compliance, Billing, Entitlements
- **[GWI Data Models](./data-models/GWI_DATA_MODELS.md)** - Surveys, Taxonomy, Pipelines, LLM Configuration

---

## Development Documentation

### Setup & Workflow

- **[Development Setup](./development/DEVELOPMENT_SETUP.md)** - Prerequisites, environment setup, database setup, common issues
- **[Development Workflow](./development/DEVELOPMENT_WORKFLOW.md)** - Git workflow, branching, code review, testing, deployment
- **[Code Standards](./development/CODE_STANDARDS.md)** - TypeScript conventions, component patterns, API patterns, error handling
- **[Adding New Features](./development/ADDING_NEW_FEATURES.md)** - Feature checklist, schema changes, API creation, testing

### Components

- **[Component Architecture](./components/COMPONENT_ARCHITECTURE.md)** - Organization structure, patterns, conventions
- **[UI Components](./components/UI_COMPONENTS.md)** - shadcn/ui components, custom extensions, styling approach
- **[Feature Components](./components/FEATURE_COMPONENTS.md)** - Agents, workflows, reports, dashboards, playground

---

## API Documentation

- **[API Overview](./api/API_OVERVIEW.md)** - Versioning, authentication, rate limiting, error handling
- **[Public API (v1)](./api/API_V1.md)** - Endpoint catalog, schemas, examples, authentication
- **[Admin API](./api/ADMIN_API.md)** - Tenant management, user management, analytics, compliance
- **[GWI API](./api/GWI_API.md)** - Surveys, taxonomy, data pipelines, LLM configuration

---

## Features Documentation

- **[Core Features](./features/CORE_FEATURES.md)** - Agent System, Workflows, Reports, Dashboards, Playground, Memory
- **[Data Features](./features/DATA_FEATURES.md)** - Audiences, Crosstabs, Brand Tracking, Charts, Data Sources, Exports
- **[Collaboration Features](./features/COLLABORATION.md)** - Projects, Teams, Comments, Shared Links, Notifications, Saved Views

---

## Testing Documentation

- **[Testing Strategy](./testing/TESTING_STRATEGY.md)** - Unit, integration, E2E testing, coverage goals, patterns
- **[Test Structure](./testing/TEST_STRUCTURE.md)** - File organization, utilities, mocks, fixtures (to be created)

---

## Security Documentation

- **[Security Architecture](./security/SECURITY_ARCHITECTURE.md)** - Authentication, authorization, data isolation, API security, XSS/CSRF protection
- **[Compliance](./security/COMPLIANCE.md)** - GDPR, data retention, audit logging, security policies, incident response (to be created)

---

## Infrastructure Documentation

- **[Infrastructure Overview](./infrastructure/INFRASTRUCTURE_OVERVIEW.md)** - Hosting, database, cache, storage, CDN, monitoring
- **[Deployment](./infrastructure/DEPLOYMENT.md)** - Build process, environment config, migrations, monitoring, rollback
- **[Environment Variables](../ENVIRONMENT_VARIABLES.md)** - Required/optional variables, environment-specific configs, security

---

## Integration Documentation

- **[External Integrations](./integrations/EXTERNAL_INTEGRATIONS.md)** - GWI API, Stripe, Email, OAuth, Webhooks (to be created)
- **[Internal Integrations](./integrations/INTERNAL_INTEGRATIONS.md)** - Agent tools, Memory, Workflow steps, Report generation (to be created)

---

## Reference Documentation

### Product Requirements

- **[Platform PRD](../PLATFORM_PRD.md)** - Product overview, value proposition, features
- **[Technical PRD](./TECHNICAL_PRD.md)** - Technical requirements, architecture, specifications

### Guides

- **[CLAUDE.md](../CLAUDE.md)** - Critical context for AI assistants
- **[Render Deployment](./RENDER_DEPLOYMENT.md)** - Detailed Render deployment guide
- **[CI/CD Setup](./CI_CD_SETUP.md)** - GitHub Actions pipeline configuration

---

## Documentation by Role

### For Engineers

**Essential:**
1. [Development Setup](./development/DEVELOPMENT_SETUP.md)
2. [System Overview](./architecture/SYSTEM_OVERVIEW.md)
3. [Code Standards](./development/CODE_STANDARDS.md)
4. [Development Workflow](./development/DEVELOPMENT_WORKFLOW.md)
5. [Adding New Features](./development/ADDING_NEW_FEATURES.md)

**Reference:**
- [Component Architecture](./components/COMPONENT_ARCHITECTURE.md)
- [API Overview](./api/API_OVERVIEW.md)
- [Testing Strategy](./testing/TESTING_STRATEGY.md)
- [Security Architecture](./security/SECURITY_ARCHITECTURE.md)

### For Product Teams

**Essential:**
1. [Platform PRD](../PLATFORM_PRD.md)
2. [Core Features](./features/CORE_FEATURES.md)
3. [API Overview](./api/API_OVERVIEW.md)
4. [System Overview](./architecture/SYSTEM_OVERVIEW.md)

**Reference:**
- [Data Features](./features/DATA_FEATURES.md)
- [Collaboration Features](./features/COLLABORATION.md)
- [Technical PRD](./TECHNICAL_PRD.md)

### For DevOps/SRE

**Essential:**
1. [Infrastructure Overview](./infrastructure/INFRASTRUCTURE_OVERVIEW.md)
2. [Deployment](./infrastructure/DEPLOYMENT.md)
3. [Environment Variables](../ENVIRONMENT_VARIABLES.md)
4. [CI/CD Setup](./CI_CD_SETUP.md)

**Reference:**
- [Security Architecture](./security/SECURITY_ARCHITECTURE.md)
- [Render Deployment](./RENDER_DEPLOYMENT.md)

---

## Documentation Status

### ✅ Completed

- System Overview
- Application Architecture
- Database Architecture
- Authentication Architecture
- Core Data Models
- Enterprise Data Models
- GWI Data Models
- Development Setup
- Development Workflow
- Code Standards
- Adding New Features
- Component Architecture
- UI Components
- Feature Components
- API Overview
- Public API (v1)
- Admin API
- GWI API
- Core Features
- Data Features
- Collaboration Features
- Testing Strategy
- Security Architecture
- Infrastructure Overview
- Deployment

### 📝 To Be Created

- Test Structure
- Compliance
- External Integrations
- Internal Integrations

---

## Contributing to Documentation

### Documentation Standards

1. **Structure:** Use consistent headings and table of contents
2. **Examples:** Include code examples where applicable
3. **Links:** Cross-reference related documentation
4. **Updates:** Keep documentation current with code changes

### Updating Documentation

1. Update relevant documentation when making code changes
2. Add new documentation for new features
3. Review documentation during code review
4. Keep examples current and working

---

## Related Resources

- **Repository:** GitHub repository
- **Issue Tracker:** GitHub Issues
- **CI/CD:** GitHub Actions
- **Deployment:** Render Dashboard
- **Monitoring:** Sentry Dashboard

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
