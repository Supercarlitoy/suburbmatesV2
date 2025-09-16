"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, HelpCircle, Mail, Phone, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'business' | 'technical' | 'billing';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'What is SuburbMates?',
    answer: 'SuburbMates is Melbourne\'s premier local business network, connecting verified businesses with customers in their local communities. We focus exclusively on Melbourne suburbs to strengthen local business relationships.',
    category: 'general'
  },
  {
    id: '2',
    question: 'How do I join SuburbMates as a business?',
    answer: 'Simply click "Join Now" and complete our registration form. You\'ll need your business details, service areas, and contact information. ABN verification is optional but recommended for enhanced credibility.',
    category: 'business'
  },
  {
    id: '3',
    question: 'Is ABN verification required?',
    answer: 'No, ABN verification is completely optional. While it enhances your profile credibility and helps customers trust your business, you can join and operate on SuburbMates without ABN verification.',
    category: 'business'
  },
  {
    id: '4',
    question: 'Which areas does SuburbMates cover?',
    answer: 'We exclusively serve Melbourne and its suburbs. You can select multiple service areas during registration, covering anywhere from inner Melbourne to outer suburbs across all directions.',
    category: 'general'
  },
  {
    id: '5',
    question: 'How much does it cost to join?',
    answer: 'Basic membership is free! This includes your business profile, customer inquiries, and access to our community platform. Premium features and enhanced visibility options are available for growing businesses.',
    category: 'billing'
  },
  {
    id: '6',
    question: 'How do customers find my business?',
    answer: 'Customers can discover your business through our search function, browsing by suburb, category, or service type. Your profile appears in relevant searches based on your selected service areas and business category.',
    category: 'business'
  },
  {
    id: '7',
    question: 'Can I update my business information?',
    answer: 'Yes! You can update your business details, service areas, contact information, and profile content anytime through your dashboard. Changes are reflected immediately on your public profile.',
    category: 'technical'
  },
  {
    id: '8',
    question: 'How do I receive customer inquiries?',
    answer: 'Customer inquiries are sent directly to your registered email address. You can also view and manage all inquiries through your dashboard, with options to respond and track conversations.',
    category: 'business'
  },
  {
    id: '9',
    question: 'What if I have technical issues?',
    answer: 'Our support team is here to help! Contact us via email at support@suburbmates.com.au or use the contact form. We typically respond within 24 hours during business days.',
    category: 'technical'
  },
  {
    id: '10',
    question: 'Can I remove my business from SuburbMates?',
    answer: 'Yes, you can deactivate or delete your business profile at any time through your dashboard settings. Your profile will be immediately removed from public searches.',
    category: 'business'
  }
];

const categories = {
  general: { label: 'General', color: 'bg-blue-100 text-blue-800' },
  business: { label: 'Business', color: 'bg-green-100 text-green-800' },
  technical: { label: 'Technical', color: 'bg-purple-100 text-purple-800' },
  billing: { label: 'Billing', color: 'bg-orange-100 text-orange-800' }
};

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about SuburbMates, Melbourne's premier business community platform.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="mb-2"
          >
            All Questions
          </Button>
          {Object.entries(categories).map(([key, { label }]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(key)}
              className="mb-2"
            >
              {label}
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.map((item) => {
            const isOpen = openItems.includes(item.id);
            const categoryInfo = categories[item.category];
            
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={categoryInfo.color}>
                          {categoryInfo.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-left text-lg">
                        {item.question}
                      </CardTitle>
                    </div>
                    <div className="ml-4">
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent className="pt-0">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">
              Still Have Questions?
            </CardTitle>
            <CardDescription className="text-lg">
              Our friendly team is here to help you get the most out of SuburbMates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-3">
                <Mail className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-gray-600">
                  Get detailed help via email
                </p>
                <Button variant="outline" asChild>
                  <a href="mailto:support@suburbmates.com.au">
                    Email Us
                  </a>
                </Button>
              </div>
              
              <div className="space-y-3">
                <Phone className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-semibold">Phone Support</h3>
                <p className="text-sm text-gray-600">
                  Speak directly with our team
                </p>
                <Button variant="outline" asChild>
                  <a href="tel:1300-SUBURB">
                    1300 SUBURB
                  </a>
                </Button>
              </div>
              
              <div className="space-y-3">
                <MessageSquare className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-sm text-gray-600">
                  Quick answers to urgent questions
                </p>
                <Button variant="outline">
                  Start Chat
                </Button>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 mb-4">
                Ready to join Melbourne's premier business community?
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <Link href="/signup">
                    Join SuburbMates
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}