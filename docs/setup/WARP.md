# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Important: The canonical reference for domain, enums, visibility rules, and admin practices is docs/SSOT.md. If there is any discrepancy between docs, defer to docs/SSOT.md.

**Key Reference Documents:**
- `docs/SSOT.md` - Single source of truth for domain model and coding conventions
- `docs/COMPLETE_ADMIN_PANEL_WORKFLOWS.md` - Full administrative workflows and platform control
- `docs/TERMINOLOGY_DICTIONARY.md` - Comprehensive entity definitions and relationships

## 📁 Complete Documentation Architecture

SuburbMates has extensive documentation organized across multiple categories:

### **📊 Admin & Operations**
- `docs/admin/` - Administrative guides and workflows
  - `admin-panel-guide.md` - Complete admin interface documentation (500+ lines)
  - `verification-workflows.md` - Business claim verification processes
- `docs/COMPLETE_ADMIN_PANEL_WORKFLOWS.md` - Comprehensive admin workflow guide (850+ lines)
- `docs/tasks/` - Implementation tracking and task management
  - `MASTER_IMPLEMENTATION_CHECKLIST.md` - Complete task breakdown (156 subtasks, 70.5% complete)
  - `TASK_STATUS_DASHBOARD.md` - Real-time progress tracking

### **🏗️ Architecture & Development**
- `docs/architecture/` - Technical architecture and system design
  - `project-structure.md` - Codebase organization and file structure
  - `component-system.md` - React component architecture (700+ lines)
  - `component-patterns.md` - Component design patterns and reorganization
- `docs/development/` - Developer setup and contribution guides
  - `testing-guide.md` - Comprehensive testing strategy (250 E2E tests)
  - `production-readiness-status.md` - 95% production ready status
  - `workflows.md` - Development workflow checklists

### **🤖 Automation & AI**
- `docs/automation/` - Automation systems and AI workflows
  - `ai-systems.md` - Complete automation integration status
  - `workflows-guide.md` - Comprehensive automation workflows (890+ lines)
  - `integration-status.md` - 100% automation features implemented

### **🔗 Integrations & External Services**
- `docs/integrations/` - External service integrations
  - `MAPBOX_INTEGRATION.md` - Complete Mapbox integration (320+ lines)
  - `testing-strategy.md` - Advanced Playwright testing strategy
- External APIs: Supabase, Resend, Upstash Redis, Sentry, GA4, ABR API

### **📄 Guides & Configuration**
- `docs/guides/` - Step-by-step setup and configuration
  - `email-setup.md` - Professional email configuration with Resend
  - `environment-config.md` - Complete environment variable setup
  - `seo-landing-pages-roadmap.md` - SEO strategy and implementation
- `docs/EMAIL_AND_NOTIFICATION_SYSTEM.md` - **Centralized email infrastructure documentation** (850+ lines)

### **📋 Specifications & Requirements**
- `docs/specs/` - Technical specifications and business logic
  - `business-requirements.md` - Complete spec-driven development process
  - `mvp-checklist.md` - 6-week MVP implementation roadmap
  - `profile-strategy.md` - Profile building and sharing strategy

## 🚀 Quick Navigation Links

### **Getting Started**
- **New to SuburbMates?** → Start with `docs/README.md` and `docs/SSOT.md`
- **Admin Setup?** → `docs/admin/admin-panel-guide.md` and `docs/COMPLETE_ADMIN_PANEL_WORKFLOWS.md`
- **Development Setup?** → `docs/development/README.md` and environment setup below
- **Email & Notifications?** → `docs/EMAIL_AND_NOTIFICATION_SYSTEM.md` (comprehensive guide)
- **Want to understand the automation?** → `docs/automation/workflows-guide.md`

### **Quick Reference Cards**
- **Admin Workflows:** 99.9% uptime, <24h business approval, >98% claim verification accuracy
- **Architecture:** Next.js 15 + Supabase + Prisma + Tailwind + 100% automation
- **Implementation Status:** 70.5% complete (110/156 subtasks), Tasks 1-3 complete
- **Testing:** 250 E2E tests, Lighthouse CI, comprehensive database testing

### **Emergency Contacts**
- **Production Issues:** Check `docs/development/production-readiness-status.md`
- **Admin Problems:** Reference `docs/COMPLETE_ADMIN_PANEL_WORKFLOWS.md`
- **Automation Issues:** See `docs/automation/integration-status.md`
- **Testing Failures:** Review `docs/development/testing-guide.md`

## Project Overview

