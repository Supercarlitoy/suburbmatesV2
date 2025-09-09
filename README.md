# NEXUS - Next.js Business Platform

A modern, full-stack business platform built with Next.js 15, TypeScript, and a comprehensive tech stack for scalable applications.

## 🚀 Tech Stack

### Core Framework
- **Next.js 15** - App Router, SSR/SSG for optimal performance
- **TypeScript** - Type safety for Business, Lead, and Content management
- **React 19** - Latest React features and improvements

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful & consistent icons
- **Glass Design System** - Modern glass morphism components

### Backend & Database
- **Supabase** - Authentication, PostgreSQL database, Edge Functions
- **@supabase/ssr** - Server-side rendering support
- **Edge Functions** - Serverless API endpoints

### State Management & Validation
- **Zustand** - Lightweight state management
- **Zod** - TypeScript-first schema validation
- **React Hook Form** - Performant forms with easy validation

### Email & Communication
- **Resend** - Modern email API for transactional emails
- **Email Templates** - Pre-built templates for notifications

### Testing
- **Jest** - JavaScript testing framework
- **Testing Library** - Simple and complete testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers

### Development & Deployment
- **Vercel** - Optimized deployment platform
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing

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