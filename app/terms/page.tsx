import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - SuburbMates',
  description: 'Terms and conditions for using SuburbMates business directory and platform services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              SuburbMates
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  By accessing and using SuburbMates ("we", "us", or "our"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  SuburbMates is a business directory platform connecting Melbourne businesses with local residents. These terms apply to all users, including business owners, customers, and visitors.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Use License</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Permission is granted to temporarily download one copy of SuburbMates' materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul>
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Business Listings and Verification</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  <strong>Business Registration:</strong> Businesses may register for free to create a profile on SuburbMates. By registering, you warrant that:
                </p>
                <ul>
                  <li>You are authorized to represent the business</li>
                  <li>All information provided is accurate and current</li>
                  <li>You will maintain the accuracy of your business information</li>
                  <li>You operate a legitimate business in Melbourne, Australia</li>
                </ul>
                
                <p>
                  <strong>ABN Verification:</strong> We use the Australian Business Registry to verify business credentials. Providing false ABN information is prohibited and may result in account termination.
                </p>

                <p>
                  <strong>Business Claims:</strong> If your business appears in our directory, you may claim ownership through our verification process. False claims will be rejected and may result in legal action.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. User Conduct and Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>Users agree to use SuburbMates responsibly and lawfully. Prohibited activities include:</p>
                <ul>
                  <li>Posting false, misleading, or defamatory content</li>
                  <li>Impersonating another business or individual</li>
                  <li>Attempting to manipulate search results or reviews</li>
                  <li>Using automated systems to access our platform</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Spamming or sending unsolicited communications</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
                </p>
                <p>
                  We collect and process personal information in accordance with Australian privacy laws, including the Privacy Act 1988. By using our service, you consent to such processing and you warrant that all data provided by you is accurate.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Lead Generation and Communications</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  SuburbMates facilitates direct communication between businesses and potential customers. We do not guarantee the quality or outcome of these interactions.
                </p>
                <p>
                  <strong>For Businesses:</strong> You are responsible for responding to legitimate inquiries in a timely and professional manner.
                </p>
                <p>
                  <strong>For Customers:</strong> Please provide accurate contact information and genuine inquiries when contacting businesses.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Intellectual Property Rights</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  The service and its original content, features, and functionality are and will remain the exclusive property of SuburbMates and its licensors. The service is protected by copyright, trademark, and other laws.
                </p>
                <p>
                  Users retain ownership of content they post but grant SuburbMates a license to use such content for platform operations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, SuburbMates excludes all representations, warranties, conditions and terms whether express or implied.
                </p>
                <p>
                  We make no warranties about the accuracy, reliability, completeness, or timeliness of business information listed on our platform.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Limitations</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  In no event shall SuburbMates or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use SuburbMates, even if SuburbMates or its authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Revisions and Errata</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  The materials appearing on SuburbMates could include technical, typographical, or photographic errors. SuburbMates does not warrant that any of the materials on its website are accurate, complete, or current.
                </p>
                <p>
                  SuburbMates may make changes to the materials contained on its website at any time without notice.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of Victoria, Australia, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p>
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul>
                  <li>Email: legal@suburbmates.com.au</li>
                  <li>Address: Melbourne, Victoria, Australia</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t text-center">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/about" className="text-blue-600 hover:underline">
                About Us
              </Link>
              <Link href="/help" className="text-blue-600 hover:underline">
                Help Center
              </Link>
              <Link href="/" className="text-blue-600 hover:underline">
                Back to SuburbMates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}