SuburbMates is a comprehensive Melbourne-focused business community platform that connects local businesses with residents through shareable professional profiles and sophisticated lead generation. The platform features **complete directory administration** with enterprise-grade automation, AI-powered business verification, comprehensive analytics, and full administrative control.

**Core Platform Features:**
- **Professional Business Profiles**: Shareable with SuburbMates branding and customization
- **Dual Workflow System**: Create new profiles or claim existing listings with verification
- **Complete Directory Management**: ABN verification, multi-stage approval workflows, quality scoring (0-100)
- **Enterprise CLI Tools**: Import/export, bulk operations, deduplication (strict + loose), statistics
- **Advanced Admin Dashboard**: Multi-tab interface (Pending/Approved/Rejected/Duplicates) with bulk actions
- **Comprehensive Analytics**: Dual GA4 tracking (client + server-side), UTM attribution, conversion tracking
- **AI-Powered Automation**: Business verification, lead qualification, content moderation, spam detection
- **Melbourne-Specific Features**: 603 suburbs, rules-based search reranker, local business focus
- **Professional Communication**: Branded email system via Resend, automated notifications
- **Rate Limiting & Security**: Upstash Redis, content moderation, audit logging
- **Complete Testing Suite**: 250 E2E tests, Lighthouse CI, production-ready validation

**Current Implementation Status:** 70.5% complete (110/156 subtasks)
- ✅ **Tasks 1-3 Complete**: API refactoring, endpoints, UI components
- 🔄 **Tasks 4-6 Ready**: CLI-web bridge, AI integration, analytics integration
- 🔄 **Task 7 Pending**: Advanced bulk operations (low priority)

## Development Commands

### Setup and Installation
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Setup environment variables
cp .env.local.example .env.local
```

### Development
```bash
# Start development server
npm run dev

# Run with debugger
npm run dev -- --inspect

# Build the application
npm run build

# Start production server
npm start
```

### Directory Management (CLI)
```bash
# Business Listing & Filtering
npm run cli list-businesses [--status APPROVED] [--abn VERIFIED] [--suburb Richmond] [--category Plumbing] [--limit 100]
npm run cli list-suburbs                    # List all 603 Melbourne suburbs
npm run cli list-categories                 # List all business categories
npm run cli stats                          # Platform statistics and metrics

# CSV Import/Export Operations
npm run cli import-csv --file=./data/businesses.csv [--dry-run] [--dedupe=loose|strict]
npm run cli export-csv --output=./export.csv [--status APPROVED] [--format csv|json]
npm run cli validate-csv --file=./data/businesses.csv  # Validate CSV structure

# Business Management Operations
npm run cli approve-business --id=<business-id> [--reason "Verified contact details"]
npm run cli reject-business --id=<business-id> [--reason "Insufficient information"]
npm run cli calculate-quality --id=<business-id>        # Recalculate quality score
npm run cli detect-duplicates [--businessId=<id>]       # Run duplicate detection

# Bulk Operations
npm run cli bulk-approve --filter="status:PENDING suburb:Richmond"
npm run cli bulk-update-quality                         # Recalculate all quality scores
npm run cli cleanup-duplicates [--dry-run]              # Remove duplicate entries

# Advanced Analytics
npm run cli analytics --type=leads|quality|duplicates   # Generate analytics reports
npm run cli audit-trail --businessId=<id>              # Show audit history
npm run cli performance-report                          # System performance metrics
```

### Automation & Testing Commands
```bash
# AI Automation
npm run ai:test                            # Test AI-enhanced services
npm run ai:verify --businessId=<id>        # Run AI verification on business
npm run automation:status                   # Check automation system health

# Analytics & Tracking
npm run analytics:test                      # Test GA4 event tracking
npm run analytics:server-events            # Test server-side event tracking
npm run generate:nightly-digest            # Generate nightly growth report

# Quality Assurance
npm run lighthouse                          # Run Lighthouse CI tests
npm run test:e2e                          # Run 250 E2E tests with Playwright
npm run test:api                           # Test API endpoints
npm run validate:domain                    # SSOT compliance validation

# Database & Maintenance
npm run db:migrate                         # Run database migrations
npm run db:backup                          # Create database backup
npm run cache:clear                        # Clear Redis cache
npm run cleanup:audit-logs                 # Archive old audit logs
```

### Admin Panel Access & Workflows
```bash
# Admin Panel Access: /admin (requires ADMIN role)
# Complete multi-tab administrative interface with enterprise features

