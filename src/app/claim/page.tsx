export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Claim Your Business</h1>
          <p className="text-neutral-300 text-lg">
            Already listed on SuburbMates? Claim your profile to manage your information and track leads.
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-8 border border-white/10 mb-8">
          <h3 className="text-2xl font-semibold mb-6">Search for Your Business</h3>
          <div className="flex gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Enter your business name..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:border-indigo-400"
            />
            <input 
              type="text" 
              placeholder="Suburb (e.g. Brunswick)"
              className="w-48 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-neutral-400 focus:outline-none focus:border-indigo-400"
            />
            <button className="bg-indigo-500 hover:bg-indigo-600 px-8 py-3 rounded-lg font-medium transition-colors">
              Search
            </button>
          </div>
          <p className="text-sm text-neutral-400">
            Can&apos;t find your business? It may not be listed yet. <span className="text-indigo-400">Register it here</span>.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-400/10 rounded-xl p-6 border border-emerald-400/40">
            <h3 className="text-xl font-semibold mb-4">Why Claim Your Listing?</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <span className="text-emerald-400 mr-3">✓</span>
                Update business hours and contact details
              </li>
              <li className="flex items-center">
                <span className="text-emerald-400 mr-3">✓</span>
                Add photos and showcase your services
              </li>
              <li className="flex items-center">
                <span className="text-emerald-400 mr-3">✓</span>
                Respond to customer reviews
              </li>
              <li className="flex items-center">
                <span className="text-emerald-400 mr-3">✓</span>
                Track leads and customer interactions
              </li>
              <li className="flex items-center">
                <span className="text-emerald-400 mr-3">✓</span>
                Get verified ABN badge
              </li>
            </ul>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold mb-4">Verification Required</h3>
            <p className="text-sm text-neutral-300 mb-4">
              To claim a business listing, you&apos;ll need to provide:
            </p>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>• Valid ABN (Australian Business Number)</li>
              <li>• Proof of business ownership or authorization</li>
              <li>• Contact details for verification</li>
              <li>• Business address confirmation</li>
            </ul>
            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-400/30 rounded-lg">
              <p className="text-sm text-indigo-200">
                <strong>Verification typically takes 24-48 hours</strong> and ensures only legitimate business owners can manage listings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}