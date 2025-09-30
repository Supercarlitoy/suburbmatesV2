# SuburbMates Comprehensive Terminology Dictionary

**Last Updated:** September 30, 2025  
**Version:** 2.0  
**Purpose:** Unified reference for all SuburbMates entities, workflows, and terminology

---

## 🎯 Core Business Entities

### User
- **Definition**: Authenticated account holder who owns/manages Business profiles on the platform
- **Database Model**: `User` table with fields: id, email, role (USER/ADMIN), createdAt
- **Authentication**: Supabase-managed accounts with email confirmation via Resend
- **Relationship**: One User can own multiple Businesses via `ownerId` foreign key
- **Roles**: 
  - `USER`: Business owners who manage their profiles and respond to leads
  - `ADMIN`: Platform administrators with access to approval workflows and analytics
- **Lifecycle**: Registration → Email Confirmation → Profile Creation → Business Management

### Customer
- **Definition**: Prospective clients who submit inquiries to businesses (NOT authenticated platform users)
- **Database Storage**: Contact details stored in `Lead` and `Inquiry` models
- **Relationship**: Customers interact with Businesses but don't have User accounts
- **Contact Methods**: ContactBusinessForm, phone calls, direct email, social media
- **Tracking**: UTM parameters, AI qualification scores, conversion status, source attribution
- **Admin Value**: Rich data source for upselling analysis and platform optimization

### Business
- **Definition**: Core entity representing a Melbourne-based business with a shareable professional profile
- **Database Model**: `Business` table with comprehensive fields including:
  - Basic Info: name, slug, email, phone, website, bio, suburb
  - Verification: abn, abnStatus, approvalStatus, verified
  - Management: ownerId, source, qualityScore, duplicateOfId
  - Customization: theme, layout settings via BusinessProfileCustomization
- **Lifecycle**: Registration → Admin Approval → Profile Customization → Publishing → Lead Generation
- **Approval Workflow**: PENDING → APPROVED/REJECTED (only approved appear publicly)
- **Ownership States**: 
  - **Unclaimed**: Auto-populated directory listings available for claiming
  - **Claimed**: Owned by authenticated User with full customization access
- **Verification Levels**:
  - **Basic Approved**: Admin-approved without ABN verification
  - **ABN Verified**: Australian Business Number verified via ABR API
- **Quality Scoring**: 0-100 algorithm based on completeness, recency, reviews, verification

---

## 📋 Lead Generation & Customer Management

### Lead
- **Definition**: Customer inquiry captured through the system with status tracking and management workflow
- **Database Model**: `Lead` table with progression tracking
- **Status Progression**: NEW → CONTACTED → QUALIFIED → CONVERTED → CLOSED
- **Sources**: 
  - `PROFILE`: Direct contact from business profile page
  - `SEARCH`: Contact from search results
  - `FEED`: Contact from content feed
  - `SHARE`: Contact via shared profile links
- **Management**: Business owners track via `/dashboard/leads`, admin can analyze patterns
- **Integration**: Email notifications, CRM workflows, conversion tracking

### Inquiry
- **Definition**: Enhanced lead capture system with UTM tracking, AI qualification, and advanced analytics
- **Database Model**: `Inquiry` table with rich metadata and tracking capabilities
- **Fields**: businessId, name, email, phone, message, utm (JSON), source, createdAt
- **AI Integration**: Automatic lead qualification, spam detection, priority scoring
- **UTM Tracking**: Complete marketing attribution (source, medium, campaign, referrer)
- **Admin Analytics**: Conversion rates, lead quality scores, upselling opportunities
- **Workflow**: Submission → AI Qualification → Business Notification → Follow-up Tracking

---

## 🔐 Authentication & Verification

### OwnershipClaim
- **Definition**: Verification request workflow when a User claims an existing unclaimed Business
- **Database Model**: `OwnershipClaim` linking User to Business with verification evidence
- **Status Flow**: PENDING → APPROVED/REJECTED → CLOSED
- **Verification Methods**:
  - `EMAIL_DOMAIN`: Business email domain matching
  - `PHONE_OTP`: Phone number verification via SMS
  - `DOCUMENT`: Document upload verification (ABN certificate, utility bills)