# Core Business Management: /admin/businesses
# → Pending Tab: New business registrations awaiting approval
# → Approved Tab: Active businesses with quality scores and metrics
# → Rejected Tab: Rejected businesses with reasons and appeal options  
# → Duplicates Tab: Duplicate detection and merging interface
# → Bulk Actions: Mass approve/reject with safety confirmations
# → Quality Scoring: 0-100 algorithmic scoring with improvement recommendations
# → Export/Import: CSV operations with job progress tracking

# Advanced Claim Verification: /admin/claims
# → Multi-method verification (EMAIL_DOMAIN, PHONE_OTP, DOCUMENT, ABN)
# → AI-assisted verification with 85%+ confidence scoring
# → Evidence assessment with document analysis
# → Batch processing for high-confidence claims (>90% automation rate)
# → Manual override with comprehensive audit logging
# → Appeal process management with email notifications

# Business Intelligence & Analytics: /admin/analytics
# → Real-time metrics: Users, businesses, leads, conversions
# → UTM attribution analysis with campaign performance
# → Lead qualification with AI scoring and priority ranking
# → Geographic performance by Melbourne suburbs
# → Business category analysis and market trends
# → Upselling opportunity identification (15+ leads/month businesses)

# AI Automation Control: /admin/ai
# → Automation status monitoring with performance metrics
# → Confidence threshold configuration (85% default)
# → AI decision review queue with override capabilities
# → Model accuracy tracking (>94% target)
# → False positive/negative analysis and improvement

# Comprehensive Audit & Security: /admin/audit
# → Complete audit trail for all admin actions
# → User activity monitoring and security alerts
# → System performance metrics and health monitoring
# → Compliance reporting and data export
# → Security incident tracking and response
```

### Database Management
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database (development)
npx prisma db push

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma db reset
```

### Testing
```bash
# Unit Tests (Jest)
npm test
npm run test:watch         # Watch mode for development
npm run test:coverage      # Generate coverage reports
npm run test:ci           # CI-optimized test run

# Run specific test files
npm test -- path/to/test.test.ts

# End-to-End Tests (Playwright)
npx playwright test
npx playwright test --headed              # Run with browser visible
npx playwright test --project=chromium    # Run on specific browser
npx playwright test --grep="search"       # Run tests matching pattern
npm run workflow:test                     # Test business workflows specifically

# View test reports
npx playwright show-report               # View HTML test report
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type check
npx tsc --noEmit

# Domain validation (custom checks)
npm run validate:domain     # Static checks to prevent SSOT drift
```

### Email Management
```bash
# Complete email system management (see docs/EMAIL_AND_NOTIFICATION_SYSTEM.md)
npm run email:control status          # System health and diagnostics
npm run email:control test <email>    # Send test emails
npm run email:control domains         # Domain verification status
npm run email:control analytics       # Email performance metrics
npm run email:demo                    # Complete system demonstration

# Business email operations
npm run email:control send welcome <email> <business-name>
npm run email:control send inquiry <email> <business-name>
npm run email:control send claim-approved <email> <business-name>

# Advanced operations
npm run email:batch <csv-file>        # Bulk email processing
npm run email:audiences setup         # Create subscriber audiences
npm run email:broadcasts create       # Newsletter campaigns
```

### Data Management & Utilities
```bash
# Database seeding and management
npm run db:seed             # Seed database with sample data
npm run db:reset-dev        # Reset development database
npm run db:deploy           # Deploy migrations to production

# Business directory auditing
npm run audit:claims        # Audit ownership claims

# Domain validation
npm run validate:domain     # Validate domain configuration

# OG image generation
npm run generate:og         # Generate Open Graph images (build-time)
```

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 15 with App Router (Server Components + Client Components)
- **Language:** TypeScript (strict mode with comprehensive type safety)
- **Database:** PostgreSQL with Prisma ORM (enhanced schema with audit logging)
- **Authentication:** Supabase Auth with custom Resend-powered branded emails
- **Styling:** Tailwind CSS + Shadcn/ui + MagicUI components + Glass morphism
- **State Management:** Zustand (lightweight client state)
- **Validation:** Zod schemas (comprehensive API and form validation)
- **Email System:** Resend with professional branded templates and domain verification
- **Testing:** Jest + Testing Library + Playwright (250 E2E tests) + Lighthouse CI
- **Deployment:** Vercel with optimized build configuration
- **Analytics:** Dual GA4 tracking (client + server-side Measurement Protocol)
- **Caching & Rate Limiting:** Upstash Redis with sliding window algorithms
- **AI & Automation:** Custom AI services for business verification and lead qualification
- **Content Moderation:** Multi-layer spam detection, profanity filtering, disposable email blocking
- **CLI Tools:** TSX-powered comprehensive directory management (import/export/statistics)
- **External APIs:** ABR (Australian Business Register), Mapbox (geolocation), Sentry (monitoring)
- **Security:** Role-based access, audit logging, input validation, CSRF protection

