# 🔄 SuburbMates Core Workflow Checklists

Quick reference checklists for the two primary user journeys.

---

## 🆕 Workflow 1: Create New Business Profile

**User Journey:** Discovery → Registration → Profile Creation → Personalization → Publishing → Sharing

### Phase A: Discovery & Registration
- [ ] **User discovers SuburbMates** 
  - [ ] Landing page clearly explains value proposition
  - [ ] "Get Started" CTA prominent and working
  - [ ] User can easily understand the process

- [ ] **User clicks "Create Profile"**
  - [ ] Redirects to `/register-business`
  - [ ] Registration wizard loads correctly
  - [ ] Progress indicator shows steps

- [ ] **User completes registration form**
  - [ ] Step 1: Business Details (name, category, description)
  - [ ] Step 2: Location & Service Areas (Melbourne suburbs)
  - [ ] Step 3: Contact Information (phone, email, website)
  - [ ] Form validation works on each step
  - [ ] Auto-save functionality works

- [ ] **User creates account**
  - [ ] Email/password or magic link signup
  - [ ] Redirects to `/auth/check-email`
  - [ ] Branded confirmation email sent
  - [ ] User receives email and clicks confirmation

### Phase B: Profile Creation & Setup
- [ ] **User confirms email and logs in**
  - [ ] Successful login redirects to dashboard
  - [ ] Welcome message explains next steps
  - [ ] Profile creation continues from where left off

- [ ] **Profile automatically created**
  - [ ] Business data from registration used
  - [ ] Default theme applied
  - [ ] All required fields populated
  - [ ] Profile in DRAFT status

### Phase C: Personalization
- [ ] **User accesses profile customizer**
  - [ ] Dashboard has "Customize Profile" button
  - [ ] ProfileCustomizer component loads
  - [ ] User can see live preview

- [ ] **User personalizes profile**
  - [ ] Theme selection (category-based recommendations)
  - [ ] Layout choice (hero-focused, gallery, etc.)
  - [ ] Content customization (tagline, services, photos)
  - [ ] Social media links
  - [ ] Contact preferences
  - [ ] Changes save automatically

- [ ] **User previews final profile**
  - [ ] Full profile preview loads
  - [ ] Mobile and desktop versions shown
  - [ ] SuburbMates watermark visible
  - [ ] All personalization applied correctly

### Phase D: Publishing
- [ ] **User publishes profile**
  - [ ] "Publish Profile" button works
  - [ ] Profile status changes to PUBLISHED
  - [ ] Shareable URL generated
  - [ ] Success message with sharing options shown

### Phase E: Sharing
- [ ] **User gets sharing tools**
  - [ ] Social media share buttons work
  - [ ] Copy link functionality works
  - [ ] QR code generated
  - [ ] Sharing analytics start tracking

- [ ] **Profile is shareable**
  - [ ] Public URL works: `/business/[slug]`
  - [ ] Social media previews look professional
  - [ ] Mobile sharing optimized
  - [ ] SuburbMates branding present

**✅ Workflow 1 Complete:** User has created and can share a professional business profile

---

## 🎯 Workflow 2: Claim Existing Business Profile

**User Journey:** Discovery → Claim Request → Verification → Profile Access → Personalization → Publishing → Sharing

### Phase A: Discovery & Claim Initiation
- [ ] **User finds their business listed**
  - [ ] Search functionality works
  - [ ] Business listings display correctly
  - [ ] "Claim This Business" button visible on unclaimed profiles

- [ ] **User clicks "Claim This Business"**
  - [ ] Redirects to `/claim/[businessId]`
  - [ ] Claim flow page loads
  - [ ] Business information displayed for confirmation

- [ ] **User confirms business ownership**
  - [ ] Business details match what user expects
  - [ ] "Yes, this is my business" confirmation
  - [ ] Clear explanation of next steps

### Phase B: Verification Process
- [ ] **User provides verification information**
  - [ ] Email domain verification (if applicable)
  - [ ] Phone number verification
  - [ ] Alternative verification methods if needed
  - [ ] Verification request submitted successfully

- [ ] **User creates account (if new)**
  - [ ] Registration form for new users
  - [ ] Email confirmation process
  - [ ] Account creation successful

