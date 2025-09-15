import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rss, 
  MapPin, 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Sparkles,
  Heart,
  ArrowRight,
  Bell
} from "lucide-react";

export const metadata: Metadata = {
  title: "Business Feed - Coming Soon | SuburbMates",
  description: "Stay updated with local Melbourne businesses. Our community feed is launching soon with business updates, local news, and suburb-specific content.",
  keywords: ["local businesses", "Melbourne", "business feed", "community updates", "local news"],
  openGraph: {
    title: "Business Feed - Coming Soon | SuburbMates",
    description: "Stay updated with local Melbourne businesses. Coming soon with community feed and local updates.",
    type: "website",
    siteName: "SuburbMates"
  }
};

export default function FeedComingSoon() {
  return (
    <div className="min-h-screen aurora-bg relative overflow-hidden">
      {/* SuburbMates Watermark */}
      <div 
        className="absolute inset-0 flex items-centre justify-centre pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><text x="200" y="200" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="%23000000" opacity="0.05">SuburbMates</text></svg>')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'centre',
          backgroundSize: '400px 400px'
        }}
      />

      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-centre justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              SuburbMates
            </Link>
            <div className="flex gap-3">
              <Link href="/search">
                <Button variant="outline">Find Businesses</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">List Your Business</Button>
              </Link>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Hero Section */}
          <div className="text-centre space-y-6">
            <div className="inline-flex items-centre gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" />
              Coming Soon
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Your Local Business
              <span className="text-primary block">Community Feed</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay connected with Melbourne's local business community. 
              Get updates, news, and insights from businesses in your suburb.
            </p>
          </div>

          {/* Coming Soon Card */}
          <Card className="glass-card max-w-3xl mx-auto">
            <CardHeader className="text-centre">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-centre justify-centre mb-4">
                <Rss className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Building Your Community Feed
              </CardTitle>
              <CardDescription className="text-lg">
                We're creating a dynamic feed where you can discover local business updates, 
                community news, and connect with your neighborhood.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Feed Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 text-centre">
                  What's Coming to Your Feed
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Business Updates</h4>
                      <p className="text-sm text-blue-800">
                        New services, special offers, and announcements from local businesses
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Suburb Focus</h4>
                      <p className="text-sm text-green-800">
                        Personalised content based on your location and interests
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">Community Stories</h4>
                      <p className="text-sm text-purple-800">
                        Success stories and testimonials from local customers
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900">Trending Services</h4>
                      <p className="text-sm text-orange-800">
                        Popular businesses and services in your area
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Cards */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Feed Preview</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-centre gap-2 mb-1">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-centre justify-centre text-white text-xs font-bold">M</div>
                      <span className="text-sm font-medium">Mike's Plumbing • Richmond</span>
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    </div>
                    <p className="text-sm text-gray-600">"Just completed emergency repairs for 3 families this week. Available 24/7 for urgent plumbing issues!"</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-centre justify-centre text-white text-xs font-bold">G</div>
                      <span className="text-sm font-medium">Green Thumb Gardens • Carlton</span>
                      <Badge variant="secondary" className="text-xs">Trending</Badge>
                    </div>
                    <p className="text-sm text-gray-600">"Spring garden makeovers are booking fast! Get your quote before the busy season starts."</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-centre justify-centre text-white text-xs font-bold">S</div>
                      <span className="text-sm font-medium">Sarah's Bakery • Fitzroy</span>
                      <Badge variant="secondary" className="text-xs">Community</Badge>
                    </div>
                    <p className="text-sm text-gray-600">"Thank you to all our local customers! We've donated 100 meals to the community centre this month."</p>
                  </div>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-centre">
                  <div className="text-2xl font-bold text-primary">Daily</div>
                  <div className="text-sm text-gray-600">Fresh Updates</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">Local</div>
                  <div className="text-sm text-gray-600">Suburb Focus</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">Real</div>
                  <div className="text-sm text-gray-600">Community Stories</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-centre space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Ready to Share Your Business Story?
              </h2>
              <p className="text-gray-600">
                Join SuburbMates and start building your community presence!
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Register Your Business
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="pt-8 border-t">
              <p className="text-sm text-gray-500 mb-4">
                Be the first to know when the community feed launches
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button variant="outline">
                  Notify Me
                </Button>
              </div>
            </div>
          </div>

          {/* Community Benefits */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-centre">Why Join the SuburbMates Community?</CardTitle>
              <CardDescription className="text-centre">
                Benefits for both businesses and residents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">For Businesses</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-centre gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Share updates and connect with local customers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Build trust through community engagement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Showcase your work and success stories
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Get discovered by nearby residents
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-accent">For Residents</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Discover trusted local businesses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Stay updated with community news
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Read real reviews and testimonials
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Support your local economy
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-centre space-y-4">
            <div className="flex items-centre justify-centre gap-2 text-muted-foreground">
              <span className="text-sm">Powered by</span>
              <div className="flex items-centre gap-2">
                <div className="w-6 h-6 bg-primary rounded text-white text-xs flex items-centre justify-centre font-bold">
                  S
                </div>
                <span className="font-bold text-primary">SuburbMates</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Connecting Melbourne's business community. Building trust through verification 
              and local focus.
            </p>
            <div className="flex justify-centre gap-4 text-xs text-muted-foreground">
              <Link href="/about" className="hover:text-primary">
                About
              </Link>
              <Link href="/search" className="hover:text-primary">
                Find Businesses
              </Link>
              <Link href="/signup" className="hover:text-primary">
                List Your Business
              </Link>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}