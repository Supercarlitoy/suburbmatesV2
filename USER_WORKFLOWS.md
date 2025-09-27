# SuburbMates Platform - Complete User Workflows

## Overview
This document maps all user journeys through the SuburbMates platform, from entry to exit, including every click, page transition, and data synchronization point.

---

## 1. VISITOR WORKFLOWS (Unregistered Users)

### 🎯 **Primary Discovery Journey**
**Entry Point:** `https://suburbmates.com/` 

```
HOME PAGE (/) 
├── Header Navigation Always Visible:
│   ├── Logo (/) → Returns to home
│   ├── Home (/) → Home page
│   ├── Suburbs (/suburbs) → Browse locations
│   ├── Categories (/categories) → Browse business types  
│   ├── Pricing (/pricing) → View subscription plans
│   ├── Advertise (/ads) → Business advertising info
│   ├── Join (/join) → Business registration
│   └── Sign In (/auth/sign-in) → Authentication [NOT IMPLEMENTED]
│
├── Hero Section:
│   ├── Main Search Bar → [STATIC - NO FUNCTIONALITY]
│   │   ├── Text Input: "Search 'plumber', 'cafe', or a suburb…"
│   │   └── Search Button → [NO ACTION]
│   └── Trust Indicators: "ABN verified • Last checked Sept 2025 • Community reviews"
│
├── Featured Suburb Widget (Brunswick):
│   ├── Quick Category Links → [STATIC LINKS TO #]
│   │   ├── Plumbers (#)
│   │   ├── Cafes (#) 
│   │   ├── Electricians (#)
│   │   ├── Physios (#)
│   │   ├── Cleaners (#)
│   │   └── Barbers (#)
│   └── ABN Verification Tip
│
├── Partner Advertising Band:
│   ├── "Promote your brand" → [STATIC LINK TO #]
│   ├── "Advertise here" → [STATIC LINK TO #]  
│   └── "View plans" → (/ads)
│
├── Browse by Category Section:
│   ├── Professional Services → (/category/professional%20services)
│   ├── Health & Wellness → (/category/health%20%26%20wellness)
│   ├── Food & Hospitality → (/category/food%20%26%20hospitality)
│   ├── Home & Construction → (/category/home%20%26%20construction)
│   ├── Retail & Shopping → (/category/retail%20%26%20shopping)
│   ├── Technology → (/category/technology)
│   ├── Personal Services → (/category/personal%20services)
│   └── Trades & Repairs → (/category/trades%20%26%20repairs)
│
├── Explore Suburbs Section:
│   ├── Brunswick → (/suburb/brunswick)
│   ├── Fitzroy → (/suburb/fitzroy)
│   ├── Carlton → (/suburb/carlton)
│   ├── Northcote → (/suburb/northcote)
│   ├── Melton → (/suburb/melton)
│   ├── Wyndham → (/suburb/wyndham)
│   ├── Casey → (/suburb/casey)
│   └── Hume → (/suburb/hume)
│
├── Trust Signals Section:
│   ├── ABN Verified
│   ├── Curated Density  
│   └── Local-First
│
├── Lead Capture Section:
│   ├── "Claim your business" → (/claim)
│   └── "Register your business" → (/join)
│
└── Footer:
    ├── Privacy → (/page/privacy) [ROUTE EXISTS]
    ├── Terms → (/page/terms) [ROUTE EXISTS] 
    └── Advertise → (/ads)
```

### 🏢 **Business Owner Discovery Journey**

