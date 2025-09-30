# SuburbMates - Melbourne Business Community Platform

A comprehensive platform connecting Melbourne businesses with local residents through verified profiles, intelligent search, lead generation, and community engagement.

## 🎯 Platform Overview

SuburbMates is a dual-audience platform designed for:
- **Business Owners**: Create verified profiles, claim existing listings, manage leads, and build local presence
- **Local Residents**: Discover trusted Melbourne businesses, submit inquiries, and connect with local services

### Key Features

- ✅ **Professional Business Profiles** - Customizable profiles with social sharing and embeds
- ✅ **ABN Verification System** - Australian Business Number verification through ABR API
- ✅ **Melbourne-Focused Search** - Suburb and category-specific business discovery
- ✅ **Lead Management** - Customer inquiries with email notifications
- ✅ **Advanced Admin Dashboard** - Multi-tab interface with bulk operations and approval workflows
- ✅ **AI-Powered Automation** - Business verification and content moderation with AI assistance
- ✅ **Quality Scoring System** - Algorithm-based business profile scoring (0-100)
- ✅ **Directory Management** - Import/export, deduplication, and bulk operations
- ✅ **Location Services** - Mapbox integration with geocoding and interactive maps
- ✅ **Comprehensive Email System** - Professional email notifications via Resend
- ✅ **CLI-to-Web Bridge** - Enterprise-grade web interface for CLI operations with real-time progress tracking
- ✅ **AI Automation Integration** - Comprehensive AI-powered business approval system with decision review and performance optimization

## 🚀 Tech Stack

### Core Framework
- **Next.js 15** - App Router, SSR/SSG, API routes, server actions
- **TypeScript** - Full type safety throughout the codebase
- **React 19** - Latest React features and improvements
- **Prisma** - Type-safe database client with PostgreSQL

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **MagicUI** - Enhanced UI components like marquee
- **Glass Card Design** - Modern, professional UI components

### Authentication & Backend
- **Supabase** - Authentication, PostgreSQL database
- **Edge Functions** - Serverless API endpoints
- **Middleware** - Auth protection and role-based access
- **Resend** - Professional email service with custom templates
- **Upstash Redis** - Rate limiting, feature flags, and caching

### Business & Directory Features
- **ABN Verification** - Australian Business Register API integration
- **AI-Assisted Automation** - Intelligent business verification
- **CSV Operations** - Import/export with validation and field mapping
- **Quality Scoring** - Profile completeness algorithm (0-100)
- **Mapbox Integration** - Geocoding and interactive maps

### State Management & Validation
- **Zustand** - Lightweight state management
- **Zod** - TypeScript-first schema validation
- **React Hook Form** - Performant form handling

### Analytics & Monitoring
- **GA4** - Client + server-side tracking
- **Audit Logging** - Comprehensive action tracking
- **Sentry** - Error monitoring and reporting

## 📄 Core Workflows

### Business Owner Workflows

#### Workflow 1: Create New Business Profile
1. Business owner discovers they're not listed on SuburbMates
2. Creates new profile through guided multi-step wizard
3. Verifies with ABN (optional but recommended)
4. Sets up profile details, contact info, and service areas
5. Receives admin approval
6. Customizes profile with branding, content, and services
7. Shares profile through various channels
8. Receives and manages leads through dashboard

#### Workflow 2: Claim Existing Business
1. Business owner finds their business already listed
2. Initiates claim process
3. Verifies ownership through various methods:
   - Email domain matching
   - Phone verification
   - Document upload
   - ABN verification
4. Admin reviews and approves claim
5. Business owner receives ownership notification
6. Takes control of existing profile with full customization
7. Manages leads and content through dashboard

### Admin Management Workflows

#### Business Approval Workflow
1. Admin reviews pending businesses
2. Verifies business legitimacy and content
3. Approves or rejects with reason
4. System notifies business owner via email
5. Approved businesses become visible in search

#### Claim Verification Workflow
1. Admin reviews ownership claims
2. Checks evidence provided by claimant
3. Verifies against existing business record
4. Approves or rejects claim with notes
5. System transfers ownership and notifies parties

