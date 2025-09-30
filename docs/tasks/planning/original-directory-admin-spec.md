# SuburbMates Directory Admin Specification

Note: For authoritative enums, visibility rules, and admin practices, see docs/SSOT.md. This document provides additional details but defers to the SSOT if there is any conflict.

## Summary

SuburbMates ships with 12 core pages + dynamic Business Profile, enhanced with comprehensive directory management including **ABN optional verification**, approval workflows, CLI import/export tools, admin bulk operations, deduplication, and **GA4 client + server-side tracking**.

---

## Data Model Extensions

### Business Model Updates

```typescript
Business {
  id: string
  name: string
  suburb: string
  category: string
  phone?: string
  email?: string
  website?: string
  slug: string (unique)
  
  // Legacy verification (deprecated in favor of abnStatus)
  verified: boolean (default false)                    // Only true if abnStatus=VERIFIED
  
  // ABN Management (Optional)
  abn?: string                                         // Australian Business Number
  abnStatus: 'NOT_PROVIDED' | 'PENDING' | 'VERIFIED' | 'INVALID' | 'EXPIRED' (default NOT_PROVIDED)
  
  // Approval Workflow
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' (default PENDING)
  requiresVerification: boolean (default false)
  
  // Directory Management
  source: 'MANUAL' | 'CSV' | 'AUTO_ENRICH' | 'CLAIMED' (default MANUAL)
  qualityScore: number (0-100, default 0)
  duplicateOfId?: string (foreign key to Business)
  ownerId?: string (foreign key to User)
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Supporting Models

```typescript
OwnershipClaim {
  id: string
  businessId: string (foreign key)
  userId: string (foreign key)
  method: 'EMAIL_DOMAIN' | 'PHONE_OTP' | 'DOCUMENT'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED' (default PENDING)
  evidence?: Json
  createdAt: DateTime
  updatedAt: DateTime
}

Inquiry {
  id: string
  businessId: string (foreign key)
  name: string
  email?: string
  phone?: string
  message: string
  utm?: Json                                          // UTM tracking parameters
  createdAt: DateTime
}