### Project Structure

The project follows a **feature-based architecture** organized around business domains:

#### Core Directories
- **`/app`** - Next.js App Router with route-based organization
- **`/features`** - Business domain modules (auth, business-profiles, verification)
- **`/components`** - Reusable UI components (ui/, business/, shared/)
- **`/lib`** - Utilities, configuration, and shared services
- **`/server`** - Backend services and database utilities
- **`/hooks`** - Custom React hooks by domain
- **`/types`** - TypeScript type definitions

### Key Features Architecture

**MVP Business Owner Workflows:**

**Workflow 1: Create New Business Profile** ✅ IMPLEMENTED
- Route: `/register-business` - Multi-step registration wizard
- Business owner discovers they're not listed on SuburbMates
- Creates new profile from scratch with guided onboarding
- Auto-populated Melbourne suburb data and business categories
- Personalization tools using ProfileCustomizer component
- Branded shareable profile with SuburbMates watermark
- Email confirmation via Resend service
- Comprehensive audit logging for all actions

**Workflow 2: Claim Existing Business Profile** ✅ IMPLEMENTED
- Route: `/claim/[businessId]` - Multi-step claim verification
- Business owner finds their business already listed
- Claims ownership through multiple verification methods:
  - Business email verification
  - Phone number verification  
  - Document upload verification
  - ABN/Business registration verification
- Admin review and approval system
- Takes control of existing auto-populated profile
- Full personalization access to enhance and customize
- Branded shareable profile with SuburbMates watermark
- Email notifications throughout the process

**Profile Personalization System:** ✅ IMPLEMENTED
- **Visual Customization:** Custom color schemes, layout themes, logo placement
- **Content Enhancement:** Custom descriptions, service highlights, photo galleries
- **Social Integration:** Social media links, customer testimonials, reviews showcase
- **Contact Optimization:** Multiple contact methods, service area mapping, business hours
- **Branding Elements:** ProfileWatermark component with SuburbMates logo/watermark
- **Sharing Tools:** 
  - Social media optimized sharing (Facebook, Twitter, LinkedIn, WhatsApp)
  - QR code generation with offline tracking
  - Embed code generator (iframe, widget, styled card formats)
  - Dynamic OG image generation with business branding
  - UTM parameter tracking for conversion analytics
  - Direct link sharing with branded social cards

**Authentication Flow:** ✅ IMPLEMENTED
- Simplified signup focused on lead generation
- Email confirmation via Resend (not default Supabase)
- Role-based access (business owners, admin, potential customers)
- Session management with middleware
- Admin verification system with role-based permissions

**Search & Discovery:** ✅ IMPLEMENTED
- Melbourne suburb-specific filtering (603 suburbs included)
- Business category search with comprehensive categories
- Auto-populated business listings for claiming
- Advanced search with multiple filters
- SEO-optimized business profiles with structured data

**Lead Management:** ✅ IMPLEMENTED
- Contact form integration on shareable profiles
- ContactBusinessForm modal with inquiry capture
- Lead tracking and analytics for business owners
- Email notifications for new leads via branded templates
- Business dashboard for lead management
- UTM tracking and conversion analytics
- Inquiry status management (NEW, CONTACTED, CONVERTED, CLOSED)

**Admin Management System:** ✅ COMPREHENSIVE PLATFORM CONTROL
- **Multi-Tab Dashboard**: Pending, Approved, Rejected, Duplicates business management
- **Verification Workflows**: EMAIL_DOMAIN, PHONE_OTP, DOCUMENT claim verification
- **AI-Assisted Processing**: Confidence scoring for automated decision support
- **Bulk Operations**: Mass approval/rejection with individual audit trails
- **Quality Monitoring**: 0-100 algorithmic scoring with improvement recommendations
- **Lead Analytics**: UTM attribution, conversion tracking, upselling identification
- **Security & Compliance**: Complete audit trails, role-based access, incident response
- **Performance Metrics**: <24h approval time, >95% accuracy, >98% claim verification accuracy

### Important Files and Conventions

#### Configuration
- **`middleware.ts`** - Next.js middleware for auth and routing
- **`next.config.mjs`** - Next.js configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration with custom theme
- **`components.json`** - Shadcn/ui configuration
- **`prisma/schema.prisma`** - Database schema