#### Quality Management Workflow
1. System calculates quality scores (0-100)
2. Admin reviews low-quality businesses
3. Provides improvement recommendations
4. Monitors score improvements over time
5. Prioritizes businesses for enhancement

## 🏗️ Project Structure

The project follows a **feature-based architecture** with clear separation of concerns:

```
suburbmates/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin dashboard routes
│   ├── (auth)/                   # Authentication routes
│   ├── dashboard/                # Business dashboard
│   ├── (marketing)/              # Marketing pages
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin API endpoints
│   │   ├── auth/                 # Auth endpoints
│   │   ├── business/            # Business operations
│   │   ├── quality-scoring/      # Quality score endpoints
│   │   ├── ai-automation/        # AI automation endpoints
│   │   └── csv-operations/       # CSV import/export endpoints
│   ├── business/[slug]/          # Public business profiles
│   ├── search/                   # Search interface
│   └── feed/                     # Community feed
│
├── features/                     # Feature-based modules
│   ├── authentication/           # Auth logic & components
│   ├── business-profiles/        # Profile management
│   ├── verification/             # ABN verification system
│   ├── search-discovery/         # Search functionality
│   ├── lead-management/          # Lead capture & management
│   └── admin/                    # Admin tools
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Base Shadcn components
│   ├── business/                 # Business-specific components
│   ├── admin/                    # Admin-specific components
│   └── shared/                   # Shared components
│
├── lib/                          # Utility libraries
│   ├── constants/                # App constants & data
│   ├── database/                 # Database utilities
│   ├── validation/               # Zod schemas
│   ├── config/                   # Configuration files
│   └── utils/                    # General utilities
│
├── server/                       # Backend services
│   ├── auth/                     # Authentication logic
│   ├── middleware/               # Custom middleware
│   └── db/                       # Database connections
│
├── types/                        # TypeScript definitions
│   ├── api/                      # API types
│   ├── database/                 # Database types
│   ├── business/                 # Business-related types
│   └── global/                   # Global types
│
└── hooks/                        # Custom React hooks
    ├── auth/                     # Authentication hooks
    ├── business/                 # Business-related hooks
    └── ui/                       # UI-related hooks
```

### Architecture Principles

1. **Feature-Based Organization** - Related functionality grouped together
2. **Separation of Concerns** - UI, business logic, and data layers separated
3. **Reusable Components** - Modular, composable UI components
4. **Type Safety** - Full TypeScript coverage throughout
5. **Scalable Structure** - Easy to extend and maintain

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nexus-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   - Supabase URL and keys
   - Resend API key
   - Database URL
   - ABR API key
   - Other required keys

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

Run the test suite:
```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── magicui/          # Magic UI components
│   └── *.tsx             # Custom components
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Supabase client
│   ├── store.ts          # Zustand store
│   ├── validations.ts    # Zod schemas
│   ├── email.ts          # Resend email service
│   └── utils.ts          # Utility functions
├── hooks/                 # Custom React hooks
├── __tests__/            # Test files
├── public/               # Static assets
└── styles/               # Additional styles
```

## 🔧 Configuration Files

- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest testing configuration
- `jest.setup.js` - Jest setup file
- `components.json` - Shadcn/ui configuration

## 🌟 Features

### Authentication & User Management
- Supabase Auth integration
- User registration and login
- Password reset functionality
- Protected routes

### Business & Lead Management
- Business profile management
- Lead tracking and conversion
- Contact form handling
- Email notifications

### Content Management
- Blog and page content
- SEO optimization
- Content status management
- Tag-based organization

### Email System
- Welcome emails
- Contact form notifications
- Lead alerts
- Password reset emails

### Testing & Quality
- Component testing
- Store testing
- Validation testing
- Coverage reports

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key

# Database
DATABASE_URL=your_database_url

# ABR API
ABR_API_KEY=your_abr_api_key

# Google Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=your_ga4_id
GA4_API_SECRET=your_ga4_secret

# Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Mapbox (Optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Admin Settings
ADMIN_EMAILS=comma,separated,admin,emails
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test examples

---

**Built with ❤️ using Next.js and modern web technologies**