AuditLog {
  id: string
  actorId?: string (foreign key to User)
  action: string                                      // Action performed
  target?: string                                     // Target resource ID
  meta?: Json                                         // Additional metadata
  createdAt: DateTime
}
```

### Business Visibility Rules

* **Public visibility**: Only businesses with `approvalStatus = 'APPROVED'` appear in public search and directory
* **"Verified" badge**: Only displayed when `abnStatus = 'VERIFIED'`
* **Non-ABN listings**: May be `APPROVED` and display "Community-listed" badge instead

---

## Page Specifications (12 Core + Profile)

### 1. Home (`/`)
- Hero search with autocomplete
- Featured categories and suburbs
- Call-to-action buttons for claim/register
- SEO: `WebSite` JSON-LD schema
- **GA4 Events**: `home_search_submit`, `cta_claim_click`, `cta_register_click`

### 2. Search (`/search`)
- Query params: `?category=&suburb=&q=&page=&sort=`
- Filters, results grid, pagination
- Optional map integration
- **SEO**: `noindex,follow` when filtered
- **GA4 Events**: `search_view`, `filter_apply`, `result_click`
- Uses rules-based reranker (feature flagged)

### 3. Business Claiming (`/claim`, `/claim/[businessId]`)
- Find existing business listings
- Multi-method verification: email domain, phone OTP, document upload
- Status tracking panel
- **GA4 Events**: `claim_start`, `claim_submit`, `claim_auto_approved`, `claim_rejected`
- Rate limiting and duplicate checks

### 4. Business Registration (`/register-business`)
- Multi-step wizard: Info → ABN (optional) → Contact/Hours → Media → Review
- Sets `approvalStatus = 'PENDING'` on submission
- **GA4 Events**: `register_business_step`, `register_business_complete`
- Email confirmations via Resend

### 5. Authentication
- **Login** (`/login`): Supabase auth integration
- **Signup** (`/signup`): User registration with role assignment
- **GA4 Events**: `login_submit`, `password_reset_request`, `signup_submit`, `email_verify_sent`

### 6. Static Pages
- **About** (`/about`): Company information with `Organization` schema
- **Support** (`/support`): FAQ + contact form with rate limiting
- **Privacy** (`/privacy`): Privacy policy (indexable)
- **Terms** (`/terms`): Terms of service (indexable)
- **GA4 Events**: `about_view`, `support_view`, `privacy_view`, `terms_view`

### 7. Business Dashboard (`/dashboard/business`)
- KPI overview, profile editor, leads inbox
- Reviews management, sharing tools, QR codes
- Settings and configuration
- **GA4 Events**: `dashboard_view`, `profile_update`, `lead_reply`, `share_generate`

### 8. Admin Panel (`/admin`)
- Business approval queue and metrics
- User/business management tables
- Feature flags and AI status monitoring
- **GA4 Events**: `admin_claims_review`, `flag_toggle`, `admin_action`
- All actions logged to `AuditLog`

### 9. Business Profile (`/business/[slug]`)
- Public business profile with hero, services, gallery
- Contact form → `Inquiry` creation
- Reviews and ratings display
- **SEO**: `LocalBusiness` JSON-LD, OG images
- **GA4 Events**: `profile_view`, `lead_submit`, `share_click`, `review_submit`

---

## Directory Management Features

### A) Approval & ABN Policy

**Approval Workflow:**
- New listings default to `approvalStatus = 'PENDING'`
- Admin reviewers can set `APPROVED` or `REJECTED`
- Only approved businesses appear in public search

**ABN Verification (Optional):**
- ABN field is optional during registration
- If provided: `abnStatus = 'PENDING'` → async verification → `VERIFIED|INVALID|EXPIRED`
- Verification integrates with Australian Business Register API

**Badge Display Rules:**
- **"Verified" badge**: Only when `abnStatus = 'VERIFIED'`
- **"Community-listed" chip**: When `APPROVED` without ABN verification

### B) Deduplication & Quality Scoring

**Duplicate Detection:**
- **Strict duplicates**: Same normalized phone OR website domain OR `{name + suburb}`
- **Loose candidates**: Levenshtein name match within same suburb ± partial address match
- Duplicates flagged in **Admin → Duplicates** tab for manual review

**Quality Scoring (0-100):**
```
qualityScore = weightedCompleteness(images, hours, services, description) 
             + recencyBonus(lastUpdated)
             + reviewBonus(averageRating, reviewCount)
             + verificationBonus(abnStatus, emailVerified)
```

### C) Import/Export CLI (`scripts/directory-cli.ts`)

**Available Commands:**

```bash
# List businesses with filtering
npm run cli list-businesses [--status APPROVED] [--abn VERIFIED] [--suburb Richmond] [--category Plumbing] [--limit 100]

# Import from CSV with deduplication
npm run cli import-csv --file=./data/businesses.csv [--dry-run] [--dedupe=loose|strict]

# Export to CSV with filtering  
npm run cli export-csv --output=./export.csv [--status APPROVED]

# Business management
npm run cli approve-business --id=<business-id> [--reason "Verified contact details"]
npm run cli reject-business --id=<business-id> [--reason "Insufficient information"]

