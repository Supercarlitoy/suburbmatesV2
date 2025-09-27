"use client";

import dynamic from "next/dynamic";

const BusinessRegistrationForm = dynamic(() => import("@/components/forms/BusinessRegistrationForm"), { ssr: false });

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Join SuburbMates</h1>
          <p className="text-neutral-300 text-lg">
            Register your business and start connecting with local Melbourne customers
          </p>
        </div>
        
        <BusinessRegistrationForm />
        
        <div className="mt-16 bg-white/5 rounded-xl p-8 border border-white/10">
          <h3 className="text-2xl font-semibold mb-6">Registration Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Submit Details</h4>
              <p className="text-sm text-neutral-400">
                Provide your business information and ABN for verification
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Verification</h4>
              <p className="text-sm text-neutral-400">
                We verify your ABN and business credentials (24-48 hours)
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Go Live</h4>
              <p className="text-sm text-neutral-400">
                Your verified listing goes live and starts attracting customers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}