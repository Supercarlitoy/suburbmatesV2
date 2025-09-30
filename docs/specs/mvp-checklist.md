# 📋 SuburbMates MVP Master Checklist

## 🎯 Goal
Generate **maximum verified leads** through two core workflows:
1. **Create New Business Profile** 
2. **Claim Existing Business Profile**

Both workflows end with **shareable professional profiles** with SuburbMates branding.

---

## 🔄 Core Workflows Status

### Workflow 1: Create New Business Profile
```
User Journey: Discovery → Registration → Profile Creation → Personalization → Publishing → Sharing
Status: [ ] Not Started [ ] In Progress [ ] Completed [ ] Verified
```

### Workflow 2: Claim Existing Business Profile  
```
User Journey: Discovery → Claim Request → Verification → Profile Access → Personalization → Publishing → Sharing
Status: [ ] Not Started [ ] In Progress [ ] Completed [ ] Verified
```

---

## 📋 PHASE 0: CRITICAL ONBOARDING FIXES (Week 1)

### 🔐 Authentication & Email System
- [ ] **Create `/auth/check-email` page** 
  - [ ] RSC + client components
  - [ ] Clear instructions and next steps
  - [ ] Resend email option
  - **Verification:** User sees branded page after signup
  
- [ ] **Configure Supabase SMTP with Resend**
  - [ ] Update SMTP settings to use Resend
  - [ ] Sender: `no-reply@suburbmates.com.au`
  - [ ] Test email delivery to Gmail/Outlook
  - **Verification:** Branded emails received in inbox (not spam)

- [ ] **Brand email templates**
  - [ ] Signup confirmation template
  - [ ] Magic link template  
  - [ ] Password reset template
  - [ ] SuburbMates navy/amber colors
  - [ ] Professional styling with logo
  - **Verification:** All emails match brand guidelines

- [ ] **Fix form redirects**
  - [ ] signUp redirects to `/auth/check-email`
  - [ ] signInWithOtp redirects to `/auth/check-email`
  - [ ] Clear error states for invalid emails
  - [ ] Success animations/feedback
  - **Verification:** Forms work without console errors

- [ ] **DNS & Deliverability**
  - [ ] Verify domain in Resend
  - [ ] Configure SPF, DKIM, DMARC records
  - [ ] Test deliverability across email providers
  - **Verification:** SPF/DKIM/DMARC all pass, emails in inbox

### 📊 Analytics & Audit Trail
- [ ] **Implement analytics events**
  - [ ] sign_up_started
  - [ ] check_email_shown  
  - [ ] email_clicked
  - [ ] session_established
  - **Verification:** Events firing in analytics dashboard

- [ ] **Create AuditLog model**
  - [ ] Log signup events
  - [ ] Log claim transitions
  - [ ] Log profile changes
  - **Verification:** Audit logs appearing in database

---

## 📋 PHASE 1: CORE WORKFLOW ROUTES (Week 2)

### 🏗️ Essential Routes & Pages

- [ ] **Create registration wizard `/register-business`**
  - [ ] Multi-step form (Business Details → Location → Services → Preview)
  - [ ] Form validation with Zod schemas
  - [ ] Progress indicator
  - [ ] Auto-save functionality
  - **Verification:** Can complete full registration flow

- [ ] **Create claim flow `/claim/[businessId]`**
  - [ ] Business verification step
  - [ ] Ownership verification (email domain match)
  - [ ] Fallback verification options
  - [ ] Success/rejection states
  - **Verification:** Can claim and verify business ownership

- [ ] **Update existing business profile pages**
  - [ ] Use new theme system
  - [ ] Add watermark integration
  - [ ] Optimize for sharing
  - **Verification:** Profiles render with themes and branding

### 🗄️ Database Schema Updates

- [ ] **Create OwnershipClaim model**
  - [ ] Link to Business model
  - [ ] Status: UNCLAIMED → PENDING → APPROVED|REJECTED → CLOSED
  - [ ] Verification data storage
  - **Verification:** Claims can be created and status updated

- [ ] **Create Inquiry model**
  - [ ] Capture name/email/message + businessId
  - [ ] Link to business profiles
  - [ ] Status tracking
  - **Verification:** Inquiries save and display correctly

