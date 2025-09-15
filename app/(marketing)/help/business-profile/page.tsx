"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Lock,
  Mail,
  Settings,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  User,
  Building,
  Phone,
  MapPin,
  FileText,
  HelpCircle,
  Clock,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const troubleshootingSteps = {
  passwordReset: [
    {
      step: 1,
      title: "Go to the Login Page",
      description: "Navigate to the SuburbMates login page and click 'Forgot Password?'",
      icon: Lock
    },
    {
      step: 2,
      title: "Enter Your Email",
      description: "Provide the email address associated with your business account",
      icon: Mail
    },
    {
      step: 3,
      title: "Check Your Email",
      description: "Look for a password reset email (check spam folder if needed)",
      icon: RefreshCw
    },
    {
      step: 4,
      title: "Create New Password",
      description: "Click the reset link and create a strong, secure password",
      icon: Shield
    }
  ],
  profileUpdate: [
    {
      step: 1,
      title: "Access Your Dashboard",
      description: "Log in and navigate to your business dashboard",
      icon: User
    },
    {
      step: 2,
      title: "Go to Profile Settings",
      description: "Click on 'Profile' or 'Settings' in the main navigation",
      icon: Settings
    },
    {
      step: 3,
      title: "Edit Information",
      description: "Update your business details, contact info, or services",
      icon: FileText
    },
    {
      step: 4,
      title: "Save Changes",
      description: "Review your updates and click 'Save' to apply changes",
      icon: CheckCircle
    }
  ]
};

const commonIssues = [
  {
    issue: "Can't access my account",
    solution: "Try password reset or contact support if your email has changed",
    severity: "high",
    category: "Access"
  },
  {
    issue: "ABN verification failed",
    solution: "Ensure your ABN is active and matches your business name exactly",
    severity: "medium",
    category: "Verification"
  },
  {
    issue: "Profile not showing in search",
    solution: "Check if your profile is complete and approved by our team",
    severity: "medium",
    category: "Visibility"
  },
  {
    issue: "Not receiving lead notifications",
    solution: "Verify your email settings and check spam folder",
    severity: "low",
    category: "Notifications"
  },
  {
    issue: "Can't update business hours",
    solution: "Ensure you're using the correct time format (24-hour)",
    severity: "low",
    category: "Profile"
  },
  {
    issue: "Photos not uploading",
    solution: "Check file size (max 5MB) and format (JPG, PNG only)",
    severity: "low",
    category: "Media"
  }
];

const faqItems = [
  {
    question: "How long does ABN verification take?",
    answer: "ABN verification is usually instant, but can take up to 24 hours during peak times. We verify directly with the Australian Business Register to ensure accuracy."
  },
  {
    question: "Can I change my business category after signup?",
    answer: "Yes, you can update your business category in your profile settings. Changes may require re-verification to ensure accuracy."
  },
  {
    question: "Why isn't my business showing in search results?",
    answer: "Your business profile needs to be complete (100% filled) and approved by our team. This process typically takes 1-2 business days."
  },
  {
    question: "How do I add multiple service areas?",
    answer: "In your profile settings, you can select multiple suburbs from the service areas section. We recommend choosing areas within a reasonable distance from your business."
  },
  {
    question: "Can I have multiple business profiles?",
    answer: "Each ABN can have one profile. If you have multiple businesses, you'll need separate ABNs and accounts for each."
  }
];

