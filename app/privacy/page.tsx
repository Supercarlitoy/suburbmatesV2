"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  Mail,
  Cookie,
  Users,
  FileText,
  Calendar,
  Info
} from "lucide-react";
import Link from "next/link";

const privacySections = [
  {
    id: "information-collection",
    title: "Information We Collect",
    icon: Database,
    content: [
      {
        subtitle: "Business Information",
        items: [
          "Australian Business Number (ABN) and business name",
          "Business address, phone number, and email",
          "Business category, services offered, and operating hours",
          "Business description and photos",
          "Service areas and suburbs covered"
        ]
      },
      {
        subtitle: "Account Information",
        items: [
          "Email address and encrypted password",
          "Profile preferences and settings",
          "Communication preferences",
          "Account activity and login history"
        ]
      },
      {
        subtitle: "Usage Information",
        items: [
          "Website interactions and page views",
          "Search queries and filters used",
          "Lead generation and response data",
          "Device information and IP address"
        ]
      }
    ]
  },
  {
    id: "information-use",
    title: "How We Use Your Information",
    icon: Eye,
    content: [
      {
        subtitle: "Platform Services",
        items: [
          "Create and maintain your business profile",
          "Verify your business through ABN validation",
          "Connect you with potential customers",
          "Process and deliver lead notifications",
          "Provide customer support and assistance"
        ]
      },
      {
        subtitle: "Communication",
        items: [
          "Send important account and service updates",
          "Deliver lead notifications and opportunities",
          "Provide customer support responses",
          "Share platform news and feature updates"
        ]
      },
      {
        subtitle: "Platform Improvement",
        items: [
          "Analyse usage patterns to improve our services",
          "Develop new features based on user needs",
          "Ensure platform security and prevent fraud",
          "Conduct research and analytics"
        ]
      }
    ]
  },
  {
    id: "information-sharing",
    title: "Information Sharing",
    icon: Users,
    content: [
      {
        subtitle: "Public Business Listings",
        items: [
          "Business name, category, and description",
          "Contact information (phone, email, address)",
          "Service areas and operating hours",
          "Business photos and reviews",
          "ABN verification status (verified/not verified)"
        ]
      },
      {
        subtitle: "Lead Generation",
        items: [
          "Share your contact details with interested residents",
          "Provide business information for quote requests",
          "Enable direct communication between parties"
        ]
      },
      {
        subtitle: "Third-Party Services",
        items: [
          "ABN verification through Australian Business Register",
          "Email delivery services for notifications",
          "Analytics services for platform improvement",
          "Payment processing (if applicable)"
        ]
      }
    ]
  },
  {
    id: "data-security",
    title: "Data Security",
    icon: Lock,
    content: [
      {
        subtitle: "Security Measures",
        items: [
          "Industry-standard encryption for data transmission",
          "Secure password hashing and storage",
          "Regular security audits and monitoring",
          "Access controls and authentication systems",
          "Secure hosting infrastructure with backup systems"
        ]
      },
      {
        subtitle: "Data Protection",
        items: [
          "Limited access to personal information",
          "Regular staff training on privacy practices",
          "Incident response procedures",
          "Data breach notification protocols"
        ]
      }
    ]
  },
  {
    id: "your-rights",
    title: "Your Privacy Rights",
    icon: Shield,
    content: [
      {
        subtitle: "Access and Control",
        items: [
          "Access your personal information at any time",
          "Update or correct your business details",
          "Download your data in a portable format",
          "Delete your account and associated data"
        ]
      },
      {
        subtitle: "Communication Preferences",
        items: [
          "Opt out of marketing communications",
          "Control lead notification frequency",
          "Manage email preferences",
          "Unsubscribe from non-essential communications"
        ]
      },
      {
        subtitle: "Data Portability",
        items: [
          "Request a copy of your data",
          "Transfer data to another service",
          "Export business information and history"
        ]
      }
    ]
  },
  {
    id: "data-retention",
    title: "Data Retention",
    icon: Calendar,
    content: [
      {
        subtitle: "Active Accounts",
        items: [
          "Business profile data retained while account is active",
          "Lead history maintained for business analytics",
          "Communication logs kept for support purposes",
          "Usage data retained for platform improvement"
        ]
      },
      {
        subtitle: "Account Deletion",
        items: [
          "Personal data deleted within 30 days of account closure",
          "Public listings removed immediately",
          "Backup data purged within 90 days",
          "Legal compliance data retained as required"
        ]
      }
    ]
  }
];