#### Environment Variables
**Production-Ready Configuration (80% Complete)**

**Core Services (✅ Ready):**
```env
# Database & Authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url

# Professional Email System
RESEND_API_KEY=re_Ah1VBDin_JdzCdNbapff3tpBaXqEu5gVM
AUTH_EMAIL_FROM="SuburbMates <no-reply@suburbmates.com.au>"
FROM_EMAIL=no-reply@suburbmates.com.au
SENDER_DOMAIN=suburbmates.com.au
ADMIN_EMAILS=admin@suburbmates.com.au,ops@suburbmates.com.au

# Australian Business Integration
ABR_API_GUID=9c72aac8-8cfc-4a77-b4c9-18aa308669ed
ABN_LOOKUP_GUID=9c72aac8-8cfc-4a77-b4c9-18aa308669ed
```

**Analytics & Automation (✅ Ready):**
```env
# Comprehensive Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-39WHBF8F5Y
GA4_API_SECRET=GCcvsbzSS2G0aiZ4aaS2xw

# Rate Limiting & Caching
UPSTASH_REDIS_REST_URL=https://stunning-airedale-9666.upstash.io
UPSTASH_REDIS_REST_TOKEN=ASXCAAImcDI4ZjQ1YzRmYjcyNTI0MDExODk3N2U1...

# Security & Agent Access
AGENT_TOKEN=b43fc88bdc1029435cdec4bcbc9fa4229aa4a85f4083e1a4fce5dfeb25063aae

# Error Tracking & Monitoring
SENTRY_DSN=https://50c3ee3d68fde843f61e1f25fd95bd64@o4...
NEXT_PUBLIC_SENTRY_DSN=https://50c3ee3d68fde843f61e1f25fd95bd64@o4...
```

**Optional Integrations (⏳ Placeholders):**
```env
# Maps & Geolocation (Optional)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiY2FybGdhbGxhcmRvIiwiYSI6ImNtZTV0aHNjcTB3eW0ydnBycHpkbjU4NngifQ...
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=https://suburbmates.com.au  # or http://localhost:3000
APP_NAME="SuburbMates - Melbourne Business Network"
```

**Setup Status:**
- ✅ **Core Platform**: 100% configured and ready
- ✅ **Email System**: Professional branded emails via Resend
- ✅ **Analytics**: Dual GA4 tracking operational
- ✅ **Security**: Rate limiting, monitoring, audit logging
- ⏳ **Optional**: Maps integration (Mapbox configured, Google Maps optional)

#### Email System
- **Custom email templates:** Professional branded emails from `noreply@suburbmates.com.au`
- **Email management scripts:** Use `npm run email:*` commands
- **Resend integration:** Replaces default Supabase emails for better deliverability

### Development Guidelines

#### Database Changes ✅ DIRECTORY ADMIN COMPLIANT
1. Always modify `prisma/schema.prisma` first
2. Run `npx prisma generate` to update client
3. Use `npx prisma db push` for schema changes in development
4. Create proper migrations for production
5. Run `npm run validate:domain` to check for SSOT compliance

**Directory Admin Schema Features:**
- **Business Visibility Rules:** Only `approvalStatus = 'APPROVED'` appear in public
- **Badge Logic:** "Verified" badge only when `abnStatus = 'VERIFIED'`
- **Quality Scoring:** 0-100 algorithm based on completeness, recency, reviews
- **Deduplication:** Strict (phone/domain/name+suburb) and loose (Levenshtein) matching
- **Audit Trail:** All administrative actions logged with metadata

**Enhanced Database Models (Complete Admin Spec):**
- **Core Entities:**
  - `User`: Authenticated account holders (USER/ADMIN roles) who own/manage Business profiles
  - `Customer`: Unauthenticated prospective clients (stored in Lead/Inquiry models)
  - `Business`: Core entity with comprehensive admin fields:
    - Status: `abnStatus` (NOT_PROVIDED | PENDING | VERIFIED | INVALID | EXPIRED)
    - Approval: `approvalStatus` (PENDING | APPROVED | REJECTED) - default PENDING
    - Origin: `source` (MANUAL | CSV | AUTO_ENRICH | CLAIMED)
    - Quality: `qualityScore` (0-100 algorithm: completeness 40% + recency 20% + reviews 20% + verification 20%)
    - Duplicates: `duplicateOfId` self-referencing for duplicate management
    - Ownership: `ownerId` optional (users can own multiple businesses)
