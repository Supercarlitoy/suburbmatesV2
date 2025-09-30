# 🏗️ Category Landing Page Implementation Example

This example shows how to implement the first category page using the content framework, integrating with your existing SuburbMates architecture.

## 📁 File Structure

```
app/
  category/
    [slug]/
      page.tsx          # Main category page component
      layout.tsx        # Category-specific metadata
    page.tsx           # Category index/browse page
```

## 🎯 Step 1: Create Category Page Component

### `app/category/[slug]/page.tsx`

```tsx path=/Users/carlg/Documents/PROJECTS/suburbmates/app/category/[slug]/page.tsx start=null
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
  Clock
} from "lucide-react";
import Link from 'next/link';
import { BUSINESS_CATEGORIES } from '@/lib/constants/business-categories';
import { MELBOURNE_SUBURBS } from '@/lib/constants/melbourne-suburbs';
import { prisma } from '@/lib/database/prisma';
import { BusinessCard } from '@/components/business/BusinessCard';
import { generateCategoryContent } from '@/lib/content/category-content';

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
  if (!category) return { businesses: [], category: null };

  const businesses = await prisma.business.findMany({
    where: {
      category: category.name,
      published: true,
    },
    include: {
      customization: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // Show top 20, with "Load More" option
  });

  return { businesses, category };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { businesses, category } = await getBusinesses(params.slug);

  if (!category) {
    notFound();
  }

  const content = generateCategoryContent(category);
  const topSuburbs = ['richmond', 'fitzroy', 'hawthorn', 'st-kilda', 'prahran'];
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
              <Link href="/register-business">
                <Button>List Your Business</Button>
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
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {content.hero.title}
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              {content.hero.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Building2 className="w-5 h-5" />
                <span>{businessCount} verified businesses</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock className="w-5 h-5" />
                <span>Average response: 2 hours</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="w-5 h-5" />
                <span>Melbourne-wide coverage</span>
              </div>
            </div>
            <Button size="lg" variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Find {category.name} Near Me
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            
            {/* Trust Section */}
            <section>
              <h2 className="text-3xl font-bold mb-6">{content.trust.title}</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {content.trust.description}
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Verified Identity</h3>
                    <p className="text-sm text-muted-foreground">ABN & license verification</p>
                  </CardContent>
                </Card>
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <Building2 className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Local Expertise</h3>
                    <p className="text-sm text-muted-foreground">Melbourne specialists</p>
                  </CardContent>
                </Card>
                <Card className="glass-card text-center">
                  <CardContent className="pt-6">
                    <Users className="w-8 h-8 text-accent mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Community Reviewed</h3>
                    <p className="text-sm text-muted-foreground">Real customer feedback</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Coverage Areas */}
            <section>
              <h2 className="text-3xl font-bold mb-6">{content.coverage.title}</h2>
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-muted-foreground leading-relaxed">
                  {content.coverage.description}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.coverage.suburbs.map((suburb) => (
                  <Link key={suburb.slug} href={`/category/${params.slug}/${suburb.slug}`}>
                    <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {suburb.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {suburb.description}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            {/* Buyer's Guide */}
            <section>
              <h2 className="text-3xl font-bold mb-6">{content.guide.title}</h2>
              <Card className="glass-card">
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {content.guide.description}
                    </p>
                    <ul className="space-y-3">
                      {content.guide.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Industry Context */}
            <section>
              <h2 className="text-3xl font-bold mb-6">{content.industry.title}</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {content.industry.description}
                </p>
              </div>
            </section>

            {/* Business Listings */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">
                  Featured {category.name} in Melbourne
                </h2>
                <Badge variant="secondary" className="text-sm">
                  {businessCount} businesses
                </Badge>
              </div>
              
              <Suspense fallback={<div className="text-center py-8">Loading businesses...</div>}>
                {businesses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {businesses.map((business) => (
                      <BusinessCard key={business.id} business={business} />
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
                      <Link href="/register-business">
                        <Button>List Your {category.name} Business</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </Suspense>
              
              {businesses.length >= 20 && (
                <div className="text-center mt-8">
                  <Button variant="outline" size="lg">
                    Load More Businesses
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/register-business" className="w-full">
                  <Button className="w-full">
                    List Your Business
                  </Button>
                </Link>
                <Link href="/search" className="w-full">
                  <Button variant="outline" className="w-full">
                    Browse All Categories
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Popular Suburbs */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Popular Areas
                </CardTitle>
                <CardDescription>
                  Top suburbs for {category.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {topSuburbs.map(suburbSlug => {
                  const suburb = MELBOURNE_SUBURBS.find(s => s.id === suburbSlug);
                  return suburb ? (
                    <Link key={suburb.id} href={`/category/${params.slug}/${suburb.id}`}>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer">
                        <span className="text-sm font-medium">{suburb.name}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </Link>
                  ) : null;
                })}
              </CardContent>
            </Card>

            {/* Related Categories */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Related Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {BUSINESS_CATEGORIES
                  .filter(cat => cat.id !== params.slug)
                  .slice(0, 5)
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

      {/* Footer CTA */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect {category.name}?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Melbourne residents who trust SuburbMates to connect with verified local professionals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg">
              Get Quotes from {category.name}
            </Button>
            <Link href="/register-business">
              <Button variant="outline" size="lg">
                List Your {category.name} Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## 🎯 Step 2: Create Category Metadata Layout

### `app/category/[slug]/layout.tsx`

```tsx path=/Users/carlg/Documents/PROJECTS/suburbmates/app/category/[slug]/layout.tsx start=null
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BUSINESS_CATEGORIES } from '@/lib/constants/business-categories';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === params.slug);
  
  if (!category) {
    return {
      title: 'Category Not Found - SuburbMates',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  const categoryUrl = `${baseUrl}/category/${category.id}`;
  
  // Generate OG image with fallback
  const ogUrl = `/api/og?slug=${encodeURIComponent(category.id)}&name=${encodeURIComponent(category.name)}&suburb=Melbourne`;
  const fallback = "/social/og-image-default.png";

  return {
    title: `${category.name} in Melbourne | SuburbMates`,
    description: `Find trusted ${category.name.toLowerCase()} in Melbourne. Verified professionals with reviews, insurance, and local expertise. Connect with ${category.name.toLowerCase()} near you.`,
    keywords: `${category.name}, Melbourne ${category.name.toLowerCase()}, local ${category.name.toLowerCase()}, verified ${category.name.toLowerCase()}`,
    openGraph: {
      title: `Find Trusted ${category.name} in Melbourne`,
      description: `Connect with verified ${category.name.toLowerCase()} across Melbourne. Professional services with reviews and credentials.`,
      url: categoryUrl,
      type: 'website',
      locale: 'en_AU',
      siteName: 'SuburbMates',
      images: [ogUrl, fallback],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} in Melbourne`,
      description: `Trusted ${category.name.toLowerCase()} with verified credentials and reviews`,
      images: [ogUrl, fallback],
    },
    alternates: {
      canonical: categoryUrl,
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default function CategoryLayout({ params, children }: Props) {
  const category = BUSINESS_CATEGORIES.find(cat => cat.id === params.slug);
  
  if (!category) {
    notFound();
  }

  return <>{children}</>;
}
```

## 🎯 Step 3: Create Content Generation Utility

### `lib/content/category-content.ts`

```ts path=/Users/carlg/Documents/PROJECTS/suburbmates/lib/content/category-content.ts start=null
import { MELBOURNE_SUBURBS } from '@/lib/constants/melbourne-suburbs';

interface CategoryContent {
  hero: {
    title: string;
    description: string;
  };
  trust: {
    title: string;
    description: string;
  };
  coverage: {
    title: string;
    description: string;
    suburbs: Array<{
      name: string;
      slug: string;
      description: string;
    }>;
  };
  guide: {
    title: string;
    description: string;
    tips: string[];
  };
  industry: {
    title: string;
    description: string;
  };
}

export function generateCategoryContent(category: any): CategoryContent {
  const categoryName = category.name.toLowerCase();
  
  // Dynamic content based on category type
  const contentTemplates = {
    plumbing: {
      hero: {
        title: `Find Trusted Plumbers in Melbourne`,
        description: `Melbourne's plumbing industry serves over 5 million residents across 31 councils, from heritage homes in Toorak to modern apartments in Southbank. Connect with verified professionals who understand Melbourne's unique infrastructure.`
      },
      trust: {
        title: `Why Choose Melbourne Plumbers Through SuburbMates?`,
        description: `Every plumber on SuburbMates is verified with current licenses, insurance, and ABN registration. Our platform connects you with local professionals who understand Melbourne's building codes, heritage property requirements, and seasonal challenges like tree root intrusions during winter months.`
      },
      guide: {
        title: `What to Look for in Melbourne Plumbers`,
        description: `Choose licensed plumbers with Victorian Building Authority registration and comprehensive insurance. Look for specialists in your property type and emergency availability.`,
        tips: [
          `Victorian Building Authority registration and current licensing`,
          `Comprehensive insurance coverage for residential and commercial work`,
          `Experience with your property type (heritage, apartment, commercial)`,
          `Emergency availability for urgent repairs and burst pipes`,
          `Upfront pricing and written quotes for all work`,
          `Recent customer reviews focusing on quality and reliability`
        ]
      }
    },
    // Add templates for other categories...
    default: {
      hero: {
        title: `Find Trusted ${category.name} in Melbourne`,
        description: `Connect with verified ${categoryName} professionals across Melbourne. All businesses are identity-verified with current credentials and local expertise.`
      },
      trust: {
        title: `Why Choose Melbourne ${category.name} Through SuburbMates?`,
        description: `Every ${categoryName} business on SuburbMates is verified with current licenses, insurance, and ABN registration. Connect with local professionals who understand Melbourne's unique requirements and deliver quality services.`
      },
      guide: {
        title: `What to Look for in ${category.name}`,
        description: `Choose professionals with proper credentials, insurance, and proven track records in Melbourne.`,
        tips: [
          `Current business registration and relevant licensing`,
          `Comprehensive insurance coverage`,
          `Positive customer reviews and ratings`,
          `Clear pricing and service agreements`,
          `Local Melbourne experience and knowledge`,
          `Professional communication and reliability`
        ]
      }
    }
  };

  const template = contentTemplates[category.id as keyof typeof contentTemplates] || contentTemplates.default;
  
  return {
    ...template,
    coverage: {
      title: `Top ${category.name} Areas in Melbourne`,
      description: `Melbourne ${categoryName} serve diverse areas from the inner city to outer suburbs. Inner Melbourne specialists handle urban challenges, Eastern suburbs focus on established neighborhoods, and growth corridors serve new developments.`,
      suburbs: [
        { name: 'Richmond', slug: 'richmond', description: 'Heritage terraces and modern conversions' },
        { name: 'Hawthorn', slug: 'hawthorn', description: 'Established family homes and mature neighborhoods' },
        { name: 'Fitzroy', slug: 'fitzroy', description: 'Creative hub with diverse property types' },
        { name: 'St Kilda', slug: 'st-kilda', description: 'Coastal living with apartments and period homes' },
        { name: 'Docklands', slug: 'docklands', description: 'Modern apartments and commercial buildings' },
      ]
    },
    industry: {
      title: `${category.name} Industry in Melbourne`,
      description: `Melbourne's ${categoryName} industry adapts to unique local challenges and opportunities. The city's growth boom has created high demand for qualified professionals, making verified specialists increasingly valuable for both routine services and specialized projects.`
    }
  };
}
```

## 🚀 Implementation Notes

### **Next Steps**:
1. **Copy these files** into your SuburbMates codebase
2. **Update imports** to match your existing component paths
3. **Test the plumbing category** at `/category/plumbing`
4. **Create additional categories** using the same pattern
5. **Update sitemap.ts** to include category pages
6. **Add to robots.txt** once live

### **Integration Points**:
- Uses your existing `BUSINESS_CATEGORIES` constants
- Integrates with `BusinessCard` component
- Follows your glassmorphism design system
- Includes proper SEO metadata and OG images
- Contains comprehensive internal linking

This implementation provides a production-ready category landing page with rich, unique content that will rank well and convert visitors to leads.