# Statistics and reporting
npm run cli stats
npm run cli list-suburbs
npm run cli list-categories
```

**Import Safeguards:**
- `--dry-run` flag prints changes without executing
- Validates Australian phone numbers and normalizes URLs/emails
- Blocks disposable email domains
- Daily import caps per suburb to prevent thin content
- All operations logged to `AuditLog`

### D) Enhanced Admin Panel (`/admin`)

**Dashboard Tabs:**
- **Pending**: New submissions awaiting approval
- **Approved**: Live directory listings
- **Rejected**: Declined submissions with reasons
- **Duplicates**: Potential duplicate businesses for review

**Business Management Table:**
Columns: Name • Suburb • Category • ABN Status • Source • Quality Score • Created • Actions

**Bulk Operations:**
- Approve/reject multiple businesses
- Mark as duplicate with canonical selection
- Export filtered results
- Import CSV (queues background job)

**Business Detail Panel:**
- Complete audit trail
- Lead generation metrics
- Last modification timestamp
- Verification status history

**Admin Guardrails:**
- Cannot publish business unless `approvalStatus = 'APPROVED'`
- Warning displayed if "Verified" badge shown without `abnStatus = 'VERIFIED'`
- All admin actions require confirmation and are logged

---

## Search & SEO Implementation

### Search Algorithm

**Base Filtering:**
- Only `approvalStatus = 'APPROVED'` businesses in results
- Standard filters: category, suburb, keyword matching

**Rules-Based Reranker** (Feature Flag: `search_reranker`):
```
finalScore = localityBoost(+30 if suburb exact match)
           + completionBoost(0-20 based on profile completeness)  
           + ratingBoost(0-20 based on average rating)
           + recencyBoost(0-10 based on last update)
           + verificationBoost(+5 if ABN verified)
```

### SEO Strategy

**Search Pages:**
- `/search` with parameters → `noindex,follow` meta tags
- Canonical URLs normalize parameter order
- Dynamic title/description based on active filters

**Business Profiles:**
- Fully indexable with unique titles and meta descriptions
- `LocalBusiness` JSON-LD structured data
- Dynamic OG images via `/api/og` edge route
- Fallback to static PNG for social sharing

**Sitemap Generation:**
- Include all approved business profiles
- Future: Category and suburb landing pages
- High-traffic category/suburb combinations

---

## Analytics & Tracking (GA4 + Server-to-Server)

### Client-Side Tracking Helper

```typescript
// Usage: ga('event_name', { custom_parameter: 'value' })
function ga(event: string, parameters?: Record<string, any>): void
```

### Server-Side Tracking Helper

```typescript
// Usage: trackServerEvent('lead_submit', { business_id: '123' })
function trackServerEvent(name: string, params: Record<string, any>): Promise<void>
```

Uses GA4 Measurement Protocol with `GA4_API_SECRET` environment variable.

### Event Taxonomy

**User Journey Events:**
- `home_search_submit`, `search_view`, `filter_apply`, `result_click`
- `profile_view`, `lead_submit`, `share_click`, `review_submit`  
- `signup_submit`, `email_verify_sent`, `login_submit`, `password_reset_request`

**Business Owner Events:**
- `register_business_step`, `register_business_complete`
- `claim_start`, `claim_submit`, `claim_auto_approved`, `claim_rejected`
- `dashboard_view`, `profile_update`, `lead_reply`, `share_generate`

**Admin/Operations Events:**
- `admin_claims_review`, `admin_action`, `flag_toggle`
- `dir_import`, `dir_approve`, `dir_reject`

**Nightly Digest Metrics:**
Automated email report including 24-hour counts of:
- Lead submissions by category/suburb
- Profile shares and QR code scans  
- Claims approved/rejected
- Directory imports and quality score changes

---

## Rate Limiting, Moderation & Audit

### Rate Limiting (Upstash Redis)
- Lead forms: 3 submissions per IP per hour
- Support tickets: 5 per IP per day
- Business registrations: 2 per IP per day
- API endpoints: 100 requests per IP per minute

### Content Moderation
- Heuristic spam detection for business descriptions
- Block submissions with multiple external links
- Profanity filter for public-facing content
- Manual review queue for flagged content

### Audit Logging
All administrative actions logged to `AuditLog` with:
- Actor identification (admin user ID)
- Timestamp and IP address
- Action taken (approve, reject, merge, etc.)
- Target resource (business ID, user ID)
- Additional metadata (reason, previous state)

---

## Environment & Deployment

### Required Environment Variables

**Vercel Production & Preview:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email Service  
RESEND_API_KEY=
FROM_EMAIL=no-reply@suburbmates.com.au
SENDER_DOMAIN=suburbmates.com.au

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
GA4_API_SECRET=

# Error Tracking
SENTRY_DSN=

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# AI/Agent Integration
AGENT_TOKEN=

# ABN Verification
ABR_API_KEY=                    # Australian Business Register API
```

