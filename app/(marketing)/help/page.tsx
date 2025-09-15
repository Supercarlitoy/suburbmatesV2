"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  HelpCircle, 
  Shield, 
  MessageSquare, 
  Settings, 
  FileText, 
  Users, 
  Zap,
  ArrowRight,
  Book,
  Lock,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const helpCategories = [
  {
    icon: Settings,
    title: "Business Profile Help",
    description: "Account management, password reset, profile updates",
    href: "/help/business-profile",
    color: "bg-blue-500",
    articles: 12
  },
  {
    icon: Book,
    title: "Platform Guide",
    description: "How SuburbMates works, features, and navigation",
    href: "/help/platform",
    color: "bg-green-500",
    articles: 8
  },
  {
    icon: Shield,
    title: "Safety & Security",
    description: "Data protection, account security, best practices",
    href: "/help/safety",
    color: "bg-purple-500",
    articles: 6
  },
  {
    icon: MessageSquare,
    title: "Feedback & Support",
    description: "Contact us, report issues, feature requests",
    href: "/help/feedback",
    color: "bg-orange-500",
    articles: 4
  },
  {
    icon: Zap,
    title: "Testing Tools",
    description: "ABN validation, system checks, diagnostics",
    href: "/test-abn",
    color: "bg-yellow-500",
    articles: 3
  },
  {
    icon: FileText,
    title: "Legal & Policies",
    description: "Privacy policy, terms of service, cookie policy",
    href: "/help/legal",
    color: "bg-gray-500",
    articles: 5
  }
];

const quickActions = [
  {
    title: "Reset Password",
    description: "Can't access your account?",
    href: "/help/business-profile#password-reset",
    icon: Lock
  },
  {
    title: "Update Business Info",
    description: "Change your business details",
    href: "/help/business-profile#update-info",
    icon: Settings
  },
  {
    title: "Contact Support",
    description: "Get help from our team",
    href: "/help/feedback#contact",
    icon: MessageSquare
  },
  {
    title: "Report Issue",
    description: "Something not working?",
    href: "/help/feedback#report-issue",
    icon: AlertCircle
  }
];

const popularArticles = [
  {
    title: "How to reset your password",
    category: "Business Profile",
    views: "2.1k views",
    href: "/help/business-profile#password-reset"
  },
  {
    title: "Updating your ABN information",
    category: "Business Profile",
    views: "1.8k views",
    href: "/help/business-profile#abn-update"
  },
  {
    title: "How SuburbMates verification works",
    category: "Platform Guide",
    views: "1.5k views",
    href: "/help/platform#verification"
  },
  {
    title: "Managing your business listing",
    category: "Business Profile",
    views: "1.3k views",
    href: "/help/business-profile#manage-listing"
  },
  {
    title: "Understanding lead notifications",
    category: "Platform Guide",
    views: "1.1k views",
    href: "/help/platform#notifications"
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-centre">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-centre justify-centre mb-6">
              <HelpCircle className="w-12 h-12 text-primary mr-3" />
              <h1 className="text-5xl font-black text-gray-900">
                Help Centre
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Find answers, get support, and learn how to make the most of SuburbMates
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="search"
                placeholder="Search for help articles, guides, or common issues..."
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-centre">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={action.href}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20">
                      <CardContent className="p-6 text-centre">
                        <div className="w-12 h-12 bg-primary/10 rounded-full grid place-items-centre mx-auto mb-4">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-centre">
            Browse Help Topics
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={category.href}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                      <CardHeader className="pb-4">
                        <div className="flex items-centre justify-between mb-4">
                          <div className={`w-12 h-12 ${category.color} rounded-lg grid place-items-centre`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {category.articles} articles
                          </Badge>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {category.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{category.description}</p>
                        <div className="flex items-centre text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                          <span>Learn more</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-centre">
            Popular Articles
          </h2>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={article.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-centre justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <div className="flex items-centre space-x-4 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span>{article.views}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-centre">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-primary to-accent text-white border-0">
              <CardContent className="p-12">
                <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-bold mb-4">
                  Still Need Help?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Our support team is here to help you succeed with SuburbMates.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/help/feedback#contact">
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/help/feedback#community">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Community Forum
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}