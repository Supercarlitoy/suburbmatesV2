export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-neutral-300 mb-6">Last updated: September 2025</p>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-neutral-300 mb-4">
                At SuburbMates, we collect information to provide better services to our users:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-300">
                <li>Business information (name, address, contact details, ABN)</li>
                <li>User account information (email, password, preferences)</li>
                <li>Usage data (search queries, page views, interactions)</li>
                <li>Location data (for local business discovery)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-neutral-300">
                <li>To provide and maintain our directory services</li>
                <li>To verify business credentials and ABN information</li>
                <li>To improve our search and recommendation algorithms</li>
                <li>To communicate service updates and promotional offers</li>
                <li>To ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
              <p className="text-neutral-300 mb-4">
                We do not sell your personal information. We may share information only in these circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-300">
                <li>With your explicit consent</li>
                <li>For legal compliance or regulatory requirements</li>
                <li>To protect our rights or the safety of others</li>
                <li>With service providers who assist in our operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-neutral-300">
                We implement industry-standard security measures to protect your information, including encryption, 
                secure servers, and regular security audits. However, no internet transmission is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-neutral-300 mb-4">
                Under Australian Privacy Laws, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-300">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Object to certain data processing</li>
                <li>Data portability where applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-neutral-300">
                If you have questions about this Privacy Policy, please contact us at privacy@suburbmates.com.au
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}