```
BUSINESS OWNER ENTRY POINTS:
│
├── Direct to Join (/join)
│   ├── Business Registration Form
│   │   ├── Business Name (required)
│   │   ├── ABN (required, validated)
│   │   ├── Contact Name (required)
│   │   ├── Email (required, validated)
│   │   ├── Phone (required, min 10 chars)
│   │   ├── Address (required, min 5 chars)
│   │   ├── Suburb (required)
│   │   ├── Postcode (required, 4 digits)
│   │   ├── Category (required, dropdown)
│   │   └── Description (required, min 20 chars)
│   │
│   ├── Form Validation & Submission:
│   │   ├── Real-time ABN validation (is-valid-abn library)
│   │   ├── Auto-format ABN (XX XXX XXX XXX)
│   │   ├── Email validation
│   │   ├── Australian postcode validation
│   │   ├── Submit → Simulated 2-second processing
│   │   └── Success Alert: "Business registration submitted successfully!"
│   │
│   └── Registration Process Visual:
│       ├── Step 1: Submit Details
│       ├── Step 2: Verification (24-48 hours)
│       └── Step 3: Go Live
│
├── Direct to Claim (/claim) [PAGE EXISTS BUT NO CONTENT]
│
├── Pricing Page (/pricing)
│   ├── Starter Plan: $0/month
│   │   ├── Basic business listing
│   │   ├── Contact information display  
│   │   ├── Business hours
│   │   └── CTA: "Get Started" → (/join)
│   │
│   ├── Professional Plan: $49/month (Most Popular)
│   │   ├── Everything in Starter
│   │   ├── ABN verification badge
│   │   ├── Photo gallery (up to 10)
│   │   ├── Priority search placement
│   │   ├── Lead tracking
│   │   └── CTA: "Choose Professional" → (/join)
│   │
│   ├── Enterprise Plan: $149/month  
│   │   ├── Everything in Professional
│   │   ├── Top-of-category placement
│   │   ├── Analytics dashboard
│   │   ├── Review management tools
│   │   ├── Dedicated account manager
│   │   └── CTA: "Choose Enterprise" → (/join)
│   │
│   └── Custom Solution:
│       └── CTA: "Contact Sales" → (/contact) [NOT IMPLEMENTED]
│
└── Advertising Info (/ads) [PAGE EXISTS BUT NO CONTENT]
```

---

## 2. CONTENT DISCOVERY WORKFLOWS

### 📍 **Location-Based Discovery**

```
SUBURBS HUB (/suburbs)
├── Page Title: "Suburbs Hub"
├── Description: "Explore businesses across Melbourne suburbs"
├── Suburb Grid:
│   ├── Brunswick → [NO ROUTING CONFIGURED]
│   ├── Fitzroy → [NO ROUTING CONFIGURED] 
│   ├── Carlton → [NO ROUTING CONFIGURED]
│   ├── Northcote → [NO ROUTING CONFIGURED]
│   ├── Richmond → [NO ROUTING CONFIGURED]
│   └── South Yarra → [NO ROUTING CONFIGURED]
│
└── Each suburb shows: "Verified businesses available"

INDIVIDUAL SUBURB PAGES:
├── /suburb/brunswick [ROUTE CONFIGURED, NO PAGE]
├── /suburb/fitzroy [ROUTE CONFIGURED, NO PAGE]
├── /suburb/carlton [ROUTE CONFIGURED, NO PAGE] 
├── /suburb/northcote [ROUTE CONFIGURED, NO PAGE]
├── /suburb/melton [ROUTE CONFIGURED, NO PAGE]
├── /suburb/wyndham [ROUTE CONFIGURED, NO PAGE]
├── /suburb/casey [ROUTE CONFIGURED, NO PAGE]
└── /suburb/hume [ROUTE CONFIGURED, NO PAGE]
```

### 🏪 **Category-Based Discovery**

```
CATEGORIES HUB (/categories) [PAGE EXISTS BUT NO CONTENT]

INDIVIDUAL CATEGORY PAGES:
├── /category/professional%20services [ROUTE CONFIGURED, NO PAGE]
├── /category/health%20%26%20wellness [ROUTE CONFIGURED, NO PAGE]
├── /category/food%20%26%20hospitality [ROUTE CONFIGURED, NO PAGE]  
├── /category/home%20%26%20construction [ROUTE CONFIGURED, NO PAGE]
├── /category/retail%20%26%20shopping [ROUTE CONFIGURED, NO PAGE]
├── /category/technology [ROUTE CONFIGURED, NO PAGE]
├── /category/personal%20services [ROUTE CONFIGURED, NO PAGE]
└── /category/trades%20%26%20repairs [ROUTE CONFIGURED, NO PAGE]
```