- **Lead Management:**
  - `Lead`: Status tracking (NEW → CONTACTED → QUALIFIED → CONVERTED → CLOSED)
  - `Inquiry`: Enhanced lead capture with UTM tracking, AI qualification, marketing attribution
- **Verification Systems:**
  - `OwnershipClaim`: Multi-method verification (EMAIL_DOMAIN | PHONE_OTP | DOCUMENT)
  - `AuditLog`: Complete activity trails with actor tracking and metadata
  - `FeatureFlag`: Dynamic A/B testing and gradual feature rollout

#### Component Development ✅ EXPANDED
- Use Shadcn/ui base components from `/components/ui`
- Create feature-specific components in `/features/[domain]/components`
- Business-specific components in `/components/business`
- Admin components in `/components/admin`
- Shared components go in `/components/shared`
- Follow TypeScript strict mode conventions
- Adhere to SSOT conventions (see `docs/SSOT.md`):
  - Use `ApprovalStatus` enum values (not legacy `verified` field)
  - Use `isAbnVerified(abnStatus)` for verification checks
  - All audit logging must use `logAuditEvent()` utility
  - Admin checks must use `checkAdminAccess()` helper

**Enhanced Components (Directory Admin Spec):**
- **Business Components:**
  - `ShareableProfileView` - Branded profile display with watermark
  - `ProfileWatermark` - SuburbMates branding overlay
  - `SocialShareButtons` - Multi-platform sharing with GA4 tracking
  - `ContactBusinessForm` - Lead capture with rate limiting and moderation
  - `QRCodeGenerator` - QR code creation with offline tracking
  - `EmbedCodeGenerator` - Multiple embed formats (iframe, widget, card)
- **Admin Components (NEW):**
  - `AdminBusinessDashboard` - Multi-tab interface (Pending, Approved, Rejected, Duplicates)
  - `BulkActionsToolbar` - Approve/reject multiple businesses
  - `DuplicateDetectionPanel` - Merge duplicate businesses
  - `QualityScoringDisplay` - Visual quality metrics
  - `AuditTrailView` - Complete action history
- **Analytics Components:**
  - GA4 tracking hooks for all user interactions
  - Server-side event tracking for critical business events

#### API Routes ✅ EXPANDED
- API routes in `/app/api` follow REST conventions
- Use Zod schemas for request validation
- Include proper error handling and logging
- Authentication middleware applied automatically

**Enhanced API Routes (Directory Admin Spec):**
- `/api/business/register` - Business registration with approval workflow
- `/api/business/claim` - Ownership claim submission with verification
- `/api/business/inquiry` - Lead capture with rate limiting and moderation
- `/api/admin/businesses` - Enhanced admin business management
- `/api/admin/claims` - Bulk claim processing and approval
- `/api/admin/duplicates` - Duplicate detection and merging
- `/api/admin/import` - CSV import with deduplication
- `/api/admin/export` - Filtered CSV export
- `/api/analytics/track` - Server-side GA4 event tracking
- `/api/og` - Dynamic OG image generation with business branding
- All routes include rate limiting, audit logging, and GA4 tracking

#### Testing Strategy
- Unit tests for utilities and services
- Component tests using Testing Library
- Integration tests for API routes
- E2E tests with Playwright for critical flows

### Melbourne-Specific Features

- **Suburb data:** Comprehensive Melbourne suburb database (603 suburbs) for service areas
- **Local business categories:** Australian business classification system with 33+ categories
- **Auto-populated listings:** Pre-seeded business data for claiming workflow
- **Service area mapping:** Melbourne metropolitan area focus with postcode validation
- **ABN Integration:** Optional Australian Business Number verification via ABR API
- **Phone Validation:** Australian phone number format validation (+61 support)
- **Lead generation optimization:** Quality scoring prioritizes local and complete businesses
- **Rules-based Search Reranker:** Locality boost (+30), completion boost (0-20), rating boost (0-20)

### Directory Admin Implementation

#### Business Management Features ✅ IMPLEMENTED
- **Approval Workflow:** All new businesses default to PENDING status
- **ABN Verification:** Optional verification with NOT_PROVIDED | PENDING | VERIFIED | INVALID | EXPIRED
- **Quality Scoring:** 0-100 algorithm: completeness + recency + reviews + verification bonuses
- **Deduplication Engine:** Strict matching (phone/domain/name+suburb) + loose matching (80% similarity)
- **Bulk Operations:** Admin can approve/reject multiple businesses simultaneously
- **Source Tracking:** MANUAL | CSV | AUTO_ENRICH | CLAIMED for business origin
- **Badge System:** "Verified" for ABN verified, "Community-listed" for approved without ABN

