import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Check, 
  Star, 
  Zap, 
  Crown,
  Building2,
  Users,
  BarChart3,
  Shield,
  Mail,
  Smartphone,
  Globe,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing - SuburbMates',
  description: 'Transparent pricing for SuburbMates business directory. Start free and scale as you grow your Melbourne business.',
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      icon: Building2,
      popular: false,
      features: [
        'Basic business profile',
        'Contact information display',
        'Service area selection',
        'Category listing',
        'Customer inquiries',
        'Basic analytics',
        'Mobile responsive profile',
        'SuburbMates branding'
      ],
      limitations: [
        'Limited customization',
        'Standard support',
        'SuburbMates watermark'
      ],
      cta: 'Get Started Free',
      href: '/signup'
    },
    {
      name: 'Premium',
      price: '$29',
      period: 'per month',
      description: 'Enhanced features for growing businesses',
      icon: Star,
      popular: true,
      features: [
        'Everything in Free',
        'Custom themes and colors',
        'Photo gallery (up to 20 photos)',
        'Custom business hours',
        'Social media integration',
        'Priority search placement',
        'Advanced analytics',
        'Email marketing integration',
        'Custom contact forms',
        'Remove SuburbMates branding',
        'Priority customer support'
      ],
      limitations: [],
      cta: 'Start Premium Trial',
      href: '/signup?plan=premium'
    },
    {
      name: 'Business+',
      price: '$79',
      period: 'per month',
      description: 'Full-featured solution for established businesses',
      icon: Crown,
      popular: false,
      features: [
        'Everything in Premium',
        'Unlimited photo gallery',
        'Video testimonials',
        'Advanced SEO optimization',
        'Multiple location management',
        'API access for integrations',
        'White-label options',
        'Dedicated account manager',
        'Custom reporting',
        'Lead scoring and qualification',
        'Integration with CRM systems'
      ],
      limitations: [],
      cta: 'Contact Sales',
      href: '/contact'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'ABN Verified',
      description: 'All businesses verified through Australian Business Registry'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Profiles look perfect on all devices and screen sizes'
    },
    {
      icon: TrendingUp,
      title: 'Lead Generation',
      description: 'Direct customer inquiries with full contact details'
    },
    {
      icon: BarChart3,
      title: 'Analytics Included',
      description: 'Track profile views, inquiries, and conversion rates'
    },
    {
      icon: Mail,
      title: 'Email Notifications',
      description: 'Instant notifications for new customer inquiries'
    },
    {
      icon: Globe,
      title: 'SEO Optimized',
      description: 'Profiles optimized for Google and local search results'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
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

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Start free and scale as your business grows. No hidden fees, no setup costs, 
            cancel anytime. Join 500+ Melbourne businesses already growing with SuburbMates.
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-12">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              30-day money-back guarantee
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              No setup fees
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Cancel anytime
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${plan.popular ? 'bg-primary' : 'bg-gray-100'}`}>
                      <plan.icon className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">✓ Included Features:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-gray-600 mb-2">Limitations:</h4>
                        <ul className="space-y-1">
                          {plan.limitations.map((limitation, i) => (
                            <li key={i} className="text-sm text-gray-500">
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <Link href={plan.href}>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What You Get With Every Plan</h2>
            <p className="text-lg text-gray-600">
              All plans include these powerful features to help your business succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Is the free plan really free forever?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes! Our free plan is completely free forever. You can create your business profile, 
                    receive customer inquiries, and access basic analytics at no cost. No credit card required.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Can I upgrade or downgrade at any time?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Absolutely. You can upgrade your plan at any time to access more features. If you need to 
                    downgrade, changes take effect at the next billing cycle. No penalties or fees for changes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Do you offer refunds?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied 
                    within the first 30 days, contact us for a full refund.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. 
                    All payments are processed securely through Stripe.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Is there a setup fee or contract?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    No setup fees and no long-term contracts. All plans are month-to-month and you can 
                    cancel at any time. What you see is what you pay.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of Melbourne businesses already connecting with local customers through SuburbMates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                Start Free Today
              </Button>
            </Link>
            <Link href="/search">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Businesses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/help" className="text-blue-600 hover:underline">
              Help Center
            </Link>
            <Link href="/about" className="text-blue-600 hover:underline">
              About Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}