- [ ] **System processes verification**
  - [ ] OwnershipClaim record created
  - [ ] Status: UNCLAIMED → PENDING
  - [ ] Verification workflow triggered
  - [ ] User notified of pending status

### Phase C: Approval & Access
- [ ] **Verification reviewed** (admin process)
  - [ ] Admin dashboard shows pending claims
  - [ ] Verification criteria checked
  - [ ] Approval/rejection decision made
  - [ ] Status updated: PENDING → APPROVED/REJECTED

- [ ] **User gains profile access**
  - [ ] Email notification of approval sent
  - [ ] User can log in and access profile
  - [ ] Profile editing permissions granted
  - [ ] Status: APPROVED → CLOSED

### Phase D: Profile Personalization
- [ ] **User accesses claimed profile**
  - [ ] Existing profile data preserved
  - [ ] Customization options available
  - [ ] ProfileCustomizer loads with current settings

- [ ] **User personalizes claimed profile**
  - [ ] All personalization options work
  - [ ] Theme selection and application
  - [ ] Content editing and updates
  - [ ] Photo gallery management
  - [ ] Social media integration
  - [ ] Changes save successfully

### Phase E: Publishing & Sharing
- [ ] **User publishes updated profile**
  - [ ] Profile status changes to PUBLISHED
  - [ ] Updated content goes live
  - [ ] Shareable URL active
  - [ ] Success confirmation shown

- [ ] **Profile ready for sharing**
  - [ ] All sharing tools available
  - [ ] Social media optimization active
  - [ ] Analytics tracking enabled
  - [ ] SuburbMates branding applied

**✅ Workflow 2 Complete:** User has claimed, personalized, and can share their business profile

---

## 🔍 Cross-Workflow Quality Checks

### 🎨 Profile Quality Standards
- [ ] **Professional appearance**
  - [ ] High-quality visual design
  - [ ] Consistent branding
  - [ ] Mobile-optimized layout
  - [ ] Fast loading times

- [ ] **"Wow Factor" elements**
  - [ ] Impressive visual presentation
  - [ ] Better than competitor profiles
  - [ ] Business owners proud to share
  - [ ] Generates positive reactions

### 🏷️ SuburbMates Branding
- [ ] **Consistent brand presence**
  - [ ] Logo/watermark on all profiles
  - [ ] "Powered by SuburbMates" attribution
  - [ ] Brand colors complement business themes
  - [ ] Professional but not intrusive

- [ ] **Traffic generation**
  - [ ] Attribution links work
  - [ ] Analytics track referrals
  - [ ] Brand exposure on every share
  - [ ] Drives users back to platform

### 📊 Lead Generation
- [ ] **Lead capture optimized**
  - [ ] Contact forms functional
  - [ ] Click-to-call buttons work
  - [ ] Inquiry system active
  - [ ] Lead notifications sent

- [ ] **Conversion tracking**
  - [ ] Profile views tracked
  - [ ] Inquiry conversion measured
  - [ ] Social shares monitored
  - [ ] ROI calculations available

### 🔧 Technical Quality
- [ ] **Performance standards**
  - [ ] Page load <3 seconds
  - [ ] Mobile performance optimized
  - [ ] SEO metadata present
  - [ ] Accessibility compliance

- [ ] **Reliability standards**
  - [ ] No broken links or errors
  - [ ] Database updates reliable
  - [ ] Email delivery consistent
  - [ ] Analytics data accurate

---

## 🎯 Success Criteria

### For Business Owners
- ✅ **Easy profile creation/claiming** (< 10 minutes)
- ✅ **Professional results** they're proud to share
- ✅ **Increased leads** from shared profiles
- ✅ **Simple customization** without technical knowledge

### For SuburbMates
- ✅ **Brand exposure** on every shared profile
- ✅ **Traffic generation** back to platform
- ✅ **Lead attribution** and analytics
- ✅ **Viral growth** through profile sharing

### Technical Success
- ✅ **Both workflows functional** end-to-end
- ✅ **Analytics and tracking** working
- ✅ **Performance targets** met
- ✅ **Quality standards** achieved

---

**Use these checklists to verify each workflow works perfectly before launch! 🚀**