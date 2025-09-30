import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Building2 } from "lucide-react";
import Link from 'next/link';
import { MELBOURNE_SUBURBS } from '@/lib/constants/melbourne-suburbs';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Browse Melbourne Suburbs - SuburbMates',
  description: 'Explore businesses by Melbourne suburb. Find local services in Richmond, Fitzroy, Hawthorn, and more across greater Melbourne.',
  robots: {
    index: true,
    follow: true,
  }
};

async function getSuburbStats() {
  // Get business counts per suburb (top suburbs only)
  const suburbStats = await prisma.business.groupBy({
    by: ['suburb'],
    where: {
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
    take: 50, // Top 50 suburbs with businesses
  });

  return suburbStats;
}

export default async function SuburbsPage() {
  const suburbStats = await getSuburbStats();

  // Create a map for quick lookup of business counts
  const suburbCountMap = new Map(
    suburbStats.map(stat => [stat.suburb, stat._count.suburb])
  );

  // Featured suburbs (ones with landing pages implemented)
  const featuredSuburbs = ['richmond', 'fitzroy', 'hawthorn', 'st-kilda', 'prahran', 'carlton', 'south-yarra', 'brunswick', 'collingwood', 'northcote'];

  // Get suburb data for featured ones
  const featuredSuburbData = featuredSuburbs
    .map(slug => MELBOURNE_SUBURBS.find(s => s.id === slug))
    .filter((suburb): suburb is NonNullable<typeof suburb> => Boolean(suburb));

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
              <Link href="/category">
                <Button variant="ghost">Browse Categories</Button>
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
            <span className="text-foreground font-medium">Suburbs</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Browse Melbourne Suburbs
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Discover verified local businesses by suburb across greater Melbourne. From inner-city to outer suburbs.
          </p>
          <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm inline-flex">
            <MapPin className="w-4 h-4" />
            <span>600+ Melbourne suburbs</span>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Featured Suburbs */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Suburbs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {featuredSuburbData.map((suburb) => {
              const businessCount = suburbCountMap.get(suburb.name) || 0;
              
              return (
                <Link key={suburb.id} href={`/suburb/${suburb.id}`}>
                  <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                    <CardHeader className="text-center pb-3">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {suburb.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-center">
                      <CardDescription className="mb-4">
                        Melbourne, Victoria
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
        </section>

        {/* All Suburbs with Businesses */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">All Active Suburbs</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {suburbStats.map((stat) => (
              <Card key={stat.suburb} className="glass-card hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">{stat.suburb}</h3>
                      <p className="text-xs text-muted-foreground">
                        {stat._count.suburb} business{stat._count.suburb !== 1 ? 'es' : ''}
                      </p>
                    </div>
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-16">
          <h2 className="text-3xl font-bold mb-4">
            Don't see your suburb listed?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            SuburbMates covers all Melbourne suburbs. List your business and we'll add your area to our directory.
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