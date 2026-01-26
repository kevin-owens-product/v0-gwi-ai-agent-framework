# ADR-001: GWI Team Portal Architecture

## Status
Accepted

## Date
2024-01-15

## Context
GWI needs an internal team portal separate from the customer-facing dashboard and platform admin portal. This portal will be used by data engineers, taxonomy managers, ML engineers, and GWI administrators to manage surveys, taxonomy, data pipelines, LLM configurations, and AI agents.

The existing platform has:
- **User Dashboard** (`/dashboard/*`) - End-user portal for customers
- **Admin Portal** (`/admin/*`) - Platform administration for managing tenants

We need to add:
- **GWI Team Portal** (`/gwi/*`) - Internal tools for GWI team members

## Decision
We will create a third portal at `/gwi/*` with its own authentication system separate from the admin portal.

### Key Decisions

1. **Separate Authentication**: GWI portal uses its own `gwiToken` cookie, distinct from `adminToken` (admin portal) and NextAuth sessions (user dashboard). This allows:
   - Independent session management
   - Different session timeouts
   - Clearer security boundaries

2. **Extended SuperAdmin Roles**: New roles added to the `SuperAdminRole` enum:
   - `GWI_ADMIN` - Full GWI portal access
   - `DATA_ENGINEER` - Pipeline and data source management
   - `TAXONOMY_MANAGER` - Survey and taxonomy management
   - `ML_ENGINEER` - LLM and agent configuration

3. **Permission-Based Access**: Role-based permissions for granular access control:
   - Permissions defined in `lib/gwi-permissions.ts`
   - Navigation visibility based on permissions
   - API endpoint protection using permission checks

4. **Unified Login Page**: Single login page at `/login` with tabs for:
   - Platform (NextAuth for customers)
   - Admin (SuperAdmin for platform admins)
   - GWI (SuperAdmin with GWI roles)

## Consequences

### Positive
- Clear separation of concerns between portals
- Fine-grained access control for different GWI team roles
- Independent session management reduces security surface area
- Shared authentication infrastructure (SuperAdmin model) reduces code duplication

### Negative
- Three separate authentication flows to maintain
- Users with multiple roles may need to log in separately
- Additional complexity in routing and middleware

### Risks
- Session confusion if users have access to multiple portals
- Potential for permission configuration drift

## Alternatives Considered

1. **Single Admin Portal with GWI Features**: Rejected because it would bloat the admin portal and make navigation confusing.

2. **Shared Session Between Admin and GWI**: Rejected because it would reduce flexibility in session management and complicate permission checks.

3. **Separate User Database for GWI**: Rejected because it would require duplicate user management and authentication code.

## Implementation Notes
- GWI layout at `app/gwi/(portal)/layout.tsx` handles authentication
- GWI API routes at `app/api/gwi/*` use `gwiToken` cookie
- Permission checks use `hasGWIPermission()` function
- Sidebar navigation adapts based on user role and permissions
