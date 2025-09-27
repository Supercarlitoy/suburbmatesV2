import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-neutral-300 text-lg">
            Choose the right plan to grow your local business presence
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white/5 rounded-xl p-8 border border-white/10 relative">
            <h3 className="text-2xl font-semibold mb-6">Starter</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-neutral-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Basic business listing
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Contact information display
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Business hours
              </li>
            </ul>
            <Link 
              href="/join"
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-3 px-4 text-center block transition-colors"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-400/10 rounded-xl p-8 border-2 border-indigo-400/40 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-semibold mb-6">Professional</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-neutral-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Everything in Starter
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                ABN verification badge
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Photo gallery (up to 10)
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Priority search placement
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Lead tracking
              </li>
            </ul>
            <Link 
              href="/join"
              className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-lg py-3 px-4 text-center block transition-colors font-medium"
            >
              Choose Professional
            </Link>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-400/10 rounded-xl p-8 border border-emerald-400/40 relative">
            <h3 className="text-2xl font-semibold mb-6">Enterprise</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$149</span>
              <span className="text-neutral-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Everything in Professional
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Top-of-category placement
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Analytics dashboard
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Review management tools
              </li>
              <li className="flex items-center">
                <span className="text-green-400 mr-3">✓</span>
                Dedicated account manager
              </li>
            </ul>
            <Link 
              href="/join"
              className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-lg py-3 px-4 text-center block transition-colors font-medium"
            >
              Choose Enterprise
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-4">Need a custom solution?</h3>
          <p className="text-neutral-300 mb-6">
            Contact us for volume discounts and custom features for multiple locations
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-3 px-8 transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}