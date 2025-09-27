export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-neutral-300 mb-6">Last updated: September 2025</p>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <p className="text-neutral-300">
                By accessing and using SuburbMates, you accept and agree to be bound by the terms and 
                provision of this agreement. These Terms of Service govern your use of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
              <p className="text-neutral-300 mb-4">
                SuburbMates is a business directory platform that connects local Melbourne businesses 
                with customers. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-300">
                <li>Business listing and discovery</li>
                <li>ABN verification and credibility badges</li>
                <li>Lead generation and tracking tools</li>
                <li>Customer review and rating systems</li>
                <li>Advertising and promotion services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
              <p className="text-neutral-300 mb-4">As a user of SuburbMates, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-neutral-300">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the platform lawfully and ethically</li>
                <li>Respect intellectual property rights</li>
                <li>Not engage in spam, fraud, or malicious activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Business Listings</h2>
              <p className="text-neutral-300 mb-4">For business owners:</p>
              <ul className="list-disc list-inside space-y-2 text-neutral-300">
                <li>You must own or be authorized to represent the business</li>
                <li>All business information must be accurate and current</li>
                <li>ABN and business credentials are subject to verification</li>
                <li>You are responsible for responding to customer inquiries</li>
                <li>False or misleading information may result in removal</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Payment and Billing</h2>
              <p className="text-neutral-300 mb-4">For paid services:</p>
              <ul className="list-disc list-inside space-y-2 text-neutral-300">
                <li>All fees are charged in Australian Dollars (AUD)</li>
                <li>Payments are processed monthly in advance</li>
                <li>Refunds are subject to our refund policy</li>
                <li>Failed payments may result in service suspension</li>
                <li>Price changes will be communicated 30 days in advance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <p className="text-neutral-300">
                The SuburbMates platform, including its design, functionality, and content, is protected 
                by copyright and other intellectual property laws. You may not copy, distribute, or 
                create derivative works without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-neutral-300">
                SuburbMates provides the platform &quot;as is&quot; without warranties. We are not liable for 
                business relationships, transactions, or disputes between users. Our liability is 
                limited to the amount paid for our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-neutral-300">
                We may terminate or suspend accounts that violate these terms. Users may cancel 
                their accounts at any time through their account settings or by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-neutral-300">
                For questions about these Terms of Service, contact us at legal@suburbmates.com.au
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}