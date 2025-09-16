# SuburbMates Project Structure

## Overview
This document outlines the organized project structure for the SuburbMates platform, following feature-based architecture principles with clear separation of concerns.

## Current Structure Analysis

### ✅ Well-Organized Sections
- `/app` - Next.js App Router structure
- `/components/ui` - Reusable UI components
- `/lib` - Utility libraries and configurations
- `/server` - Backend services and utilities
- `/prisma` - Database schema and migrations

### 🔄 Areas for Improvement
- `/features` - Currently has empty component folders
- Root level files - Some could be better organized
- Component organization - Some business logic mixed with UI

## Recommended Project Structure

```
suburbmates/
├── README.md
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── .gitignore
├── .env.example
│
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin routes
│   │   ├── approve/
│   │   ├── verify/
│   │   └── layout.tsx
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── dashboard/               # Business dashboard
│   │   ├── profile/
│   │   ├── content/
│   │   ├── leads/
│   │   └── layout.tsx
│   ├── (marketing)/              # Marketing pages
│   │   ├── about/
│   │   ├── faq/
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── businesses/
│   │   ├── verification/
│   │   └── email/
│   ├── business/[slug]/          # Public business profiles
│   ├── search/                   # Search interface
│   ├── feed/                     # Community feed
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components (Shadcn)
│   │   ├── forms/               # Form-specific components
│   │   ├── navigation/          # Navigation components
│   │   ├── feedback/            # Alerts, toasts, etc.
│   │   └── data-display/        # Cards, tables, etc.
│   ├── business/                # Business-specific components
│   │   ├── profile/
│   │   ├── verification/
│   │   └── listing/
│   ├── admin/                   # Admin-specific components
│   └── shared/                  # Shared components
│
├── features/                    # Feature-based modules
│   ├── authentication/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── business-profiles/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── verification/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
│   ├── search-discovery/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── lead-management/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── admin/
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── lib/                         # Utility libraries
│   ├── auth/                    # Authentication utilities
│   ├── database/                # Database utilities
│   ├── validation/              # Zod schemas
│   ├── constants/               # App constants
│   ├── utils/                   # General utilities
│   └── config/                  # Configuration files
│
├── server/                      # Backend services
│   ├── services/                # Business logic services
│   │   ├── abr/                # ABN verification
│   │   ├── email/              # Email services
│   │   ├── business/           # Business operations
│   │   └── admin/              # Admin operations
│   ├── middleware/              # Custom middleware
│   ├── auth/                    # Authentication logic
│   └── db/                      # Database connections
│
├── types/                       # TypeScript type definitions
│   ├── api/                     # API types
│   ├── database/                # Database types
│   ├── business/                # Business-related types
│   └── global/                  # Global types
│
├── hooks/                       # Custom React hooks
│   ├── auth/                    # Authentication hooks
│   ├── business/                # Business-related hooks
│   ├── ui/                      # UI-related hooks
│   └── api/                     # API hooks
│
├── styles/                      # Styling files
│   ├── globals.css
│   ├── components.css
│   └── themes/
│
├── public/                      # Static assets
│   ├── images/
│   ├── icons/
│   └── logos/
│
├── prisma/                      # Database schema
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
├── tests/                       # Test files
│   ├── __mocks__/
│   ├── components/
│   ├── features/
│   ├── api/
│   └── utils/
│
└── docs/                        # Documentation
    ├── api/
    ├── deployment/
    ├── development/
    └── architecture/
```

## File Organization Principles

### 1. Feature-Based Architecture
- Group related functionality together
- Each feature has its own components, hooks, services, and types
- Promotes modularity and maintainability

### 2. Separation of Concerns
- UI components separate from business logic
- Services handle data operations
- Hooks manage state and side effects
- Types provide clear contracts

### 3. Consistent Naming
- Use kebab-case for folders
- Use PascalCase for React components
- Use camelCase for functions and variables
- Use UPPER_CASE for constants

### 4. Import Organization
- External libraries first
- Internal utilities second
- Relative imports last
- Group related imports together

## Migration Plan

### Phase 1: Create New Structure
1. Create feature-based folders
2. Create organized component folders
3. Set up proper type definitions

### Phase 2: Move Existing Files
1. Move business verification components
2. Reorganize UI components
3. Move API routes to logical groups
4. Update import paths

### Phase 3: Optimize and Clean
1. Remove unused files
2. Consolidate duplicate code
3. Update documentation
4. Verify all functionality works

## Benefits of This Structure

### Developer Experience
- Easy to find related files
- Clear separation of concerns
- Scalable architecture
- Consistent patterns

### Maintainability
- Modular components
- Reusable services
- Clear dependencies
- Easy testing

### Performance
- Better code splitting
- Optimized imports
- Reduced bundle size
- Faster builds

## Implementation Guidelines

### Component Organization
```typescript
// Good: Feature-based component
features/business-profiles/components/ProfileEditor.tsx

// Good: Reusable UI component
components/ui/forms/FormField.tsx

// Avoid: Mixed concerns
components/BusinessProfileFormWithVerification.tsx
```

### Service Organization
```typescript
// Good: Feature-specific service
features/verification/services/abnVerification.ts

// Good: Shared utility service
lib/utils/formatters.ts

// Avoid: Everything in one service
services/everything.ts
```

### Type Organization
```typescript
// Good: Feature-specific types
types/business/Profile.ts
types/verification/ABNData.ts

// Good: Shared types
types/global/ApiResponse.ts

// Avoid: All types in one file
types/index.ts (with everything)
```

This structure ensures the SuburbMates platform remains organized, scalable, and maintainable as it grows.