- **Evidence Storage**: JSON field for verification documents and proof
- **Admin Review**: Manual verification process via AdminVerificationDashboard

### AuditLog
- **Definition**: Comprehensive activity trail for all business actions, user activities, and admin operations
- **Database Model**: `AuditLog` with actor tracking and metadata
- **Fields**: actorId, action, target, meta (JSON), ipAddress, userAgent, createdAt
- **Use Cases**: Security monitoring, compliance tracking, debugging, admin oversight
- **Action Types**: Business creation, profile updates, claim processing, admin approvals
- **Relationships**: Links to Business entities for complete audit trails

---

## 🎨 Content & Customization

### Content
- **Definition**: Posts, updates, and announcements created by Business owners for their profiles
- **Database Model**: `Content` table linked to Business with type classification
- **Content Types**:
  - `POST`: General business posts and updates
  - `UPDATE`: Business news and announcements  
  - `ANNOUNCEMENT`: Special promotions or events
- **Features**: Rich text, image galleries, tags, public/private visibility
- **SEO Integration**: Structured data, social media optimization

### BusinessProfileCustomization
- **Definition**: Visual and layout personalization settings for shareable business profiles
- **Database Model**: One-to-one relationship with Business for theme and layout storage
- **Customization Options**:
  - **Layout**: CLASSIC, BOLD, COMPACT profile layouts
  - **Accent Colors**: BLUE, MINT, AMBER, PURPLE, RED, GREEN theme colors
  - **Content**: Custom tagline, service highlights, image gallery
  - **Social Integration**: Facebook, Instagram, LinkedIn profile links
  - **Branding**: SuburbMates watermark opacity (0.1-0.3)
- **Live Preview**: Real-time customization via ProfileCustomizer component

---

## 🏢 Directory Management & Admin

### ApprovalStatus
- **Enum Values**: PENDING, APPROVED, REJECTED
- **Business Rules**: 
  - New businesses default to PENDING
  - Only APPROVED businesses appear in public search
  - REJECTED businesses remain in admin interface for review
- **Admin Workflow**: Bulk approval/rejection via AdminBusinessDashboard

### AbnStatus  
- **Enum Values**: NOT_PROVIDED, PENDING, VERIFIED, INVALID, EXPIRED
- **Integration**: Australian Business Register (ABR) API verification
- **Badge Logic**: 
  - "Verified" badge only when ABN_VERIFIED
  - "Community-listed" chip for APPROVED without ABN
- **Business Rules**: ABN verification is optional but enhances credibility

### BusinessSource
- **Enum Values**: MANUAL, CSV, AUTO_ENRICH, CLAIMED
- **Tracking**: Origin of business listings for analytics and quality control
- **Use Cases**:
  - `MANUAL`: Hand-entered by admin or business owner
  - `CSV`: Bulk imported via CLI tools
  - `AUTO_ENRICH`: Automatically populated from external sources
  - `CLAIMED`: Created through business claiming process

---

## 🔍 Search & Discovery

### QualityScore
- **Definition**: 0-100 algorithmic scoring system for business profile completeness and credibility
- **Calculation Algorithm**:
  ```
  qualityScore = weightedCompleteness(images, hours, services, description) 
               + recencyBonus(lastUpdated)
               + reviewBonus(averageRating, reviewCount)
               + verificationBonus(abnStatus, emailVerified)
  ```
- **Impact**: Influences search ranking via rules-based reranker
- **Admin Tools**: Quality score monitoring and improvement recommendations

### Duplicate Detection
- **Strict Matching**: Same normalized phone OR website domain OR {name + suburb}
- **Loose Matching**: Levenshtein name similarity (80%+) within same suburb
- **Admin Interface**: Duplicate detection panel for manual review and merging
- **Database Field**: `duplicateOfId` for linking duplicate entries

---

## 📊 Analytics & Tracking

### UTM Tracking
- **Definition**: Marketing attribution system capturing campaign performance data
- **Parameters**: utm_source, utm_medium, utm_campaign, utm_content, utm_term
- **Storage**: JSON field in Inquiry model for complete attribution tracking
- **Use Cases**: Conversion tracking, marketing ROI, admin upselling analysis

