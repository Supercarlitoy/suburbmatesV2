import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageSquare,
  Building2,
  HelpCircle,
  CreditCard
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - SuburbMates',
  description: 'Get in touch with the SuburbMates team. Sales, support, partnerships, and general inquiries welcome.',
};

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'General inquiries and support',
      contact: 'hello@suburbmates.com.au',
      response: 'Response within 24 hours'
    },
    {
      icon: Building2,
      title: 'Business Sales',
      description: 'Premium plans and enterprise solutions',
      contact: 'sales@suburbmates.com.au',
      response: 'Response within 4 hours'
    },
    {
      icon: HelpCircle,
      title: 'Technical Support',
      description: 'Account issues and technical help',
      contact: 'support@suburbmates.com.au',
      response: 'Response within 12 hours'
    },
    {
      icon: CreditCard,
      title: 'Billing & Payments',
      description: 'Billing questions and account management',
      contact: 'billing@suburbmates.com.au',
      response: 'Response within 24 hours'
    }
  ];

  const offices = [
    {
      city: 'Melbourne CBD',
      address: '123 Collins Street, Melbourne VIC 3000',
      phone: '+61 3 9000 0000',
      hours: 'Mon-Fri 9:00 AM - 6:00 PM AEST'
    },
    {
      city: 'Richmond Office',
      address: '456 Swan Street, Richmond VIC 3121',
      phone: '+61 3 9000 0001',
      hours: 'Mon-Fri 9:00 AM - 5:00 PM AEST'
    }
  ];

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

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Have questions about SuburbMates? Need help with your business profile? 
            Want to discuss enterprise solutions? We're here to help!
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <method.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                  <a 
                    href={`mailto:${method.contact}`}
                    className="text-primary font-medium hover:underline block mb-2"
                  >
                    {method.contact}
                  </a>
                  <p className="text-xs text-gray-500">{method.response}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Office Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Business Name</Label>
                    <Input id="company" name="company" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select name="subject" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="sales">Sales & Pricing</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                        <SelectItem value="media">Media & Press</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      rows={5}
                      placeholder="Please provide details about your inquiry..."
                      required 
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Office Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Our Offices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {offices.map((office, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-semibold text-lg">{office.city}</h4>
                      <div className="space-y-1 text-gray-600">
                        <p className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {office.address}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {office.phone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {office.hours}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Link 
                      href="/help" 
                      className="block text-blue-600 hover:underline"
                    >
                      📖 Help Center & Documentation
                    </Link>
                    <Link 
                      href="/pricing" 
                      className="block text-blue-600 hover:underline"
                    >
                      💰 Pricing & Plans
                    </Link>
                    <Link 
                      href="/signup" 
                      className="block text-blue-600 hover:underline"
                    >
                      🚀 Create Free Account
                    </Link>
                    <Link 
                      href="/login" 
                      className="block text-blue-600 hover:underline"
                    >
                      🔑 Login to Account
                    </Link>
                    <Link 
                      href="/status" 
                      className="block text-blue-600 hover:underline"
                    >
                      📊 System Status
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span className="font-medium">9:00 AM - 6:00 PM AEST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-medium">10:00 AM - 4:00 PM AEST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="text-gray-500">Closed</span>
                    </div>
                    <div className="pt-2 text-xs text-gray-600">
                      Emergency support available 24/7 for Business+ customers
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Quick answers to common questions. Need more help? Visit our help center.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How quickly can I set up my business profile?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Most businesses can create their profile in under 10 minutes. Our step-by-step wizard 
                  guides you through the process, and you can always save and continue later.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Do you offer phone support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! Business+ customers get dedicated phone support during business hours. 
                  Free and Premium customers can reach us via email, and we typically respond within 24 hours.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I integrate SuburbMates with my existing website?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely! We provide embed codes, widgets, and API access (Business+ plan) to integrate 
                  your SuburbMates profile with your website, social media, and other marketing channels.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link href="/help">
              <Button variant="outline">
                View All FAQs & Help Articles
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