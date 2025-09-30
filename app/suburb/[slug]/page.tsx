import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Building2, 
  CheckCircle, 
  ArrowRight,
  Users,
  Star,
  Phone,
  Mail
} from "lucide-react";
import Link from 'next/link';
import { MELBOURNE_SUBURBS } from '@/lib/constants/melbourne-suburbs';
import { BUSINESS_CATEGORIES } from '@/lib/constants/business-categories';
import { prisma } from '@/lib/prisma';
import { generateSuburbContent, generateSuburbFAQs } from '@/lib/content/category-content';

interface SuburbPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function findSuburbBySlug(slug: string) {
  return MELBOURNE_SUBURBS.find(suburb => 
    suburb.id === slug || 
    suburb.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );
}

// Generate static params for top suburbs (we'll start with main ones)
export async function generateStaticParams() {
  const topSuburbs = ['richmond', 'fitzroy', 'hawthorn', 'st-kilda', 'prahran', 'carlton', 'south-yarra', 'brunswick', 'collingwood', 'northcote'];
  return topSuburbs.map(slug => ({
    slug: slug,
  }));
}

async function getSuburbBusinesses(suburbName: string) {
  const businesses = await prisma.business.findMany({
    where: {
      suburb: suburbName,
      approvalStatus: 'APPROVED',
    },
    include: {
      customization: true,
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 20,
  });

  // Get categories that have businesses in this suburb
  const categoriesWithBusinesses = await prisma.business.groupBy({
    by: ['category'],
    where: {
      suburb: suburbName,
      approvalStatus: 'APPROVED',
    },
    _count: {
      category: true,
    },
    orderBy: {
      _count: {
        category: 'desc'
      }
    },
    take: 12,
  });

  return { businesses, categoriesWithBusinesses };
}

function findNearbySuburbs(currentSuburb: string) {
  // This is a simplified version - in production you'd have geographic data
  const suburbGroups: Record<string, string[]> = {
    richmond: ['collingwood', 'abbotsford', 'cremorne', 'burnley'],
    fitzroy: ['collingwood', 'carlton', 'brunswick-east', 'northcote'],
    hawthorn: ['camberwell', 'auburn', 'kew', 'richmond'],
    'st-kilda': ['south-melbourne', 'elwood', 'balaclava', 'albert-park'],
    prahran: ['south-yarra', 'toorak', 'windsor', 'armadale'],
    carlton: ['fitzroy', 'brunswick', 'parkville', 'north-melbourne'],
    'south-yarra': ['prahran', 'toorak', 'richmond', 'melbourne'],
  };

  return suburbGroups[currentSuburb] || ['richmond', 'fitzroy', 'hawthorn', 'carlton'];
}

export default async function SuburbPage({ params }: SuburbPageProps) {
  const { slug } = await params;
  const suburb = findSuburbBySlug(slug);
  
  if (!suburb) {
    notFound();
  }

  const { businesses, categoriesWithBusinesses } = await getSuburbBusinesses(suburb.name);
  const content = generateSuburbContent(suburb.name);
  const faqs = generateSuburbFAQs(suburb.name);
  const nearbySuburbs = findNearbySuburbs(slug);
  const businessCount = businesses.length;

  return (
    <div className="min-h-screen bg-background">
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
              <Link href="/claim">
                <Button>Claim Your Business</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ArrowRight className="w-4 h-4" />
            <Link href="/suburb" className="hover:text-primary">Suburbs</Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{suburb.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Businesses in {suburb.name}
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              Explore verified local businesses across all categories in {suburb.name}, Melbourne.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Building2 className="w-5 h-5" />
                <span>{businessCount} verified businesses</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <MapPin className="w-5 h-5" />
                <span>{suburb.name}, Melbourne</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <CheckCircle className="w-5 h-5" />
                <span>ABN verified</span>
              </div>
            </div>
            <Link href="/claim">
              <Button size="lg" variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Claim Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* SEO-Rich Introductory Copy */}
            <section className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {content.introText}
              </p>
            </section>

            {/* Featured Categories */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Top Services in {suburb.name}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.topCategories.map((category) => {
                  const categorySlug = category.slug;
                  const businessesInCategory = categoriesWithBusinesses.find(c => 
c.category?.toLowerCase().replace(/\s+/g, '-') === categorySlug ||
c.category?.toLowerCase() === category.name.toLowerCase()
                  );
                  const count = businessesInCategory?._count.category || 0;
                  
                  return (
                    <Link key={category.slug} href={`/category/${categorySlug}/${slug}`}>
                      <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6 text-center">
                          <Building2 className="w-8 h-8 text-primary mx-auto mb-3" />
                          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {category.description}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {count} business{count !== 1 ? 'es' : ''}
                          </Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Business Listings */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">
                  All Businesses in {suburb.name}
                </h2>
                <Badge variant="secondary" className="text-sm">
                  {businessCount} businesses
                </Badge>
              </div>
              
              <Suspense fallback={<div className="text-center py-8">Loading businesses...</div>}>
                {businesses.length > 0 ? (
                  <div className="grid gap-6">
                    {businesses.map((business) => (
                      <Card key={business.id} className="glass-card hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Building2 className="w-4 h-4" />
                                    <span>{business.category}</span>
                                    <Badge variant="outline" className="ml-2">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      ABN Verified
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="text-sm text-muted-foreground ml-2">(5.0)</span>
                                  </div>
                                </div>
                              </div>
                              
                              {business.bio && (
                                <p className="text-muted-foreground mb-4 line-clamp-2">
                                  {business.bio}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {business.phone && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Phone className="w-3 h-3" />
                                    <span>{business.phone}</span>
                                  </div>
                                )}
                                {business.email && (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Mail className="w-3 h-3" />
                                    <span>{business.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 md:w-48">
                              <Link href={`/business/${business.slug}`}>
                                <Button className="w-full">
                                  View Profile
                                </Button>
                              </Link>
                              <Button variant="outline" className="w-full">
                                Contact Business
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-card">
                    <CardContent className="text-center py-12">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No businesses listed yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to join the {suburb.name} business community!
                      </p>
                      <Link href="/claim">
                        <Button>List Your {suburb.name} Business</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </Suspense>
            </section>

            {/* Trust/Verification Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Why {suburb.name} Businesses Use SuburbMates</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Verified ABN & Credentials</h3>
                    <p className="text-sm text-muted-foreground">All businesses verified</p>
                  </CardContent>
                </Card>
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Direct Contact, No Middlemen</h3>
                    <p className="text-sm text-muted-foreground">Connect directly with businesses</p>
                  </CardContent>
                </Card>
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <Building2 className="w-8 h-8 text-accent mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Shareable Professional Profiles</h3>
                    <p className="text-sm text-muted-foreground">Branded business pages</p>
                  </CardContent>
                </Card>
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <Users className="w-8 h-8 text-secondary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Community Reviews</h3>
                    <p className="text-sm text-muted-foreground">Real local feedback</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* FAQ Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Owner?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/claim" className="w-full">
                  <Button className="w-full">
                    Claim Your Profile Today
                  </Button>
                </Link>
                <Link href="/search" className="w-full">
                  <Button variant="outline" className="w-full">
                    Browse All Categories
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Explore Nearby Suburbs */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Explore Businesses Nearby
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {nearbySuburbs.map(suburbSlug => {
                  const nearbySuburb = MELBOURNE_SUBURBS.find(s => s.id === suburbSlug);
                  return nearbySuburb ? (
                    <Link key={nearbySuburb.id} href={`/suburb/${nearbySuburb.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="text-sm font-medium">{nearbySuburb.name}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </Link>
                  ) : null;
                })}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* CTA Banner */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Own a business in {suburb.name}?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the {suburb.name} business community and connect with local customers through SuburbMates.
          </p>
          <Link href="/claim">
            <Button size="lg">
              Claim Your Profile Today
            </Button>
          </Link>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au'}/`
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Suburbs',
                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au'}/suburb`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: suburb.name,
                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au'}/suburb/${slug}`
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Place',
            name: suburb.name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: suburb.name,
              addressRegion: 'Victoria',
              addressCountry: 'Australia'
            },
            description: `Local business directory for ${suburb.name}, Melbourne`,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au'}/suburb/${slug}`,
            containedInPlace: {
              '@type': 'City',
              name: 'Melbourne',
              addressRegion: 'Victoria',
              addressCountry: 'Australia'
            }
          })
        }}
      />
    </div>
  );
}