const lastUpdated = "December 15, 2024";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header */}
      <section className="pt-32 pb-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link href="/help" className="inline-flex items-centre text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Centre
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-centre mb-6">
              <Shield className="w-10 h-10 text-primary mr-4" />
              <div>
                <h1 className="text-4xl font-black text-gray-900">
                  Privacy Policy
                </h1>
                <p className="text-gray-600 mt-2">
                  How we collect, use, and protect your information
                </p>
              </div>
            </div>
            
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Last Updated:</strong> {lastUpdated} • 
                <strong>Effective Date:</strong> {lastUpdated}
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Commitment to Your Privacy
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  At SuburbMates, we are committed to protecting your privacy and ensuring the security 
                  of your personal information. This Privacy Policy explains how we collect, use, share, 
                  and protect information when you use our platform to connect Melbourne businesses with 
                  local residents.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We understand that trust is fundamental to our business relationship with you. This policy 
                  is designed to be transparent about our data practices and help you make informed decisions 
                  about sharing your information with us.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using SuburbMates, you agree to the collection and use of information in accordance 
                  with this policy. If you have any questions or concerns, please contact us at 
                  <a href="mailto:privacy@suburbmates.com.au" className="text-primary hover:underline">
                    privacy@suburbmates.com.au
                  </a>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          {privacySections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card id={section.id}>
                  <CardHeader>
                    <CardTitle className="flex items-centre text-2xl">
                      <IconComponent className="w-6 h-6 mr-3 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {section.content.map((subsection, subIndex) => (
                        <div key={subIndex}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {subsection.subtitle}
                          </h3>
                          <ul className="space-y-2">
                            {subsection.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Cookies Section */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Cookie className="w-6 h-6 mr-3 text-primary" />
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We use cookies and similar technologies to enhance your experience on our platform:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Authentication and login sessions</li>
                      <li>• Security and fraud prevention</li>
                      <li>• Basic platform functionality</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Usage statistics and performance</li>
                      <li>• Feature usage and optimization</li>
                      <li>• Error tracking and debugging</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  You can control cookie preferences through your browser settings. 
                  For more details, see our <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-primary to-accent text-white border-0">
              <CardContent className="p-12 text-centre">
                <Mail className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-bold mb-4">
                  Questions About Your Privacy?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  We're here to help you understand how we protect your information.
                </p>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-centre items-centre">
                    <Badge className="bg-white/20 text-white px-4 py-2">
                      <Mail className="w-4 h-4 mr-2" />
                      privacy@suburbmates.com.au
                    </Badge>
                    <Badge className="bg-white/20 text-white px-4 py-2">
                      <FileText className="w-4 h-4 mr-2" />
                      Data Protection Officer
                    </Badge>
                  </div>
                  <p className="text-blue-100 text-sm">
                    We respond to privacy inquiries within 48 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Related Links */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Related Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/terms" className="block">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="w-5 h-5 text-primary mb-2" />
                    <h3 className="font-semibold text-gray-900">Terms of Service</h3>
                    <p className="text-sm text-gray-600">User agreements and platform rules</p>
                  </div>
                </Link>
                <Link href="/cookies" className="block">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Cookie className="w-5 h-5 text-primary mb-2" />
                    <h3 className="font-semibold text-gray-900">Cookie Policy</h3>
                    <p className="text-sm text-gray-600">How we use cookies and tracking</p>
                  </div>
                </Link>
                <Link href="/help/safety" className="block">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Shield className="w-5 h-5 text-primary mb-2" />
                    <h3 className="font-semibold text-gray-900">Safety Guide</h3>
                    <p className="text-sm text-gray-600">Security best practices</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}