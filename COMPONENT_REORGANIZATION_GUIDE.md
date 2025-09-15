# SuburbMates - Component Reorganization Guide

## 🎯 **Reorganization Overview**

This guide provides step-by-step instructions for reorganizing existing components to align with business workflows and the refined project structure.

---

## 📋 **Current vs. Refined Component Structure**

### **Current Structure Issues:**
- Mixed business logic with UI components
- Unclear component hierarchy
- Duplicate functionality across features
- No clear separation between reusable and feature-specific components

### **Refined Structure Benefits:**
- **Workflow-aligned organization** (onboarding → discovery → management)
- **Clear component hierarchy** (base UI → business-specific → feature modules)
- **Reusable component library** with consistent patterns
- **Feature-based modularity** for scalability

---

## 🔄 **Component Migration Plan**

### **Phase 1: Base UI Components (Foundation)**

**Move existing UI components to organized structure:**

```bash
# Current scattered components → Organized UI structure

# Forms
components/ui/input.tsx → components/ui/forms/input.tsx
components/ui/textarea.tsx → components/ui/forms/textarea.tsx
components/ui/select.tsx → components/ui/forms/select.tsx
components/ui/checkbox.tsx → components/ui/forms/checkbox.tsx
components/ui/form.tsx → components/ui/forms/form.tsx

# Navigation
components/ui/breadcrumb.tsx → components/ui/navigation/breadcrumb.tsx
components/ui/tabs.tsx → components/ui/navigation/tabs.tsx
# CREATE: components/ui/navigation/navbar.tsx
# CREATE: components/ui/navigation/sidebar.tsx
# CREATE: components/ui/navigation/pagination.tsx

# Feedback
components/ui/alert.tsx → components/ui/feedback/alert.tsx
components/ui/toast.tsx → components/ui/feedback/toast.tsx
components/ui/skeleton.tsx → components/ui/feedback/skeleton.tsx
components/ui/progress.tsx → components/ui/feedback/progress.tsx
# CREATE: components/ui/feedback/loading.tsx

# Data Display
components/ui/card.tsx → components/ui/data-display/card.tsx
components/ui/table.tsx → components/ui/data-display/table.tsx
components/ui/badge.tsx → components/ui/data-display/badge.tsx
components/ui/avatar.tsx → components/ui/data-display/avatar.tsx
components/ui/chart.tsx → components/ui/data-display/chart.tsx

# Layout
components/ui/separator.tsx → components/ui/layout/separator.tsx
# CREATE: components/ui/layout/container.tsx
# CREATE: components/ui/layout/grid.tsx
# CREATE: components/ui/layout/stack.tsx

# Interactive
components/ui/button.tsx → components/ui/interactive/button.tsx
components/ui/dialog.tsx → components/ui/interactive/dialog.tsx
components/ui/popover.tsx → components/ui/interactive/popover.tsx
components/ui/tooltip.tsx → components/ui/interactive/tooltip.tsx
# CREATE: components/ui/interactive/dropdown.tsx
```

### **Phase 2: Business-Specific Components**

**Create business domain components:**

```typescript
// components/business/BusinessCard.tsx
// Unified business listing card for search results and profiles
export interface BusinessCardProps {
  business: Business;
  variant: 'search' | 'profile' | 'admin';
  showActions?: boolean;
  onContact?: () => void;
  onEdit?: () => void;
}

// components/business/BusinessHeader.tsx
// Business profile header with logo, name, verification status
export interface BusinessHeaderProps {
  business: Business;
  isOwner?: boolean;
  showEditButton?: boolean;
}

// components/business/BusinessInfo.tsx
// Business information display (contact, services, areas)
export interface BusinessInfoProps {
  business: Business;
  showContactForm?: boolean;
}

// components/business/BusinessActions.tsx
// Action buttons for business profiles (contact, share, edit)
export interface BusinessActionsProps {
  business: Business;
  isOwner?: boolean;
  onContact?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
}

// components/business/ServiceAreaMap.tsx
// Melbourne service areas visualization
export interface ServiceAreaMapProps {
  serviceAreas: string[];
  interactive?: boolean;
  onAreaSelect?: (area: string) => void;
}

// components/business/BusinessMetrics.tsx
// Business performance metrics display
export interface BusinessMetricsProps {
  businessId: string;
  metrics: BusinessMetrics;
  timeRange: 'week' | 'month' | 'year';
}
```

