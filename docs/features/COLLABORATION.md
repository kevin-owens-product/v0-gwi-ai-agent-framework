# Collaboration Features

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Projects](#projects)
2. [Teams](#teams)
3. [Comments](#comments)
4. [Shared Links](#shared-links)
5. [Notifications](#notifications)
6. [Saved Views](#saved-views)

---

## Projects

### Overview

Projects provide workspace management for organizing resources, tracking progress, and collaborating on research initiatives.

### Project Model

**Database Model:** `Project`

```prisma
model Project {
  id          String        @id @default(cuid())
  orgId       String
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  progress    Int           @default(0) // 0-100
  color       String?       // Hex color for UI
  icon        String?       // Icon identifier
  settings    Json          @default("{}")
  createdBy   String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  organization Organization @relation(...)
  creator      User         @relation(...)
}
```

### Project Status

```typescript
enum ProjectStatus {
  ACTIVE    // Currently active
  ON_HOLD   // Temporarily paused
  COMPLETED // Successfully completed
  ARCHIVED  // Archived for reference
}
```

### Project Features

**Resource Organization:**
- Link agents, workflows, reports, dashboards to projects
- Group related resources together
- Filter views by project

**Progress Tracking:**
- Progress percentage (0-100)
- Visual progress indicators
- Status-based filtering

**Customization:**
- Custom colors for visual distinction
- Icon selection
- Custom settings (JSON)

### Service Projects (GWI Portal)

**Extended Project Model:** `ServiceProject`

For GWI services business, projects include:
- Client management
- Team member assignments
- Deliverables tracking
- Milestones
- Time tracking
- Invoicing

**Related Models:**
- `ProjectTeamMember` - Team assignments
- `ProjectDeliverable` - Deliverables
- `ProjectMilestone` - Milestones
- `TimeEntry` - Time tracking

---

## Teams

### Overview

Teams enable member management, role assignments, and collaboration within organizations.

### Team Membership

**Database Model:** `OrganizationMember`

```prisma
model OrganizationMember {
  id        String   @id @default(cuid())
  orgId     String
  userId    String
  role      Role     @default(MEMBER)
  invitedBy String?
  joinedAt  DateTime @default(now())

  organization Organization @relation(...)
  user         User         @relation(...)

  @@unique([orgId, userId])
}
```

### Roles

```typescript
enum Role {
  OWNER   // Full control, can delete organization
  ADMIN   // Manage members, settings, resources
  MEMBER  // Create and edit resources
  VIEWER  // Read-only access
}
```

### Team Management Features

**Invitations:**
- Email-based invitations
- Role assignment during invitation
- Invitation expiration
- Resend invitations

**Member Management:**
- View all team members
- Change member roles
- Remove members
- View member activity

**Activity Tracking:**
- Member join dates
- Last activity timestamps
- Resource creation tracking

---

## Comments

### Overview

Comments enable threaded discussions on resources, supporting collaboration and feedback.

### Comment Model

**Database Model:** `Comment`

```prisma
model Comment {
  id         String    @id @default(cuid())
  orgId      String
  userId     String
  entityType String    // report, dashboard, insight, etc.
  entityId   String
  parentId   String?   // For threaded replies
  content    String    @db.Text
  mentions   String[]  @default([]) // User IDs mentioned
  isResolved Boolean   @default(false)
  resolvedBy String?
  resolvedAt DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  user    User      @relation(...)
  parent  Comment?  @relation("CommentReplies", ...)
  replies Comment[] @relation("CommentReplies")
}
```

### Comment Features

**Threading:**
- Reply to comments (nested threads)
- Parent-child relationships
- Thread depth tracking

**Mentions:**
- @mention users in comments
- User ID tracking in `mentions` array
- Notification triggers

**Resolution:**
- Mark comments as resolved
- Track resolver and resolution time
- Filter resolved/unresolved comments

**Entity Types:**
- Comments can be attached to any resource
- Supported: reports, dashboards, insights, agents, workflows, etc.

### Usage

**Creating Comments:**
```typescript
await prisma.comment.create({
  data: {
    orgId,
    userId,
    entityType: 'report',
    entityId: reportId,
    content: 'Great analysis!',
    mentions: ['user_123'], // @mention
  },
})
```

**Threaded Replies:**
```typescript
await prisma.comment.create({
  data: {
    orgId,
    userId,
    entityType: 'report',
    entityId: reportId,
    parentId: parentCommentId, // Reply to parent
    content: 'Thanks for the feedback!',
  },
})
```

---

## Shared Links

### Overview

Shared Links enable public sharing of resources with access control, expiration, and view tracking.

### Shared Link Model

**Database Model:** `SharedLink`

```prisma
model SharedLink {
  id            String               @id @default(cuid())
  orgId         String
  userId        String
  entityType    String               // report, dashboard
  entityId       String
  token         String               @unique
  password      String?              // Optional password protection
  expiresAt     DateTime?
  maxViews      Int?
  viewCount     Int                  @default(0)
  allowedEmails String[]             @default([])
  permissions   SharedLinkPermission @default(VIEW)
  isActive      Boolean              @default(true)
  lastViewedAt  DateTime?
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  user  User             @relation(...)
  views SharedLinkView[]
}
```

### Link Permissions

```typescript
enum SharedLinkPermission {
  VIEW      // View only
  COMMENT   // View and comment
  DOWNLOAD  // View, comment, and download
}
```

### Access Control

**Password Protection:**
- Optional password for link access
- Secure password storage
- Password verification on access

**Email Restrictions:**
- Restrict access to specific email addresses
- Email validation on access
- Allow list management

**Expiration:**
- Optional expiration date
- Automatic deactivation after expiration
- Time-based access control

**View Limits:**
- Maximum view count
- Automatic deactivation after limit
- View tracking

### View Tracking

**Database Model:** `SharedLinkView`

```prisma
model SharedLinkView {
  id           String   @id @default(cuid())
  sharedLinkId String
  viewerEmail  String?
  viewerIp     String?
  userAgent    String?
  viewedAt     DateTime @default(now())

  sharedLink SharedLink @relation(...)
}
```

**Tracking:**
- View timestamps
- Viewer email (if provided)
- IP address
- User agent
- View count increment

### Link Generation

**Token Generation:**
```typescript
const token = randomBytes(32).toString('hex')
const link = `https://app.example.com/shared/${token}`
```

**Access URL Format:**
- `/shared/{token}` - Public access route
- Middleware validates token and permissions
- Renders resource with appropriate access level

---

## Notifications

### Overview

Notifications provide real-time updates and alerts for platform events, comments, mentions, and system notifications.

### Notification Types

**User Notifications:**
- Comment mentions
- Comment replies
- Shared link access
- Workflow completion
- Agent run completion
- Report generation
- Team invitations
- Access changes

**System Notifications:**
- Platform updates
- Maintenance windows
- Feature announcements
- Security alerts

### Notification Model

**Database Model:** `SystemNotification`

```prisma
model SystemNotification {
  id          String              @id @default(cuid())
  type        NotificationType
  title       String
  message     String              @db.Text
  targetType  NotificationTargetType
  targetIds   String[]            // User IDs, org IDs, or "all"
  priority    Int                 @default(0)
  isActive    Boolean             @default(true)
  expiresAt   DateTime?
  actionUrl   String?
  actionLabel String?
  metadata    Json                @default("{}")
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}
```

### Notification Types

```typescript
enum NotificationType {
  INFO        // Informational
  SUCCESS     // Success message
  WARNING     // Warning message
  ERROR       // Error message
  ANNOUNCEMENT // Platform announcement
}
```

### Target Types

```typescript
enum NotificationTargetType {
  ALL_USERS      // All platform users
  ORGANIZATION    // Specific organization
  USER            // Specific user
  ROLE            // Users with specific role
}
```

### Notification Delivery

**Channels:**
- In-app notifications
- Email notifications
- Webhook delivery (future)

**Preferences:**
- User notification preferences
- Channel selection
- Frequency settings
- Quiet hours

### Real-Time Updates

**Implementation:**
- Polling-based updates (current)
- WebSocket support (future)
- Server-Sent Events (SSE) support (future)

---

## Saved Views

### Overview

Saved Views enable users to save filter presets, favorites, and recent views for quick access to resources.

### Saved View Model

**Database Model:** `SavedView`

```prisma
model SavedView {
  id          String        @id @default(cuid())
  userId      String
  orgId       String
  name        String
  description String?
  type        SavedViewType
  entityType  String        // dashboard, report, agent, audience, etc.
  entityId    String
  isPinned    Boolean       @default(false)
  sortOrder   Int           @default(0)
  metadata    Json          @default("{}") // Filter presets, etc.
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user User @relation(...)

  @@unique([userId, entityType, entityId])
}
```

### Saved View Types

```typescript
enum SavedViewType {
  FAVORITE  // User favorite
  RECENT    // Recently viewed
  PINNED    // Pinned for quick access
}
```

### Features

**Filter Presets:**
- Save filter configurations
- Quick apply saved filters
- Share filter presets (future)

**Favorites:**
- Mark resources as favorites
- Quick access to favorites
- Favorite indicators in UI

**Recent Views:**
- Automatic tracking of recent views
- Quick access to recently viewed resources
- Configurable history length

**Pinned Views:**
- Pin important views
- Always visible in navigation
- Custom sort order

### Metadata Structure

**Filter Presets:**
```json
{
  "filters": {
    "status": "ACTIVE",
    "type": "RESEARCH",
    "dateRange": "last_30_days"
  },
  "sortBy": "updatedAt",
  "sortOrder": "desc"
}
```

---

## Related Documentation

- [Core Features](./CORE_FEATURES.md) - Agent system and workflows
- [Database Architecture](../architecture/DATABASE_ARCHITECTURE.md) - Database schema
- [Authentication Architecture](../architecture/AUTH_ARCHITECTURE.md) - RBAC and permissions

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