#### CLI Management Tools ✅ IMPLEMENTED
- **Import/Export:** Full CSV support with dry-run capability and deduplication
- **Business Management:** Command-line approve/reject with reason logging
- **Statistics:** Comprehensive directory analytics and reporting
- **Data Validation:** Australian phone/ABN format validation
- **Audit Logging:** All CLI operations logged to database with metadata

#### Analytics & Tracking ✅ IMPLEMENTED
- **Dual GA4 Tracking:** Client-side (gtag) + server-side (Measurement Protocol)
- **Event Taxonomy:** 25+ event types covering user journeys, business owner flows, admin operations
- **Critical Event Guarantee:** Server-side tracking for leads, claims, registrations
- **Rate Limiting:** Upstash Redis with configurable limits (leads: 3/hour, registrations: 2/day)
- **Content Moderation:** Spam detection, profanity filtering, disposable email blocking

### Common Tasks

#### Adding New Personalization Option
1. Update personalization schema in `types/business/profile.ts`
2. Create UI component in `/features/business-profiles/components/`
3. Add to profile editor interface
4. Update database schema if needed
5. Test sharing functionality with new option

#### Adding New Business Category
1. Update `lib/constants/business-categories.ts`
2. Update auto-population scripts for new category
3. Add validation in Zod schemas
4. Update search filters and claiming logic
5. Test both create and claim workflows

#### Implementing Shareable Profile Feature
1. Create profile sharing component with SuburbMates branding
2. Add social media optimization (OG tags, Twitter cards)
3. Implement tracking for profile visits and lead conversion
4. Add sharing analytics to business dashboard
5. Test across multiple social platforms

## Deployment Notes

- **Platform:** Deployed on Vercel
- **Database:** Uses Supabase PostgreSQL
- **Email:** Resend service with custom domain
- **Environment:** Production environment variables set in Vercel dashboard
- **Domain:** Configure DNS for email delivery (SPF, DKIM, DMARC records)

## Support and Debugging

- **Logs:** Check Vercel function logs for server issues
- **Database:** Use Prisma Studio for database inspection
- **Email:** Monitor delivery in Resend dashboard
- **Performance:** Use Next.js built-in analytics
- **Errors:** Error tracking configured for production

This architecture supports the unique needs of Melbourne businesses while maintaining scalability and developer experience.

---

## ✅ DIRECTORY ADMIN SPECIFICATION IMPLEMENTATION (Completed)

### Core Infrastructure Upgrades

1. **Enhanced Database Schema** (Perfect Spec Alignment)
   - Updated Business model with all directory admin fields
   - New enums: AbnStatus, ApprovalStatus, BusinessSource
   - Self-referencing duplicateOf relationship
   - Audit logging with business relationships
   - Feature flag system for A/B testing

2. **Complete CLI Management System** (`scripts/directory-cli.ts`)
   - All 8 specified commands with exact parameter matching
   - Deduplication algorithms (strict + loose)
   - Australian data validation (phone, ABN, suburbs)
   - Comprehensive error handling and audit logging
   - Production-ready safeguards and dry-run capabilities

3. **Advanced Analytics Implementation**
   - Client-side GA4 helper (`lib/analytics/ga4-client.ts`)
   - Server-side GA4 with Measurement Protocol (`lib/analytics/ga4-server.ts`)
   - 50+ predefined event types covering all user journeys
   - Critical business events always tracked server-side
   - Development mode logging with production tracking

4. **Rate Limiting & Content Moderation**
   - Upstash Redis sliding window rate limiting
   - Configurable limits per endpoint type
   - Spam detection with multiple heuristics
   - Profanity filtering and disposable email blocking
   - Australian business data validation

### Business Logic Enhancements

5. **Business Visibility & Badge System**
   - Only `approvalStatus = 'APPROVED'` businesses appear publicly
   - "Verified" badge exclusive to `abnStatus = 'VERIFIED'`
   - "Community-listed" chip for approved non-ABN businesses
   - Quality scoring algorithm with weighted completeness

6. **Advanced Search & SEO**
   - Rules-based reranker with locality/quality/rating boosts
   - Search pages with `noindex,follow` when filtered
   - Dynamic OG image generation via edge routes
   - JSON-LD structured data for business profiles
   - Sitemap generation for approved businesses only

### Administrative Features