---

## 3. AUTHENTICATION WORKFLOWS [NOT IMPLEMENTED]

### 🔐 **User Authentication System**
```
CURRENT STATE: Authentication routes referenced but not implemented

PLANNED AUTHENTICATION FLOW:
├── Sign In (/auth/sign-in) [REFERENCED BUT NO PAGE]
├── Sign Up (/auth/sign-up) [NOT REFERENCED]
├── Password Reset (/auth/reset) [NOT REFERENCED]
├── Email Verification (/auth/verify) [NOT REFERENCED]
└── Dashboard Access [NOT IMPLEMENTED]

USER ROLES (Planned):
├── Visitor (Current implementation)
├── Business Owner [NOT IMPLEMENTED]
├── Premium Business Owner [NOT IMPLEMENTED]
└── Admin [NOT IMPLEMENTED]
```

---

## 4. BUSINESS MANAGEMENT WORKFLOWS [PARTIALLY IMPLEMENTED]

### 🏢 **Business Registration Flow (Current)**

```
REGISTRATION PROCESS (/join):
│
Step 1: FORM COMPLETION
├── User lands on registration page
├── Form renders with all required fields
├── Real-time validation on:
│   ├── ABN format (XX XXX XXX XXX)
│   ├── Email format validation
│   ├── Phone number length (min 10)
│   ├── Postcode format (4 digits)
│   └── Description length (min 20 chars)
│
Step 2: ABN VERIFICATION
├── is-valid-abn library validates ABN checksum
├── Real-time feedback on ABN validity
├── Visual formatting applied automatically
│
Step 3: FORM SUBMISSION  
├── Client-side validation check
├── Simulated 2-second processing delay
├── Console.log output for debugging
├── Success alert displayed
├── Form state reset
│
Step 4: BUSINESS VERIFICATION (Simulated)
├── User told verification takes 24-48 hours
├── No actual backend processing
├── No email confirmation system
├── No status tracking system
│
MISSING WORKFLOWS:
├── Actual ABN verification with Australian Business Register
├── Database storage of business information
├── Email confirmation system
├── Business owner dashboard
├── Profile management system
└── Lead tracking system
```

### 🎯 **Business Claim Flow [NOT IMPLEMENTED]**
```
CLAIM PROCESS (/claim):
├── Page exists but no content
├── Should allow existing business owners to claim their listing
├── Should require verification of ownership
├── Should provide access to management dashboard

MISSING IMPLEMENTATION:
├── Business search functionality
├── Ownership verification process
├── Documentation requirements
├── Approval workflow
└── Dashboard access
```

---

## 5. SEARCH & DISCOVERY WORKFLOWS [NOT IMPLEMENTED]

### 🔍 **Search System (Current State: Static)**

```
HOME PAGE SEARCH:
├── Search Input Field: "Search 'plumber', 'cafe', or a suburb…"
├── Search Button: [NO FUNCTIONALITY]
├── No search results page
├── No filtering system  
├── No sorting options
└── No location-based results

ENHANCED SEARCH COMPONENT EXISTS:
├── File: /src/components/search/EnhancedSearch.tsx
├── Features:
│   ├── Real-time suggestions
│   ├── Location-based filtering
│   ├── Popular categories
│   ├── Melbourne suburbs data
│   └── Animated dropdowns
├── Integration: NOT CONNECTED TO HOME PAGE
└── Functionality: DEMO/PROTOTYPE ONLY
```

---

## 6. DATA SYNCHRONIZATION POINTS

### 📊 **Current Data Flow**