### Email Domain Configuration
- SPF/DKIM/DMARC records configured for `no-reply@suburbmates.com.au`
- Dedicated sending domain for transactional emails
- Bounce and complaint handling via Resend webhooks

### SEO Configuration

**robots.txt:**
```
User-agent: *
Allow: /business/
Allow: /search
Allow: /category/
Allow: /suburb/
Disallow: /admin
Disallow: /api/
Disallow: /auth/
Disallow: /dashboard/

Sitemap: https://suburbmates.com.au/sitemap.xml
```

### Accessibility Compliance
- WCAG 2.2 AA compliance target
- Keyboard navigation support
- Color contrast ratios ≥ 4.5:1
- Semantic HTML and ARIA labels
- Screen reader compatibility testing

---

## Acceptance Criteria (End-to-End)

### Business Management
✅ **Non-ABN businesses** can be approved and appear publicly with "Community-listed" chip  
✅ **Only ABN-verified businesses** display the "Verified" badge  
✅ **Search and sitemap** include only approved businesses  
✅ **Admin approval workflow** functions with bulk operations

### CLI Operations  
✅ **Import dry-run** produces accurate diff without database changes  
✅ **Real imports** write to database, perform deduplication, and log actions  
✅ **Export functionality** works with filtering options  
✅ **Business management commands** approve/reject with audit logging

### Admin Interface
✅ **Bulk approve/reject** operations work correctly  
✅ **Duplicates tab** identifies potential matches  
✅ **Merge operations** update canonical business references  
✅ **Audit trail** shows complete action history

### Analytics & Tracking
✅ **GA4 client events** fire correctly from user interactions  
✅ **Server-side events** record via Measurement Protocol even when JS blocked  
✅ **Critical business events** (leads, claims) always tracked server-side  
✅ **Nightly digest email** delivers accurate 24-hour metrics

### SEO & Performance  
✅ **OG images** render via edge route with static fallback  
✅ **Business profiles** have unique JSON-LD structured data  
✅ **Search pages** properly handle indexing directives  
✅ **Sitemap** includes all approved businesses

### Quality Assurance
✅ **Rate limiting** prevents abuse of forms and APIs  
✅ **Content moderation** catches obvious spam  
✅ **Deduplication** identifies strict and loose matches  
✅ **Quality scoring** reflects business profile completeness

---

## Implementation Priority

### Phase 1: Core Directory Management (Week 1-2)
1. Update database schema with new Business fields
2. Implement approval workflow in admin panel  
3. Add ABN verification integration
4. Build basic CLI import/export tools

### Phase 2: Enhanced Admin Features (Week 3)
1. Advanced admin dashboard with bulk operations
2. Duplicate detection and merging system
3. Quality scoring algorithm
4. Comprehensive audit logging

### Phase 3: Analytics & Optimization (Week 4)  
1. GA4 client and server-side tracking
2. Advanced search reranking
3. SEO enhancements (JSON-LD, OG images)
4. Rate limiting and content moderation

### Phase 4: Polish & Launch (Week 5)
1. Nightly digest email system
2. Performance optimization
3. Accessibility audit and fixes
4. Production deployment and monitoring

---

*This specification serves as the definitive guide for implementing SuburbMates' directory management system. All features should be built according to these requirements with proper testing and documentation.*