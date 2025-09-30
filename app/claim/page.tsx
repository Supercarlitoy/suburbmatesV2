'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Building2, CheckCircle, ArrowRight, Users, Clock, Shield, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClaimPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Redirect to search page with the query
    router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              SuburbMates
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/search">
                <Button variant="ghost">Browse All</Button>
              </Link>
              <Link href="/register-business">
                <Button>Register New Business</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Is Your Business Already Listed?
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Search our directory to see if your business is already on SuburbMates. 
            If found, you can claim and customize your profile for free.
          </p>
          
          {/* Search Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="p-6">
              <form onSubmit={handleSearch}>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      type="text" 
                      placeholder="Search by business name or ABN..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isSearching}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="px-6"
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search Directory'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Value Proposition */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <Card className="text-center">
              <CardContent className="pt-6">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Free to Claim</h3>
                <p className="text-gray-600">
                  Take control of your business listing at no cost. Full ownership and customization included.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Quick Setup</h3>
                <p className="text-gray-600">
                  Complete verification process in minutes. Most claims are approved within 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verified Listing</h3>
                <p className="text-gray-600">
                  Verified businesses get priority placement and the trust badge that customers look for.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How to Claim Your Business</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Search & Find</h3>
                <p className="text-gray-600">
                  Use the search above to locate your business in our directory of Melbourne businesses.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Verify Ownership</h3>
                <p className="text-gray-600">
                  Verify your ownership through business email, ABN verification, or document upload.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Customize Profile</h3>
                <p className="text-gray-600">
                  Once verified, customize your profile with photos, descriptions, and contact details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Don't See Your Business Listed?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            No problem! You can create a brand new business profile from scratch. 
            It only takes a few minutes to get started.
          </p>
          <Link href="/register-business">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Register New Business
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What do I need to claim my business?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You'll need to verify ownership through your business email, ABN, or by uploading 
                  official business documents. The process is simple and secure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How long does verification take?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Most verifications are completed within 24 hours. Email and ABN verifications 
                  are often instant, while document reviews may take up to 2 business days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Is there a cost to claim my business?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No, claiming your business listing is completely free. All features including 
                  profile customization, photo uploads, and customer messaging are included at no cost.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What happens after I claim my business?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Once verified, you gain full control over your listing. You can update information, 
                  add photos, respond to reviews, and access analytics about your profile views.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}