```
DATA SOURCES (Static):
├── Melbourne Suburbs (hardcoded array):
│   └── ["Brunswick", "Fitzroy", "Carlton", "Northcote", "Richmond", ...]
│
├── Business Categories (hardcoded array):
│   └── ["Professional Services", "Health & Wellness", ...]
│
├── Featured Businesses (hardcoded):  
│   └── Brunswick sample categories
│
└── Form Data (temporary):
    ├── Client-side validation only
    ├── Console logging for debugging
    └── No persistent storage

MISSING DATA SYSTEMS:
├── Database integration (PostgreSQL/Supabase planned)
├── Real-time business listings
├── User accounts and authentication
├── ABN verification API integration  
├── Search indexing system
├── Analytics and tracking
├── Review and rating system
└── Image storage and management
```

---

## 7. ERROR HANDLING & EDGE CASES

### ⚠️ **Current Error States**

```
FORM VALIDATION ERRORS:
├── Real-time field validation with error messages
├── Required field highlighting
├── Format validation (ABN, email, postcode)
├── Character count requirements
└── Visual error feedback

NAVIGATION ERRORS:
├── Non-existent routes show Next.js 404
├── Category pages return empty content
├── Suburb pages return empty content  
├── Authentication routes are broken
└── No custom error pages

MISSING ERROR HANDLING:
├── Network connectivity issues
├── API timeout handling
├── Database connection errors
├── Image loading failures
├── Search query errors
└── Business verification failures
```

---

## 8. MOBILE & RESPONSIVE WORKFLOWS

### 📱 **Mobile User Experience**

```
RESPONSIVE BREAKPOINTS:
├── Mobile: < 768px
│   ├── Header navigation collapses (hidden on mobile)
│   ├── Grid layouts stack vertically  
│   ├── Touch-friendly button sizing
│   └── Optimized text sizing
│
├── Tablet: 768px - 1024px
│   ├── 2-column layouts for categories/suburbs
│   ├── Navigation remains visible
│   └── Balanced text and image sizing
│
└── Desktop: > 1024px
    ├── Full navigation visible
    ├── 4-column layouts for categories/suburbs
    ├── 12-column hero grid
    └── Optimal typography scaling

MOBILE-SPECIFIC BEHAVIORS:
├── Framer Motion animations respect reduced motion
├── Touch targets meet accessibility standards
├── Form inputs optimized for mobile keyboards
└── Sticky header maintains brand visibility
```

---

## 9. ANALYTICS & TRACKING [NOT IMPLEMENTED]

### 📈 **Planned Tracking Points**

```
USER INTERACTION TRACKING:
├── Page visits and duration
├── Search queries and results  
├── Category and suburb clicks
├── Form interactions and completions
├── Business profile clicks
├── Call-to-action conversions
└── Exit points and bounce rates

BUSINESS ANALYTICS:
├── Profile views and interactions
├── Lead generation tracking
├── Contact form submissions
├── Phone calls (via click-to-call)
├── Website visits from directory
└── Conversion funnel analysis

CURRENT STATE: PostHog MCP configured but not implemented in frontend
```

---

## 10. FUTURE WORKFLOW ENHANCEMENTS

### 🚀 **Planned User Journeys**

```
PHASE 2: DATABASE & SEARCH
├── Real business listings with search functionality
├── Advanced filtering (price, rating, distance)
├── Map integration with business locations
├── Real-time availability and booking
└── User reviews and ratings system

PHASE 3: USER ACCOUNTS  
├── Business owner dashboards
├── Customer accounts and favorites
├── Lead management system
├── Analytics and reporting
└── Subscription management

PHASE 4: ADVANCED FEATURES
├── Mobile app development
├── API for third-party integrations  
├── Advanced SEO optimization
├── Multi-language support
└── AI-powered recommendations
```

---

## Summary

**Current State:** Static marketing website with form validation
**Functional Pages:** 5 of 15 planned pages
**Interactive Elements:** Business registration form only
**Data Persistence:** None (frontend only)
**Authentication System:** Referenced but not implemented

**Immediate Development Priorities:**
1. Implement database integration for business listings
2. Connect search functionality to real data
3. Build authentication system for business owners
4. Create business management dashboard
5. Implement ABN verification API integration

The platform has excellent UI/UX foundation but requires backend infrastructure to become fully functional.