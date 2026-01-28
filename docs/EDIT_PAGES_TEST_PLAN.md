# Edit Pages Test Plan

This document outlines the test plan for validating all edit pages across the platform.

## Test Status Summary

### Unit Tests
- **Status**: ✅ Passing (5074/5076 tests)
- **Coverage**: API routes, components, hooks
- **Failures**: 2 unrelated failures (toast-utils, agent-grid)

### E2E Tests
- **Status**: ⏳ Partial coverage
- **Coverage**: Navigation, list pages, authentication
- **Missing**: Edit page form submission, save functionality

## Test Plan

### 1. Unit Tests for API Endpoints

#### Dashboard Edit Endpoints

**Agents** (`PATCH /api/v1/agents/[id]`)
- [x] Basic test structure exists
- [ ] Test successful update
- [ ] Test validation errors
- [ ] Test permission checks
- [ ] Test non-existent agent

**Workflows** (`PATCH /api/v1/workflows/[id]`)
- [x] Basic test structure exists
- [ ] Test successful update
- [ ] Test configuration updates
- [ ] Test schedule updates
- [ ] Test permission checks

**Audiences** (`PATCH /api/v1/audiences/[id]`)
- [x] Basic test structure exists
- [ ] Test criteria updates
- [ ] Test market updates
- [ ] Test validation

**Crosstabs** (`PATCH /api/v1/crosstabs/[id]`)
- [ ] Create test file
- [ ] Test successful update
- [ ] Test audience/metric updates
- [ ] Test filter updates

**Charts** (`PATCH /api/v1/charts/[id]`)
- [ ] Create test file
- [ ] Test chart configuration updates
- [ ] Test dimension/measure updates

**Dashboards** (`PATCH /api/v1/dashboards/[id]`)
- [ ] Create test file
- [ ] Test widget updates
- [ ] Test layout updates

**Brand Tracking** (`PUT /api/v1/brand-tracking/[id]`)
- [ ] Create test file
- [ ] Test brand configuration updates
- [ ] Test competitor updates
- [ ] Test metric configuration

**Reports** (`PATCH /api/v1/reports/[id]`)
- [ ] Create test file
- [ ] Test report content updates

#### Admin Edit Endpoints

**Broadcast Messages** (`PUT /api/admin/broadcast/messages/[id]`)
- [ ] Create test file
- [ ] Test message updates
- [ ] Test target configuration
- [ ] Test scheduling

**Roles** (`PUT /api/admin/roles/[id]`)
- [ ] Create test file
- [ ] Test permission updates
- [ ] Test role hierarchy

#### GWI Edit Endpoints

**Surveys Questions** (`PATCH /api/gwi/surveys/[id]/questions/[questionId]`)
- [ ] Create test file
- [ ] Test question updates

**Services Clients** (`PATCH /api/gwi/services/clients/[id]`)
- [ ] Create test file
- [ ] Test client updates

**Pipelines** (`PATCH /api/gwi/pipelines/[id]`)
- [ ] Create test file
- [ ] Test pipeline configuration updates

### 2. E2E Tests for Edit Pages

#### Dashboard Edit Pages

**Agents Edit Page**
```typescript
test('should save agent changes', async ({ page }) => {
  // Navigate to agent detail
  // Click edit
  // Modify fields
  // Click save
  // Verify redirect
  // Verify changes persisted
})
```

**Workflows Edit Page**
```typescript
test('should save workflow changes', async ({ page }) => {
  // Navigate to workflow detail
  // Click edit
  // Modify schedule
  // Click save
  // Verify changes
})
```

**Audiences Edit Page**
```typescript
test('should save audience changes', async ({ page }) => {
  // Navigate to audience detail
  // Click edit
  // Modify criteria
  // Add markets
  // Click save
  // Verify changes
})
```

**Crosstabs Edit Page**
```typescript
test('should save crosstab changes', async ({ page }) => {
  // Navigate to crosstab detail
  // Click edit
  // Modify audiences/metrics
  // Click save
  // Verify changes
})
```

**Charts Edit Page**
```typescript
test('should save chart changes', async ({ page }) => {
  // Navigate to chart detail
  // Click edit
  // Modify configuration
  // Click save
  // Verify changes
})
```

**Dashboards Edit Page**
```typescript
test('should save dashboard changes', async ({ page }) => {
  // Navigate to dashboard detail
  // Click edit
  // Modify widgets
  // Click save
  // Verify changes
})
```

**Brand Tracking Edit Page**
```typescript
test('should save brand tracking changes', async ({ page }) => {
  // Navigate to brand tracking detail
  // Click edit
  // Modify configuration
  // Click save
  // Verify changes
})
```

#### Admin Edit Pages

**Broadcast Messages Edit Page**
```typescript
test('should save broadcast message changes', async ({ page }) => {
  // Navigate to message detail
  // Click edit
  // Modify content
  // Click save
  // Verify changes
})
```

### 3. Integration Tests

**Test Scenarios**:
1. **Happy Path**: Edit and save successfully
2. **Validation**: Required fields, invalid data
3. **Permissions**: Unauthorized access, insufficient permissions
4. **Error Handling**: Network errors, server errors
5. **Unsaved Changes**: Warning when navigating away
6. **Concurrent Edits**: Multiple users editing same resource

### 4. Test Implementation Priority

**High Priority**:
1. E2E tests for Agents edit page
2. E2E tests for Workflows edit page
3. E2E tests for Audiences edit page
4. API unit tests for Crosstabs
5. API unit tests for Charts

**Medium Priority**:
1. E2E tests for remaining dashboard edit pages
2. API unit tests for Dashboards
3. API unit tests for Brand Tracking
4. Admin edit page tests

**Low Priority**:
1. GWI portal edit page tests
2. Inline edit page tests
3. Edge case tests

## Test Commands

```bash
# Run all unit tests
npm run test:run

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Run specific test file
npm run test:run -- app/api/v1/agents/[id]/route.test.ts

# Run E2E tests for specific file
npm run test:e2e -- e2e/agents.spec.ts
```

## Test Data Requirements

### Test Users
- Admin user with full permissions
- Regular user with limited permissions
- User with no edit permissions

### Test Resources
- Sample agents, workflows, audiences, etc.
- Resources in different states (active, paused, archived)
- Resources with dependencies

## Continuous Integration

Tests should run:
- On every pull request
- Before merging to main
- On scheduled basis (daily)

## Test Maintenance

- Update tests when API changes
- Update tests when UI changes
- Review test coverage quarterly
- Remove obsolete tests
- Add tests for new edit pages