### GA4 Integration
- **Client-Side**: gtag implementation for user interaction tracking
- **Server-Side**: Measurement Protocol for critical business events
- **Event Types**: 50+ predefined events covering user journeys, business workflows, admin operations
- **Guaranteed Tracking**: Critical events (leads, registrations, claims) always tracked server-side

---

## 🔧 Technical Infrastructure

### FeatureFlag
- **Definition**: Dynamic configuration system for A/B testing and feature toggling
- **Database Model**: `FeatureFlag` with key-value boolean storage
- **Use Cases**: Gradual feature rollouts, experimental features, emergency toggles
- **Admin Control**: Real-time feature management via admin panel

### Rate Limiting
- **Implementation**: Upstash Redis with sliding window algorithm
- **Limits**: Configurable per endpoint type (leads: 3/hour, registrations: 2/day)
- **Protection**: Spam prevention, abuse mitigation, system stability
- **Integration**: Automatic enforcement on lead submission and registration endpoints

---

## 🚀 Core Workflows

### Workflow 1: Create New Business Profile
**User Journey**: Discovery → Registration → Profile Creation → Personalization → Publishing → Sharing
- **Route**: `/register-business` - Multi-step wizard interface
- **Process**: Business details → Location/Services → Contact/Hours → Media upload → Review/Publish
- **Outcome**: Professional shareable profile with SuburbMates branding

### Workflow 2: Claim Existing Business Profile  
**User Journey**: Discovery → Claim Request → Verification → Profile Access → Personalization → Publishing → Sharing
- **Route**: `/claim/[businessId]` - Business verification and claiming interface
- **Process**: Find business → Confirm ownership → Provide verification → Admin review → Approved access
- **Outcome**: Control of existing profile with full customization capabilities

---

## 📈 Admin Upselling Opportunities

The platform provides comprehensive data for identifying upselling opportunities:

### Lead Analytics
- **Volume Analysis**: Businesses receiving high inquiry volumes
- **Conversion Tracking**: Inquiry-to-customer conversion rates
- **Quality Scoring**: AI-qualified lead prioritization
- **Source Attribution**: Most effective marketing channels per business

### Profile Optimization  
- **Engagement Metrics**: Profile views, shares, contact form submissions
- **Quality Scores**: Businesses needing profile enhancement
- **Customization Usage**: Under-utilized personalization features
- **SEO Performance**: Search visibility and ranking improvements

### Premium Feature Identification
- **High-Performing Businesses**: Ready for advanced features
- **Verification Candidates**: Eligible for ABN verification services
- **Marketing Services**: Businesses with strong lead generation potential
- **Consultation Opportunities**: Profile optimization and growth strategies

---

## 🔄 Status Transitions

### Business Lifecycle
```
Registration → PENDING → Admin Review → APPROVED/REJECTED → Published Profile
```

### Claim Workflow
```
Claim Request → PENDING → Verification → APPROVED/REJECTED → Profile Access → CLOSED
```

### Lead Management
```
Inquiry → NEW → CONTACTED → QUALIFIED → CONVERTED → CLOSED
```

### ABN Verification
```
Submission → PENDING → API Verification → VERIFIED/INVALID/EXPIRED
```

---

## 📝 Data Relationships

### Core Entity Relationships
- User (1) → Business (Many) via `ownerId`
- Business (1) → Lead (Many) via `businessId`  
- Business (1) → Inquiry (Many) via `businessId`
- Business (1) → Content (Many) via `businessId`
- User + Business → OwnershipClaim (Many) for verification tracking
- Business (1) → BusinessProfileCustomization (1) for themes/layouts
- All Entities → AuditLog (Many) for complete activity tracking

### Admin Access Patterns
- Admins can view all Businesses regardless of approval status
- Lead/Inquiry data accessible through Business relationships
- Quality scores and duplicate detection available for optimization
- Complete audit trails for compliance and debugging
- UTM and conversion data for upselling analysis

---

**This terminology dictionary serves as the single source of truth for all SuburbMates entity definitions, relationships, and business logic. All development, documentation, and admin training should reference these standardized terms and definitions.**