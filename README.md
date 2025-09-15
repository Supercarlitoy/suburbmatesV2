# SuburbMates - Melbourne Business Community Platform

A modern, full-stack platform connecting Melbourne businesses with local residents through verified profiles, smart search, and community engagement.

## 🎯 Platform Overview

SuburbMates is a dual-audience platform designed for:
- **Business Owners**: Create verified profiles, manage listings, capture leads
- **Local Residents**: Discover trusted businesses, read reviews, connect with services

### Key Features
- ✅ **ABN Verification System** - AI-assisted verification with admin approval
- ✅ **Smart Search** - Suburb-specific business discovery
- ✅ **Profile Customization** - Professional business profiles
- ✅ **Lead Management** - Connect residents with businesses
- ✅ **Admin Dashboard** - Quality control and approval workflow
- ✅ **Mobile Responsive** - Optimized for all devices

## 🚀 Tech Stack

### Core Framework
- **Next.js 15** - App Router, SSR/SSG, API routes
- **TypeScript** - Full type safety throughout
- **React 19** - Latest React features and improvements

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Consistent icon system
- **Glass Card Design** - Modern, professional UI

### Backend & Database
- **Supabase** - Authentication, PostgreSQL database
- **Prisma** - Type-safe database client
- **Edge Functions** - Serverless API endpoints

### Business Logic
- **ABR API Integration** - Australian Business Register verification
- **AI-Assisted Verification** - Smart business validation
- **Email Notifications** - Resend for transactional emails

### State Management & Validation
- **Zustand** - Lightweight state management
- **Zod** - TypeScript-first schema validation
- **React Hook Form** - Performant forms

### Testing & Quality
- **Jest** - JavaScript testing framework
- **Testing Library** - Component testing utilities
- **TypeScript** - Compile-time error checking

### Development & Deployment
- **Vercel** - Optimized deployment platform
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing

## 🏗️ Project Structure

The project follows a **feature-based architecture** with clear separation of concerns:

```
suburbmates/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin dashboard routes
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Business dashboard
│   ├── (marketing)/              # Marketing pages
│   ├── api/                      # API routes
│   ├── business/[slug]/          # Public business profiles
│   ├── search/                   # Search interface
│   └── feed/                     # Community feed
│
├── features/                     # Feature-based modules
│   ├── authentication/          # Auth logic & components
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
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   - Supabase URL and keys
   - Resend API key
   - Database URL
   - NextAuth secret

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

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=your_database_url
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