export default function BusinessProfileHelp() {
  // const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handlePasswordReset = () => {
    // Simulate password reset
    setResetSent(true);
    setTimeout(() => setResetSent(false), 5000);
  };

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
              <Settings className="w-10 h-10 text-primary mr-4" />
              <div>
                <h1 className="text-4xl font-black text-gray-900">
                  Business Profile Help
                </h1>
                <p className="text-gray-600 mt-2">
                  Account management, troubleshooting, and profile optimization
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Password Reset Tool */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-centre text-red-800">
                <Lock className="w-5 h-5 mr-2" />
                Quick Password Reset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                Can't access your account? Reset your password instantly:
              </p>
              <div className="flex gap-4">
                <Input
                  type="email"
                  placeholder="Enter your business email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handlePasswordReset}
                  disabled={!resetEmail || resetSent}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {resetSent ? 'Email Sent!' : 'Reset Password'}
                </Button>
              </div>
              {resetSent && (
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password reset email sent! Check your inbox and spam folder.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Tabs defaultValue="troubleshooting" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
              <TabsTrigger value="common-issues">Common Issues</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="guides">Step-by-Step</TabsTrigger>
            </TabsList>

            {/* Troubleshooting Tab */}
            <TabsContent value="troubleshooting">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Password Reset Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle id="password-reset" className="flex items-centre">
                      <Lock className="w-5 h-5 mr-2 text-red-500" />
                      Password Reset Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {troubleshootingSteps.passwordReset.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start space-x-4"
                          >
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-centre justify-centre flex-shrink-0">
                              <span className="text-primary font-bold text-sm">{step.step}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-centre mb-2">
                                <IconComponent className="w-4 h-4 text-primary mr-2" />
                                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                              </div>
                              <p className="text-gray-600 text-sm">{step.description}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Update Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle id="update-info" className="flex items-centre">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Update Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {troubleshootingSteps.profileUpdate.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start space-x-4"
                          >
                            <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-centre justify-centre flex-shrink-0">
                              <span className="text-blue-500 font-bold text-sm">{step.step}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-centre mb-2">
                                <IconComponent className="w-4 h-4 text-blue-500 mr-2" />
                                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                              </div>
                              <p className="text-gray-600 text-sm">{step.description}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Common Issues Tab */}
            <TabsContent value="common-issues">
              <div className="grid gap-4">
                {commonIssues.map((item, index) => {
                  const severityColor = {
                    high: 'border-red-200 bg-red-50',
                    medium: 'border-yellow-200 bg-yellow-50',
                    low: 'border-blue-200 bg-blue-50'
                  }[item.severity];
                  
                  const severityIcon = {
                    high: 'text-red-600',
                    medium: 'text-yellow-600',
                    low: 'text-blue-600'
                  }[item.severity];

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className={`${severityColor} border-2`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-centre mb-2">
                                <AlertCircle className={`w-5 h-5 mr-2 ${severityIcon}`} />
                                <h3 className="font-semibold text-gray-900">{item.issue}</h3>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                              <p className="text-gray-700">{item.solution}</p>
                            </div>
                            <Badge 
                              variant={item.severity === 'high' ? 'destructive' : 'secondary'}
                              className="ml-4"
                            >
                              {item.severity}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq">
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-centre text-lg">
                          <HelpCircle className="w-5 h-5 mr-2 text-primary" />
                          {item.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Step-by-Step Guides Tab */}
            <TabsContent value="guides">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle id="abn-update" className="flex items-centre">
                      <Building className="w-5 h-5 mr-2 text-green-500" />
                      Update ABN Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-centre justify-centre flex-shrink-0 mt-1">
                          <span className="text-green-500 font-bold text-xs">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Access Profile Settings</p>
                          <p className="text-sm text-gray-600">Navigate to your dashboard and click 'Profile'</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-green-500 font-bold text-xs">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Find Business Details Section</p>
                          <p className="text-sm text-gray-600">Scroll to the 'Business Information' section</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-green-500 font-bold text-xs">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Update ABN</p>
                          <p className="text-sm text-gray-600">Enter your new ABN (11 digits, no spaces)</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-green-500 font-bold text-xs">4</span>
                        </div>
                        <div>
                          <p className="font-medium">Verify & Save</p>
                          <p className="text-sm text-gray-600">System will verify with ABR automatically</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle id="manage-listing" className="flex items-centre">
                      <Zap className="w-5 h-5 mr-2 text-purple-500" />
                      Manage Your Listing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-centre justify-centre flex-shrink-0 mt-1">
                          <span className="text-purple-500 font-bold text-xs">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Complete Your Profile</p>
                          <p className="text-sm text-gray-600">Ensure all fields are filled (aim for 100%)</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-purple-500 font-bold text-xs">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Add High-Quality Photos</p>
                          <p className="text-sm text-gray-600">Upload clear images of your work/business</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-purple-500 font-bold text-xs">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Set Service Areas</p>
                          <p className="text-sm text-gray-600">Select suburbs you serve for better visibility</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-purple-500 font-bold text-xs">4</span>
                        </div>
                        <div>
                          <p className="font-medium">Monitor Performance</p>
                          <p className="text-sm text-gray-600">Check your dashboard for leads and views</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-centre">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-12">
                <Clock className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-bold mb-4">
                  Need Personal Assistance?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Our business support team responds within 2 hours during business hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-centre">
                  <Link href="/help/feedback#contact">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      Contact Business Support
                    </Button>
                  </Link>
                  <Link href="/test-abn">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      Test ABN Validation
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