- [ ] **Extend ProfileTheme model** (if needed)
  - [ ] Theme preset storage
  - [ ] Color overrides with AA contrast guard
  - [ ] Custom branding options
  - **Verification:** Themes apply and save correctly

---

## 📋 PHASE 2: SHAREABLE PROFILE SYSTEM (Week 3)

### 🎨 Profile Display Components

- [ ] **Build ShareableProfile.tsx component**
  - [ ] Dynamic theme application
  - [ ] Layout rendering from existing system
  - [ ] Responsive design (mobile-first)
  - [ ] SuburbMates watermark integration
  - **Verification:** Profiles render beautifully on all devices

- [ ] **Create ProfileWatermark.tsx**
  - [ ] Subtle but visible SuburbMates branding
  - [ ] Configurable opacity (0.1-0.3)
  - [ ] Clickable link back to SuburbMates
  - [ ] Respects profile theme colors
  - **Verification:** Watermark visible and clickable

- [ ] **Build SocialShareCard.tsx**
  - [ ] Optimized for social media sharing
  - [ ] Dynamic OG image generation
  - [ ] Twitter card optimization
  - [ ] Professional layout
  - **Verification:** Social media previews look professional

### 🔗 Sharing Routes & Meta

- [ ] **Create `/business/[slug]/share` route**
  - [ ] Optimized sharing version
  - [ ] Dynamic OG meta tags
  - [ ] Clean URLs for sharing
  - **Verification:** Shareable URLs work and look good

- [ ] **Dynamic OG image generation `/api/og`**
  - [ ] Business information display
  - [ ] Selected theme colors
  - [ ] SuburbMates branding
  - [ ] Professional layout
  - **Verification:** OG images generate correctly

- [ ] **Add meta tags to profile pages**
  - [ ] og:title, og:description, og:image
  - [ ] twitter:card, twitter:site
  - [ ] Canonical URLs
  - **Verification:** Social media previews show correctly

---

## 📋 PHASE 3: PERSONALIZATION SYSTEM (Week 4)

### ✏️ Enhanced Profile Customizer

- [ ] **Extend existing ProfileCustomizer.tsx**
  - [ ] Add watermark opacity control
  - [ ] Social sharing preview
  - [ ] Content block toggles
  - [ ] Advanced theme options
  - **Verification:** All customization options work

- [ ] **Implement draggable content blocks**
  - [ ] Install @dnd-kit libraries
  - [ ] Hero section customization
  - [ ] Services showcase
  - [ ] Photo gallery/portfolio
  - [ ] Customer testimonials
  - [ ] Contact information
  - [ ] Business hours & location
  - **Verification:** Content blocks can be reordered

- [ ] **Add interactive elements**
  - [ ] Contact form integration
  - [ ] Booking widget (if applicable)
  - [ ] Image carousels
  - [ ] Click-to-call buttons
  - **Verification:** Interactive elements function correctly

### 🎨 Advanced Theme System

- [ ] **Extend PROFILE_THEMES with animations**
  - [ ] Subtle hover effects
  - [ ] Smooth transitions
  - [ ] Loading animations
  - **Verification:** Animations enhance UX without being distracting

- [ ] **Add layout variations**
  - [ ] Spacing options (compact/standard/spacious)
  - [ ] Card styles (flat/elevated/glass)
  - [ ] Typography scales
  - **Verification:** Layout variations apply correctly

---

## 📋 PHASE 4: SHARING & ANALYTICS (Week 5)

### 📤 Sharing Tools

- [ ] **Build share button components**
  - [ ] Facebook sharing
  - [ ] LinkedIn sharing
  - [ ] Instagram story template
  - [ ] Copy link functionality
  - **Verification:** All sharing methods work

- [ ] **Create sharing utilities**
  - [ ] QR code generation
  - [ ] Embed code generator
  - [ ] Business card PDF export
  - **Verification:** Generated assets look professional

- [ ] **Implement sharing analytics**
  - [ ] Track profile views by source
  - [ ] Monitor social media shares
  - [ ] Lead conversion tracking
  - **Verification:** Analytics data flowing correctly

### 📊 Business Dashboard Integration

