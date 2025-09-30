import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Users } from "lucide-react";
import Link from 'next/link';
import { BUSINESS_CATEGORIES } from '@/lib/constants/business-categories';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Browse Business Categories - SuburbMates',
  description: 'Explore all business categories on SuburbMates. Find plumbers, restaurants, hair salons, and more across Melbourne suburbs.',
  robots: {
    index: true,
    follow: true,
  }
};

async function getCategoryStats() {
  // Get business counts per category
  const categoryStats = await prisma.business.groupBy({
    by: ['category'],
    where: {
      approvalStatus: 'APPROVED',
    },
    _count: {
      category: true,
    },
    orderBy: {
      _count: {
        category: 'desc'
      }
    }
  });

  return categoryStats;
}

export default async function CategoriesPage() {
  const categoryStats = await getCategoryStats();

  // Create a map for quick lookup of business counts
  const categoryCountMap = new Map(
    categoryStats.map(stat => [stat.category, stat._count.category])
  );

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
                <Button variant="ghost">Search</Button>
              </Link>
              <Link href="/suburb">
                <Button variant="ghost">Browse Suburbs</Button>
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
            <span className="text-foreground font-medium">Categories</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Browse Business Categories
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Discover verified local businesses across Melbourne by category. From essential services to dining and entertainment.
          </p>
          <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm inline-flex">
            <Building2 className="w-4 h-4" />
            <span>{BUSINESS_CATEGORIES.length} business categories</span>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {BUSINESS_CATEGORIES.map((category) => {
            const businessCount = categoryCountMap.get(category.name) || 0;
            
            return (
              <Link key={category.id} href={`/category/${category.id}`}>
                <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                  <CardHeader className="text-center pb-3">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-center">
                    <CardDescription className="mb-4 line-clamp-2">
                      {category.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {businessCount} business{businessCount !== 1 ? 'es' : ''}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <section className="text-center py-16">
          <h2 className="text-3xl font-bold mb-4">
            Don't see your business category?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            SuburbMates welcomes all types of businesses. Join our growing community of Melbourne professionals.
          </p>
          <Link href="/claim">
            <Button size="lg">
              List Your Business Today
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}