# SuburbMates - Enhanced Melbourne Business Directory

A modern, production-ready business directory platform for Melbourne built with Next.js 15, featuring advanced form validation, ABN verification, and intelligent search capabilities.

## 🌟 Features

### Core Functionality
- **ABN-Verified Business Listings** - Real Australian Business Number validation
- **Suburb-Based Discovery** - Melbourne-focused local business search
- **Category Taxonomy** - 8 core business categories from Professional Services to Trades
- **Advanced Search** - Intelligent suggestions with location-based filtering
- **Business Registration** - Complete onboarding flow with verification
- **Lead Generation** - Claim and manage business profiles

### Technical Excellence
- **Next.js 15 App Router** - Latest React framework with server components
- **shadcn/ui + Radix** - Production-ready UI components with accessibility
- **React Hook Form + Zod** - Type-safe forms with schema validation
- **Framer Motion** - Smooth animations and micro-interactions  
- **Tailwind CSS** - Modern responsive design system
- **TypeScript** - End-to-end type safety

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (routes)/          # Page routes
│   │   ├── suburbs/       # Suburb directory
│   │   ├── categories/    # Business categories
│   │   ├── pricing/       # Subscription plans  
│   │   ├── join/          # Business registration
│   │   └── claim/         # Business claiming
│   ├── demo/              # Component showcase
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── search/            # Search components
│   └── suburbmates/       # Original components
└── lib/                   # Utilities and config
    └── utils.ts           # shadcn/ui utilities
```

## 🎨 Component Showcase

Visit `/demo` to see all enhanced components in action:

### Enhanced Search
- **Real-time Suggestions** - Dynamic filtering as you type
- **Location Intelligence** - Melbourne suburb and postcode awareness
- **Popular Categories** - Quick access to common searches
- **Visual Feedback** - Smooth animations and state indicators

### Business Registration Form
- **ABN Validation** - Real-time Australian Business Number verification
- **Schema Validation** - Zod-powered type-safe form validation  
- **Smart Formatting** - Auto-format ABN, phone, and postcode inputs
- **Error Handling** - Comprehensive validation with clear messaging
- **Accessibility** - Full keyboard navigation and screen reader support

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework

### UI & Components  
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible primitive components
- **Framer Motion** - Animation library

### Forms & Validation
- **React Hook Form** - Performant form management
- **Zod** - Schema validation library
- **is-valid-abn** - Australian Business Number validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 🇦🇺 Australian Business Features

### ABN Integration
- Real-time ABN validation with checksum verification
- Ready for ABR (Australian Business Register) API integration  
- Support for ABN Lookup web services

### Melbourne Data
- Comprehensive suburb database
- Australian postcode validation (4-digit format)
- Local business category taxonomy
- VIC state-specific features

## 🔮 Future Enhancements

### Phase 2: Data & Search
- **TanStack Query** - Server state management
- **Supabase Integration** - Database and authentication
- **Full-Text Search** - PostgreSQL search with ranking
- **Semantic Search** - pgvector for intelligent matching

### Phase 3: Location & Maps  
- **Mapbox Integration** - Interactive maps for business locations
- **Geolocation** - Find businesses near user location
- **Route Planning** - Directions to businesses

### Phase 4: Business Intelligence
- **Analytics Dashboard** - Business performance metrics
- **Review System** - Customer feedback and ratings  
- **Lead Management** - CRM integration for business owners
- **API Development** - RESTful API for third-party integrations

## 📝 Environment Variables

Create a `.env.local` file with:

```env
# Database (when ready)
# DATABASE_URL=your_database_url

# ABN Lookup API (for production)  
# ABN_LOOKUP_GUID=your_abn_lookup_guid

# Maps (when implementing)
# NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)  
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Warp Code** - Development workflow inspiration
- **shadcn** - Beautiful UI component system
- **Vercel** - Next.js framework and deployment platform
- **Radix UI** - Accessible component primitives
- **Australian Business Register** - ABN validation standards

---

Built with ❤️ for Melbourne's local business community