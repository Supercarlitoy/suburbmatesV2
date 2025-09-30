# SuburbMates Single Source of Truth (SSOT)

This document is the canonical reference for SuburbMates' domain model, visibility rules, admin practices, and implementation conventions. All other docs should defer to this SSOT.

**Related Documentation:**
- `COMPLETE_ADMIN_PANEL_WORKFLOWS.md` - Full administrative workflows and platform control
- `TERMINOLOGY_DICTIONARY.md` - Comprehensive entity definitions and relationships

## Domain model (authoritative)

### Core Entities
- **User**: Authenticated account holders with roles (USER/ADMIN) who own/manage Business profiles
- **Customer**: Unauthenticated prospective clients who submit inquiries (stored in Lead/Inquiry models)
- **Business**: Core entity representing Melbourne-based businesses with shareable professional profiles
- **Lead**: Customer inquiries with status tracking (NEW → CONTACTED → QUALIFIED → CONVERTED → CLOSED)
- **Inquiry**: Enhanced lead capture with UTM tracking, AI qualification, and advanced analytics

### Status Enums (from Prisma)
- **ApprovalStatus**: PENDING | APPROVED | REJECTED
- **AbnStatus**: NOT_PROVIDED | PENDING | VERIFIED | INVALID | EXPIRED  
- **BusinessSource**: MANUAL | CSV | AUTO_ENRICH | CLAIMED

### Business Visibility Rules
- Public listings and search include only `approvalStatus = APPROVED`
- "Verified" badge shown only when `abnStatus = VERIFIED`
- Approved businesses without verified ABN show "Community-listed" chip
- Quality Score (0-100): `completeness(40%) + recency(20%) + reviews(20%) + verification(20%)`

### Ownership & Verification
- A user can own multiple businesses (`ownerId` is not unique; indexed)
- **OwnershipClaim**: Verification workflow (EMAIL_DOMAIN | PHONE_OTP | DOCUMENT)
- **Duplicate Detection**: Strict matching (phone/domain/name+suburb) + loose matching (80% similarity)

## Shared modules

### Core Domain Logic
- **lib/domain.ts**: Re-exports Prisma enums and exposes SOURCE_LABELS and helpers (isAbnVerified, isApproved)
- **lib/auth/checkAdminAccess.ts**: Single admin check using Prisma role or ADMIN_EMAILS allowlist
- **lib/utils/audit.ts**: Central audit writer: logAuditEvent({ actorId, action, target, meta, ipAddress, userAgent })

### Admin Workflow Support
- **AdminBusinessDashboard**: Multi-tab interface (Pending, Approved, Rejected, Duplicates)
- **AdminVerificationDashboard**: Ownership claim review with evidence assessment
- **BulkActionsToolbar**: Mass approve/reject operations with audit logging
- **DuplicateDetectionPanel**: Manual review and merging capabilities
- **QualityScoringDisplay**: Visual quality metrics and improvement recommendations

### Analytics & Tracking
- **lib/analytics/ga4-client.ts**: Client-side GA4 event tracking
- **lib/analytics/ga4-server.ts**: Server-side Measurement Protocol (critical events guaranteed)
- **UTM Tracking**: Complete marketing attribution in Inquiry.utm JSON field
- **Lead Qualification**: AI-powered spam detection and priority scoring

## Coding conventions

- Do not use the legacy Business.verified field. Treat verification as derived: isAbnVerified(abnStatus)
- Use approvalStatus for all approval checks (never the generic status)
- Use BusinessSource enum values with SOURCE_LABELS for UI
- Audit logging must go through logAuditEvent; do not call prisma.auditLog.create directly in routes
- Admin components must use checkAdminAccess() for permission validation
- All admin actions require audit trail logging with actor and metadata
- UTM tracking must be preserved in Inquiry model for marketing attribution

## Database

- Prisma schema is authoritative. Key points:
  - Business.ownerId is optional and indexed (not unique)
  - serviceAreas is stored as a JSON string today; parsing is centralized (lib/business/normalize.ts when present)
  - Inquiry.utm JSON field stores complete marketing attribution data
  - AuditLog captures all admin actions with full context and metadata
  - Quality scores cached in Business.qualityScore for search performance
  - Duplicate relationships tracked via Business.duplicateOfId self-reference

## Validation and CI

- npm run validate:domain performs static checks to prevent drift:
  - Forbids legacy BusinessSource strings
  - Ensures admin routes use the shared admin check
  - Ensures audit logs go through the utility
  - Warns on legacy status patterns
  - Validates UTM parameter preservation
  - Checks admin permission enforcement

## Admin Workflow Success Metrics

- **Business Approval**: Target <24 hours processing time, >95% accuracy rate
- **Claim Verification**: Target <72 hours processing time, >98% accuracy rate  
- **Quality Score Impact**: Track businesses improving after admin outreach
- **Lead Analytics**: Monitor inquiry volume, conversion rates, AI qualification accuracy
- **Duplicate Detection**: >90% accuracy in identifying and flagging duplicates
- **System Performance**: >99.9% uptime, <2 hours security incident response

## How to update this SSOT

- When changing enums, visibility rules, or admin practices, update this SSOT first, then adjust code and other docs to point here.