### **Phase 3: Feature Module Components**

**Organize components by business workflows:**

#### **Authentication Workflow Components**

```typescript
// features/authentication/components/SignupWizard.tsx
// Multi-step signup process
export interface SignupWizardProps {
  onComplete: (data: SignupData) => void;
  initialStep?: number;
}

// Steps:
// 1. Basic Info (email, password)
// 2. ABN Verification
// 3. Business Details
// 4. Service Areas
// 5. Confirmation

// features/authentication/components/LoginForm.tsx
// Simple login interface
export interface LoginFormProps {
  onSuccess: () => void;
  redirectTo?: string;
}

// features/authentication/components/AuthGuard.tsx
// Route protection component
export interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: UserRole;
  fallback?: React.ReactNode;
}
```

#### **Business Profile Workflow Components**

```typescript
// features/business-profiles/components/ProfileEditor/index.tsx
// Main profile editing interface
export interface ProfileEditorProps {
  businessId: string;
  onSave: (data: BusinessProfile) => void;
  onCancel: () => void;
}

// features/business-profiles/components/ProfileEditor/BasicInfo.tsx
// Business basic information editor
export interface BasicInfoProps {
  data: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
  errors?: ValidationErrors;
}

// features/business-profiles/components/ProfileEditor/ServiceAreas.tsx
// Melbourne suburbs selector
export interface ServiceAreasProps {
  selectedAreas: string[];
  onChange: (areas: string[]) => void;
  maxSelections?: number;
}

// features/business-profiles/components/ProfileEditor/ThemeCustomizer.tsx
// Visual theme selector
export interface ThemeCustomizerProps {
  currentTheme: BusinessTheme;
  onChange: (theme: BusinessTheme) => void;
  previewMode?: boolean;
}

// features/business-profiles/components/ProfileDisplay/index.tsx
// Public business profile display
export interface ProfileDisplayProps {
  business: Business;
  showContactForm?: boolean;
  showShareButtons?: boolean;
}
```

#### **Verification Workflow Components**

```typescript
// features/verification/components/ABNVerification.tsx
// ABN input and verification interface
export interface ABNVerificationProps {
  onVerified: (abnData: ABNData) => void;
  onSkip?: () => void;
  required?: boolean;
}

// features/verification/components/VerificationStatus.tsx
// Verification status display
export interface VerificationStatusProps {
  status: VerificationStatus;
  abnData?: ABNData;
  showDetails?: boolean;
}

// features/verification/components/VerificationQueue.tsx
// Admin verification queue
export interface VerificationQueueProps {
  businesses: PendingBusiness[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}
```

#### **Search & Discovery Workflow Components**

```typescript
// features/search-discovery/components/SearchInterface/index.tsx
// Main search interface
export interface SearchInterfaceProps {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  onResultSelect?: (business: Business) => void;
}

// features/search-discovery/components/SearchInterface/SearchFilters.tsx
// Search filters panel
export interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  availableSuburbs: string[];
  availableCategories: BusinessCategory[];
}

// features/search-discovery/components/SearchInterface/SearchResults.tsx
// Search results grid
export interface SearchResultsProps {
  results: Business[];
  loading?: boolean;
  onLoadMore?: () => void;
  onBusinessSelect?: (business: Business) => void;
}

// features/search-discovery/components/SearchInterface/SearchMap.tsx
// Melbourne map with business markers
export interface SearchMapProps {
  businesses: Business[];
  center?: [number, number];
  onMarkerClick?: (business: Business) => void;
}
```

#### **Lead Management Workflow Components**