- [ ] **Add sharing analytics to dashboard**
  - [ ] Profile view metrics
  - [ ] Share count by platform
  - [ ] Lead conversion rates
  - [ ] Popular themes/layouts
  - **Verification:** Business owners can see their metrics

---

## 📋 PHASE 5: TESTING & POLISH (Week 6)

### 🧪 Automated Testing

- [ ] **Playwright smoke tests**
  - [ ] Auth flow: `/login` → email → `/auth/check-email`
  - [ ] Create flow: `/register-business` → complete wizard
  - [ ] Claim flow: `/claim/[id]` → verify → personalize
  - [ ] Profile sharing: `/business/demo` → OG meta present
  - **Verification:** All tests pass consistently

- [ ] **Unit tests for critical components**
  - [ ] ProfileCustomizer functionality
  - [ ] Theme application logic
  - [ ] Sharing utilities
  - **Verification:** Test coverage >80% for critical paths

### ♿ Accessibility & Performance

- [ ] **Accessibility compliance**
  - [ ] AA contrast ratios
  - [ ] Keyboard navigation
  - [ ] ARIA labels and roles
  - [ ] Screen reader compatibility
  - **Verification:** Passes accessibility audit tools

- [ ] **Performance optimization**
  - [ ] Image optimization and lazy loading
  - [ ] Code splitting by route
  - [ ] Caching strategies
  - [ ] Mobile performance
  - **Verification:** Lighthouse scores >90

### 🔧 CI/CD Setup

- [ ] **GitHub Actions workflow**
  - [ ] Node 20 setup
  - [ ] npm ci and build
  - [ ] Playwright tests
  - [ ] Deploy to staging
  - **Verification:** CI passes and deploys automatically

- [ ] **Quality gates**
  - [ ] CodeQL security scanning
  - [ ] Dependabot updates
  - [ ] PR review requirements
  - **Verification:** Security and quality checks pass

---

## 📋 LAUNCH PREPARATION

### 🚀 Pre-Launch Checklist

- [ ] **Environment configuration**
  - [ ] Production environment variables
  - [ ] Database migrations
  - [ ] Email templates deployed
  - [ ] DNS configuration verified
  - **Verification:** Production environment fully configured

- [ ] **Content and data**
  - [ ] Seed data for Melbourne suburbs
  - [ ] Sample business listings for claiming
  - [ ] Help documentation
  - [ ] Terms of service and privacy policy
  - **Verification:** All required content in place

- [ ] **Monitoring and alerts**
  - [ ] Error tracking (Sentry/similar)
  - [ ] Performance monitoring
  - [ ] Email delivery monitoring
  - [ ] User analytics
  - **Verification:** All monitoring systems active

### 📊 Success Metrics Setup

- [ ] **Lead generation tracking**
  - [ ] Profile view to inquiry conversion
  - [ ] Social share to profile view conversion
  - [ ] Registration completion rates
  - **Verification:** Conversion funnels tracked

- [ ] **Business owner engagement**
  - [ ] Profile customization completion
  - [ ] Sharing frequency
  - [ ] Return visit rates
  - **Verification:** Engagement metrics available

---

## ✅ COMPLETION VERIFICATION TEMPLATE

For each major milestone, verify:

### 🔍 Functional Testing
- [ ] Feature works as designed
- [ ] No console errors
- [ ] Responsive on all devices
- [ ] Accessible to all users

### 🎨 Design Quality
- [ ] Matches design specifications
- [ ] SuburbMates branding consistent
- [ ] Professional appearance
- [ ] "Wow factor" present

### 📊 Analytics & Tracking
- [ ] Events firing correctly
- [ ] Data saving to database
- [ ] Analytics dashboard updated
- [ ] Performance within targets

### 🚀 User Experience
- [ ] Intuitive user flow
- [ ] Clear success/error states
- [ ] Fast loading times
- [ ] Smooth interactions

---

## 📅 Timeline Summary

- **Week 1**: Authentication fixes and core infrastructure
- **Week 2**: Essential workflows (create/claim)
- **Week 3**: Shareable profile system
- **Week 4**: Advanced personalization
- **Week 5**: Sharing tools and analytics
- **Week 6**: Testing, polish, and launch prep

**Total MVP Timeline: 6 weeks to fully functional lead-generating platform** 🎯