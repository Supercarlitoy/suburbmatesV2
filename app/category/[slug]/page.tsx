import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { glass } from '@/lib/design-system';
import { SuburbMatesLogo } from '@/components/ui/SuburbMatesLogo';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  MapPin, 
  Building2, 
  CheckCircle, 
  ArrowRight,
  Users,
  Clock,
  Star,
  Phone,
  Mail
} from "lucide-react";
import Link from 'next/link';
import { BUSINESS_CATEGORIES } from '@/lib/constants/business-categories';
import { MELBOURNE_SUBURBS } from '@/lib/constants/melbourne-suburbs';
import { prisma } from '@/lib/prisma';
import { generateCategoryContent, generateCategoryFAQs } from '@/lib/content/category-content';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all categories
export async function generateStaticParams() {
  return BUSINESS_CATEGORIES.map(category => ({
    slug: category.id,
  }));
}

async function getBusinesses(categorySlug: string) {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === categorySlug);
  if (!category) return { businesses: [], category: null, suburbsWithBusinesses: [] };

  const businesses = await prisma.business.findMany({
    where: {
      category: category.name,
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

  // Get suburbs that have businesses in this category for navigation
  const suburbsWithBusinesses = await prisma.business.groupBy({
    by: ['suburb'],
    where: {
      category: category.name,
      approvalStatus: 'APPROVED',
    },
    _count: {
      suburb: true,
    },
    orderBy: {
      _count: {
        suburb: 'desc'
      }
    },
    take: 20,
  });

  return { businesses, category, suburbsWithBusinesses };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const { businesses, category, suburbsWithBusinesses } = await getBusinesses(resolvedParams.slug);

  if (!category) {
    notFound();
  }

  const content = generateCategoryContent(category);
  const faqs = generateCategoryFAQs(category);
  const businessCount = businesses.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`border-b ${glass.navBar}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <SuburbMatesLogo variant="NavigationLogo" size="sm" />
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
            <Link href="/category" className="hover:text-primary">Categories</Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{category.name}</span>
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
              {category.name} in Melbourne
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              Find verified local {category.name.toLowerCase()} across Melbourne suburbs.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <StatusBadge variant="blue" size="md" className="bg-white/20 text-white border-white/30">
                <Building2 className="w-5 h-5 mr-2" />
                {businessCount} verified businesses
              </StatusBadge>
              <StatusBadge variant="green" size="md" className="bg-white/20 text-white border-white/30">
                <CheckCircle className="w-5 h-5 mr-2" />
                ABN verified
              </StatusBadge>
              <StatusBadge variant="purple" size="md" className="bg-white/20 text-white border-white/30">
                <Users className="w-5 h-5 mr-2" />
                Local reviews
              </StatusBadge>
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

            {/* Business Listings */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">
                  Featured {category.name}
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
                                    <MapPin className="w-4 h-4" />
                                    <span>{business.suburb}, VIC</span>
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
                        No {category.name} businesses yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Be the first to join our {category.name} community in Melbourne!
                      </p>
                      <Link href="/claim">
                        <Button>List Your {category.name} Business</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </Suspense>
            </section>

            {/* Suburb Navigation Links */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Find {category.name} by Suburb</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suburbsWithBusinesses.slice(0, 20).map((item) => {
                  const suburbSlug = item.suburb.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link key={item.suburb} href={`/category/${resolvedParams.slug}/${suburbSlug}`}>
                      <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {item.suburb}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item._count.suburb} business{item._count.suburb !== 1 ? 'es' : ''}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Trust/Verification Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Why Melbourne Chooses SuburbMates</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Verified ABN & Business Details</h3>
                    <p className="text-sm text-muted-foreground">All businesses undergo verification</p>
                  </CardContent>
                </Card>
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Local Reviews from Real Residents</h3>
                    <p className="text-sm text-muted-foreground">Authentic community feedback</p>
                  </CardContent>
                </Card>
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <Phone className="w-8 h-8 text-accent mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">No Commission Fees</h3>
                    <p className="text-sm text-muted-foreground">Direct connections with businesses</p>
                  </CardContent>
                </Card>
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <Building2 className="w-8 h-8 text-secondary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Shareable Professional Profiles</h3>
                    <p className="text-sm text-muted-foreground">Businesses get branded pages</p>
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
                    Claim Your Free Profile
                  </Button>
                </Link>
                <Link href="/search" className="w-full">
                  <Button variant="outline" className="w-full">
                    Browse All Categories
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Related Categories */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Related Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {BUSINESS_CATEGORIES
                  .filter(cat => cat.id !== resolvedParams.slug)
                  .slice(0, 6)
                  .map(cat => (
                    <Link key={cat.id} href={`/category/${cat.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="text-sm">{cat.name}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* CTA Banner */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Own a {category.name.toLowerCase()} business in Melbourne?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of Melbourne businesses already connecting with local customers through SuburbMates.
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
                name: 'Categories',
                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au'}/category`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: category.name,
                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au'}/category/${category.id}`
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
            '@type': 'CollectionPage',
            name: `${category.name} in Melbourne`,
            description: `Find trusted ${category.name.toLowerCase()} across Melbourne suburbs. Verified business profiles with local reviews.`,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au'}/category/${category.id}`,
            mainEntity: {
              '@type': 'ItemList',
              name: `${category.name} Businesses`,
              numberOfItems: businessCount,
              itemListElement: businesses.map((business, index) => ({
                '@type': 'LocalBusiness',
                position: index + 1,
                name: business.name,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: business.suburb,
                  addressRegion: 'Victoria',
                  addressCountry: 'Australia'
                },
                url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au'}/business/${business.slug}`
              }))
            }
          })
        }}
      />
    </div>
  );
}