7. **Enhanced Admin Capabilities**
   - Multi-tab dashboard: Pending, Approved, Rejected, Duplicates
   - Bulk approve/reject operations with reason tracking
   - Duplicate detection with manual merge capabilities
   - Complete audit trail for all administrative actions
   - Quality score monitoring and business source tracking

## ✅ LEGACY ENHANCEMENTS (Previously Completed)

### Core Business Workflows Implemented

1. **Complete Business Registration System** (`/register-business`)
   - Multi-step wizard with ProfileCustomizer integration
   - Melbourne suburb auto-completion (603 suburbs)
   - Comprehensive business category selection
   - Email confirmation via Resend service
   - Audit logging and analytics tracking

2. **Business Claiming System** (`/claim/[businessId]`)
   - Multiple verification methods (email, phone, document, ABN)
   - Admin review workflow with AdminVerificationDashboard
   - Email notifications for all claim status changes
   - Automatic business ownership transfer upon approval

3. **Enhanced Sharing & Marketing Tools** (`/business/[slug]/share`)
   - Social media sharing (Facebook, Twitter, LinkedIn, WhatsApp)
   - QR code generation with offline conversion tracking
   - Embed code generator (3 formats: iframe, widget, styled card)
   - Dynamic OG image generation with business branding
   - UTM parameter tracking for marketing analytics

4. **Lead Management & Customer Inquiries**
   - ContactBusinessForm modal integration
   - UTM tracking and conversion analytics
   - Branded email notifications for business owners
   - Inquiry status management workflow

5. **Admin Management System**
   - Full claim verification dashboard
   - Role-based access control (ADMIN role)
   - Bulk claim processing capabilities
   - Comprehensive audit logging

### Technical Infrastructure Added

- **Database Models:** OwnershipClaim, Inquiry, AuditLog with relationships
- **API Routes:** 8+ new endpoints for business workflows and admin functions
- **Components:** 10+ new business and admin components
- **Email System:** Branded email templates with Resend integration
- **Utilities:** Slug generation, audit logging, structured data, UTM tracking

### Marketing & SEO Enhancements

- **Social Media Optimization:** Dynamic OG images for all business profiles
- **Offline Marketing:** QR code generation with tracking parameters
- **Website Integration:** Multiple embed code formats for partner sites
- **Conversion Tracking:** UTM parameters and pixel integration ready
- **SEO:** Structured data for enhanced search engine visibility

### Current Status: Directory Admin Specification Complete ✅

All directory management features from the specification are implemented and production-ready:

**Core Directory Management:**
- ✅ ABN optional verification with Australian Business Register integration
- ✅ Approval workflow (PENDING → APPROVED/REJECTED) with admin controls
- ✅ Quality scoring algorithm (0-100) with multiple factors
- ✅ Deduplication engine with strict and loose matching
- ✅ Business source tracking and bulk import capabilities

**CLI Management Tools:**
- ✅ Complete command suite: list, import, export, approve, reject, stats
- ✅ CSV import/export with filtering and deduplication
- ✅ Dry-run capabilities and production safeguards
- ✅ Australian data validation and normalization

**Analytics & Tracking:**
- ✅ Dual GA4 tracking (client + server-side)
- ✅ Comprehensive event taxonomy (50+ event types)
- ✅ Critical business event guarantee via server-side tracking
- ✅ Rate limiting with Upstash Redis sliding windows

**Content & Security:**
- ✅ Content moderation with spam detection and profanity filtering
- ✅ Rate limiting per endpoint (leads: 3/hour, registrations: 2/day)
- ✅ Australian business validation (phone, ABN, suburbs)
- ✅ Disposable email domain blocking

**Admin Interface:**
- ✅ Multi-tab dashboard with bulk operations
- ✅ Duplicate detection and merging capabilities
- ✅ Complete audit trail with action history
- ✅ Quality score monitoring and source tracking

### Production Deployment Checklist

1. **Environment Configuration**
   ```bash
   # Required for directory admin features
   NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   GA4_API_SECRET=your_measurement_protocol_secret
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ABR_API_KEY=your_abr_api_key
   ```

2. **Database Migration**
   - Run `npx prisma db push` to apply directory admin schema
   - Verify all new enums and relationships
   - Test CLI commands with sample data

3. **Analytics Verification**
   - Confirm GA4 property setup with Measurement Protocol
   - Test server-side event tracking
   - Verify rate limiting functionality

4. **Admin Access Setup**
   - Configure admin user roles in database
   - Test bulk operations and audit logging
   - Verify duplicate detection algorithms