```typescript
// features/lead-management/components/LeadForm.tsx
// Contact form for business profiles
export interface LeadFormProps {
  businessId: string;
  businessName: string;
  onSubmit: (lead: LeadData) => void;
  onCancel?: () => void;
}

// features/lead-management/components/LeadsList.tsx
// Business owner leads dashboard
export interface LeadsListProps {
  businessId: string;
  leads: Lead[];
  onLeadSelect?: (lead: Lead) => void;
  onMarkAsRead?: (leadId: string) => void;
}

// features/lead-management/components/LeadDetails.tsx
// Individual lead information
export interface LeadDetailsProps {
  lead: Lead;
  onRespond?: (response: string) => void;
  onMarkAsRead?: () => void;
  onArchive?: () => void;
}
```

### **Phase 4: Shared Components**

**Create cross-feature shared components:**

```typescript
// components/shared/Layout/AppLayout.tsx
// Main application layout
export interface AppLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
}

// components/shared/Layout/DashboardLayout.tsx
// Dashboard layout with sidebar
export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
}

// components/shared/Navigation/MainNavbar.tsx
// Main site navigation
export interface MainNavbarProps {
  user?: User;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

// components/shared/Navigation/DashboardSidebar.tsx
// Dashboard sidebar navigation
export interface DashboardSidebarProps {
  currentPath: string;
  businessId?: string;
  unreadLeads?: number;
}

// components/shared/Forms/FormWrapper.tsx
// Consistent form wrapper
export interface FormWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

// components/shared/Search/SearchBar.tsx
// Global search component
export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: string[];
  showFilters?: boolean;
}
```

---

## 🛠️ **Implementation Steps**

### **Step 1: Create New Directory Structure**

```bash
# Create new component directories
mkdir -p components/ui/{forms,navigation,feedback,data-display,layout,interactive}
mkdir -p components/{business,admin,magicui,shared}
mkdir -p components/shared/{Layout,Navigation,Forms,Search,Onboarding}
mkdir -p features/{authentication,business-profiles,verification,search-discovery,lead-management,content-management,sharing,admin}/components
```

### **Step 2: Move Existing Components**

```bash
# Move UI components to organized structure
mv components/ui/input.tsx components/ui/forms/
mv components/ui/button.tsx components/ui/interactive/
mv components/ui/card.tsx components/ui/data-display/
# ... continue for all components
```

### **Step 3: Update Import Paths**

```typescript
// Update all import statements throughout the codebase

// Before:
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// After:
import { Button } from "@/components/ui/interactive/button";
import { Card } from "@/components/ui/data-display/card";

// Or use barrel exports:
// components/ui/index.ts
export { Button } from "./interactive/button";
export { Card } from "./data-display/card";

// Then import:
import { Button, Card } from "@/components/ui";
```

### **Step 4: Create Feature Components**

```typescript
// Create new feature-specific components
// Start with authentication workflow

// features/authentication/components/SignupWizard.tsx
"use client";

import { useState } from "react";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ABNVerificationStep } from "./steps/ABNVerificationStep";
import { BusinessDetailsStep } from "./steps/BusinessDetailsStep";
import { ServiceAreasStep } from "./steps/ServiceAreasStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";

export function SignupWizard({ onComplete, initialStep = 0 }: SignupWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<SignupData>({});

  const steps = [
    { component: BasicInfoStep, title: "Basic Information" },
    { component: ABNVerificationStep, title: "ABN Verification" },
    { component: BusinessDetailsStep, title: "Business Details" },
    { component: ServiceAreasStep, title: "Service Areas" },
    { component: ConfirmationStep, title: "Confirmation" }
  ];

  const handleStepComplete = (stepData: Partial<SignupData>) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(updatedData);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="signup-wizard">
      <div className="wizard-header">
        <h1>Create Your Business Profile</h1>
        <div className="progress-indicator">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`step ${index <= currentStep ? 'completed' : 'pending'}`}
            />
          ))}
        </div>
      </div>

      <div className="wizard-content">
        <CurrentStepComponent
          data={formData}
          onComplete={handleStepComplete}
          onBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
        />
      </div>
    </div>
  );
}
```

