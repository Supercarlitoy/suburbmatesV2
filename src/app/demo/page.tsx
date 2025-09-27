"use client";

import dynamic from "next/dynamic";

const EnhancedSearch = dynamic(() => import("@/components/search/EnhancedSearch"), { ssr: false });
const BusinessRegistrationForm = dynamic(() => import("@/components/forms/BusinessRegistrationForm"), { ssr: false });

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-neutral-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-white via-neutral-200 to-white bg-clip-text text-transparent">
              SuburbMates Demo
            </span>
          </h1>
          <nav className="flex gap-6 text-sm text-neutral-300">
            <a href="/" className="hover:text-white">← Back to Home</a>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-16">
        
        {/* Enhanced Search Demo */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Enhanced Search Experience</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Features intelligent suggestions, location-based filtering, and real-time search with modern UX patterns inspired by Warp Code's approach to user interaction.
            </p>
          </div>
          
          <div className="flex justify-center">
            <EnhancedSearch
              onSearch={(query, location) => {
                console.log(`Demo search: "${query}" in "${location}"`);
                alert(`Searching for "${query}" in "${location}"`);
              }}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold text-green-400 mb-2">🔍 Smart Suggestions</h3>
              <p className="text-neutral-400">
                Dynamic search suggestions based on popular Melbourne services and suburbs
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold text-blue-400 mb-2">📍 Location-Aware</h3>
              <p className="text-neutral-400">
                Suburb-specific search with Melbourne postcode and location intelligence
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-semibold text-orange-400 mb-2">⚡ Real-time</h3>
              <p className="text-neutral-400">
                Instant search results with smooth animations and responsive design
              </p>
            </div>
          </div>
        </section>

        {/* Business Registration Form Demo */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Advanced Business Registration</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Production-ready form with ABN validation, Zod schema validation, React Hook Form integration, and shadcn/ui components. Demonstrates modern form handling patterns.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <BusinessRegistrationForm />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-400 mb-1">ABN Validation</h3>
              <p className="text-neutral-400 text-xs">Real-time Australian Business Number validation with checksum verification</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
              <h3 className="font-semibold text-blue-400 mb-1">Schema Validation</h3>
              <p className="text-neutral-400 text-xs">Zod-powered type-safe validation with custom rules and error messages</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
              <h3 className="font-semibold text-purple-400 mb-1">Form Management</h3>
              <p className="text-neutral-400 text-xs">React Hook Form integration with optimized re-renders and performance</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-4">
              <h3 className="font-semibold text-orange-400 mb-1">UI Components</h3>
              <p className="text-neutral-400 text-xs">shadcn/ui components with consistent styling and accessibility features</p>
            </div>
          </div>
        </section>

        {/* Technical Stack Info */}
        <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6 text-center">Enhanced Technical Stack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-3">🎨 UI Primitives</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>• shadcn/ui components</li>
                <li>• Radix UI primitives</li>
                <li>• Tailwind CSS styling</li>
                <li>• Accessibility built-in</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">📋 Forms & Validation</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>• React Hook Form</li>
                <li>• Zod schema validation</li>
                <li>• ABN validation library</li>
                <li>• Type-safe form handling</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">🚀 Motion & Performance</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>• Framer Motion animations</li>
                <li>• Next.js 15 App Router</li>
                <li>• Dynamic imports for optimization</li>
                <li>• Client-side hydration</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">🇦🇺 Australian Business Features</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>• ABN lookup integration ready</li>
                <li>• Melbourne suburb data</li>
                <li>• Australian postcode validation</li>
                <li>• Business category taxonomy</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">🔍 Future Enhancements</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>• TanStack Query for data fetching</li>
                <li>• Supabase full-text search</li>
                <li>• Mapbox integration</li>
                <li>• Semantic search with pgvector</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">📊 Production Ready</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>• SEO-optimized routing</li>
                <li>• Error boundary handling</li>
                <li>• Performance monitoring</li>
                <li>• Progressive enhancement</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 rounded-xl border border-indigo-400/30">
            <h3 className="text-lg font-semibold text-white mb-2">🎯 Warp Code Principles Applied</h3>
            <p className="text-neutral-300 text-sm">
              This demo showcases modern development workflows inspired by Warp Code's "prompt-to-production" philosophy. 
              Features include agent-steerable interfaces, rapid iteration capabilities, and production-ready components 
              that can be deployed and scaled immediately.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}