### **Step 5: Create Shared Components**

```typescript
// components/shared/Layout/AppLayout.tsx
import { MainNavbar } from "../Navigation/MainNavbar";
import { Footer } from "../Footer";

export function AppLayout({
  children,
  showNavbar = true,
  showFooter = true,
  className
}: AppLayoutProps) {
  return (
    <div className={`app-layout ${className || ''}`}>
      {showNavbar && <MainNavbar />}
      <main className="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

// components/shared/Navigation/MainNavbar.tsx
import { SearchBar } from "../Search/SearchBar";
import { UserMenu } from "./UserMenu";

export function MainNavbar({ user, showSearch = true, onSearch }: MainNavbarProps) {
  return (
    <nav className="main-navbar">
      <div className="navbar-brand">
        <Link href="/">
          <img src="/logo.svg" alt="SuburbMates" />
        </Link>
      </div>

      {showSearch && (
        <div className="navbar-search">
          <SearchBar onSearch={onSearch} />
        </div>
      )}

      <div className="navbar-actions">
        {user ? (
          <UserMenu user={user} />
        ) : (
          <div className="auth-buttons">
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
```

---

## 📋 **Component Organization Checklist**

### **Base UI Components**
- [ ] Move form components to `components/ui/forms/`
- [ ] Move navigation components to `components/ui/navigation/`
- [ ] Move feedback components to `components/ui/feedback/`
- [ ] Move data display components to `components/ui/data-display/`
- [ ] Move layout components to `components/ui/layout/`
- [ ] Move interactive components to `components/ui/interactive/`
- [ ] Create barrel exports for easy importing

### **Business Components**
- [ ] Create `BusinessCard` component for listings
- [ ] Create `BusinessHeader` component for profiles
- [ ] Create `BusinessInfo` component for details
- [ ] Create `BusinessActions` component for interactions
- [ ] Create `ServiceAreaMap` component for Melbourne areas
- [ ] Create `BusinessMetrics` component for analytics

### **Feature Components**
- [ ] Create authentication workflow components
- [ ] Create business profile workflow components
- [ ] Create verification workflow components
- [ ] Create search & discovery workflow components
- [ ] Create lead management workflow components
- [ ] Create content management workflow components
- [ ] Create sharing workflow components
- [ ] Create admin workflow components

### **Shared Components**
- [ ] Create layout components (App, Dashboard, Auth, Marketing)
- [ ] Create navigation components (Navbar, Sidebar, Breadcrumb)
- [ ] Create form components (Wrapper, FieldGroup, Validation)
- [ ] Create search components (SearchBar, FilterPanel, Results)
- [ ] Create onboarding components (Tour, Welcome, Progress)

### **Integration & Testing**
- [ ] Update all import paths throughout codebase
- [ ] Create component documentation
- [ ] Add TypeScript interfaces for all components
- [ ] Write unit tests for key components
- [ ] Test component integration in workflows
- [ ] Verify responsive design across components

---

## 🎯 **Workflow-Aligned Benefits**

### **Onboarding Workflow**
- **SignupWizard** guides users through multi-step registration
- **ABNVerification** streamlines business verification
- **ProfileEditor** helps create compelling business profiles

### **Discovery Workflow**
- **SearchInterface** provides powerful Melbourne business search
- **BusinessCard** displays consistent business information
- **ServiceAreaMap** visualizes coverage areas

### **Management Workflow**
- **DashboardLayout** provides consistent business management interface
- **LeadsList** helps track and respond to inquiries
- **BusinessMetrics** shows performance analytics

### **Admin Workflow**
- **VerificationQueue** streamlines business approvals
- **AnalyticsDashboard** provides platform insights
- **UserManagement** handles user administration

---

**This component reorganization creates a scalable, maintainable architecture that aligns with SuburbMates' business workflows while providing excellent developer experience and user interface consistency.** 🎨✨