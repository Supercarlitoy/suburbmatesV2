"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, MapPin, Building2, Mail, Phone, Lock, User, Hash, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { SuburbMultiSelect } from "@/features/business-profiles/components/SuburbMultiSelect";
import { CategorySelect } from "@/features/business-profiles/components/CategorySelect";
import { glass } from "@/lib/design-system";
import { SuburbMatesLogo } from "@/components/ui/SuburbMatesLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface SignupForm {
  abn: string;
  email: string;
  password: string;
  businessName: string;
  suburb: string;
  serviceAreas: string[];
  category: string;
  phone?: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupForm>({
    abn: "",
    email: "",
    password: "",
    businessName: "",
    suburb: "",
    serviceAreas: [],
    category: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [abnError, setAbnError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const router = useRouter();

  // Password validation function
  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    });
  };

  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData(prev => ({ ...prev, password: newPassword }));
    validatePassword(newPassword);
  };

  // ABN verification removed from signup - will be handled in dashboard

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submission started!');
    console.log('📋 Form data:', formData);
    console.log('🔄 Current loading state:', isLoading);
    
    // Prevent double submission
    if (isLoading) {
      console.log('⚠️ Already loading, preventing double submission');
      return;
    }
    
    // ABN verification removed from signup process
    
    // Basic form validation
    if (!formData.email || !formData.password || !formData.businessName) {
      console.log('❌ Validation failed: Missing required fields');
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields (email, password, business name)",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.serviceAreas.length === 0) {
      console.log('❌ Validation failed: No service areas selected');
      toast({
        title: "Service Areas Required",
        description: "Please select at least one suburb you service",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.category) {
      console.log('❌ Validation failed: No category selected');
      toast({
        title: "Business Category Required",
        description: "Please select your business category",
        variant: "destructive"
      });
      return;
    }
    
    console.log('All validations passed, starting API call...');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (response.ok) {
        if (data.requiresConfirmation) {
          toast({
            title: "Account Created! 📧",
            description: data.message || "Please check your email to confirm your account before signing in.",
            duration: 8000
          });
          // Reset form to show success
          setFormData({
            abn: "",
            email: "",
            password: "",
            businessName: "",
            suburb: "",
            serviceAreas: [],
            category: "",
            phone: ""
          });
          // Redirect to login page after showing success message
          setTimeout(() => {
            router.push('/login?message=Please check your email to confirm your account');
          }, 3000);
        } else {
          // Set success state
          setIsSuccess(true);
          
          // Enhanced success notification
          toast({
            title: "🎉 Welcome to SuburbMates!",
            description: "Your business account has been created successfully! You can now access your dashboard to complete your profile.",
            duration: 6000
          });
          
          // Add a small delay before redirect to ensure user sees the success message
          setTimeout(() => {
            router.push('/dashboard/profile');
          }, 2000);
        }
      } else {
        toast({
          title: "Signup Failed",
          description: data.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${glass.heroBg} relative overflow-hidden`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 to-blue-100/40 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-100/40 to-orange-100/30 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full bg-gradient-to-bl from-green-100/30 to-emerald-100/40 blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
<span className="text-sm font-medium text-primary">Join Melbourne&apos;s Business Network</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              Create your{" "}
              <span className={glass.gradientText}>
                business profile
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
Connect with your local community and grow your business across Melbourne&apos;s suburbs
            </p>
            
            <div className="flex justify-center gap-3 mt-6">
              <StatusBadge variant="green" size="sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                ABN Verified
              </StatusBadge>
              <StatusBadge variant="blue" size="sm">
                <MapPin className="w-3 h-3 mr-1" />
                Melbourne Focused
              </StatusBadge>
              <StatusBadge variant="orange" size="sm">
                <Building2 className="w-3 h-3 mr-1" />
                Verified Profiles
              </StatusBadge>
            </div>
          </div>

          <Card className={`border-0 shadow-2xl ${glass.authCard} max-w-2xl mx-auto`}>
            <CardHeader className="text-center pb-6">
              <div className="mb-4">
                <SuburbMatesLogo variant="AuthLogo" size="md" />
              </div>
            </CardHeader>
      
            {/* Success State Display */}
            {isSuccess && (
              <CardContent>
                <Alert className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="space-y-3">
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Registration Successful!
                      </p>
                      <p className="text-sm leading-relaxed">
Your SuburbMates business account has been created. You&apos;ll be redirected to your dashboard shortly to complete your profile setup.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
      
            {/* Instructions Section - Only show if not successful */}
            {!isSuccess && (
              <div className="px-6 pb-6">
                <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-3">
                      <p className="font-semibold">Complete your registration in 3 easy steps:</p>
                      <div className="grid gap-3 text-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs flex-shrink-0">1</div>
                          <div>
                            <p className="font-medium">Business Details</p>
                            <p className="text-blue-700">Enter your business name, category, and service areas</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs flex-shrink-0">2</div>
                          <div>
                            <p className="font-medium">Contact Information</p>
                            <p className="text-blue-700">Provide your email, phone, and optional ABN</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs flex-shrink-0">3</div>
                          <div>
                            <p className="font-medium">Secure Password</p>
                            <p className="text-blue-700">Create a strong password to protect your account</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100/50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          ABN verification is optional and enhances your profile credibility
                        </p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
      
            <CardContent className="space-y-6">
              {!isSuccess && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Section 1: Business Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Business Information</h3>
                    </div>
                    
                    {/* Business Name */}
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-sm font-semibold text-gray-700">
                        Business Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="businessName"
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                          placeholder="Enter your business name"
                          required
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors"
                        />
                      </div>
                    </div>
                    
                    {/* ABN - Optional */}
                    <div className="space-y-2">
                      <Label htmlFor="abn" className="text-sm font-semibold text-gray-700">
                        Australian Business Number (Optional)
                      </Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="abn"
                          type="text"
                          placeholder="12 345 678 901"
                          maxLength={14}
                          value={formData.abn}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, abn: e.target.value }));
                            setAbnError("");
                          }}
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Enhances credibility and can be verified later
                      </p>
                      {abnError && (
                        <Alert variant="destructive" className="border-red-200 bg-red-50">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-red-800">{abnError}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Business Category */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Business Category *</Label>
                      <CategorySelect
                        value={formData.category}
                        onChange={(category) => setFormData(prev => ({ ...prev, category }))}
                        disabled={isLoading}
                        placeholder="Select your business type..."
                      />
                      <p className="text-xs text-gray-600">
                        Choose the category that best describes your business
                      </p>
                    </div>
                    
                    {/* Primary Suburb */}
                    <div className="space-y-2">
                      <Label htmlFor="suburb" className="text-sm font-semibold text-gray-700">
                        Primary Suburb *
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="suburb"
                          type="text"
                          value={formData.suburb}
                          onChange={(e) => setFormData(prev => ({ ...prev, suburb: e.target.value }))}
                          placeholder="Richmond, Fitzroy, etc."
                          required
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        Your main business location in Melbourne
                      </p>
                    </div>
                    
                    {/* Service Areas */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Service Areas *
                      </Label>
                      <SuburbMultiSelect
                        value={formData.serviceAreas}
                        onChange={(areas) => setFormData(prev => ({ ...prev, serviceAreas: areas }))}
                        placeholder="Select suburbs you service..."
                        disabled={isLoading}
                        maxSelections={20}
                      />
                      <p className="text-xs text-gray-600">
                        Choose all Melbourne suburbs where you provide services (up to 20 areas)
                      </p>
                    </div>
                  </div>

                  
                  {/* Section 2: Contact Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Contact Information</h3>
                    </div>
                    
                    {/* Business Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        Business Email *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="contact@yourbusiness.com.au"
                          required
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        This will be your login email and primary contact method
                      </p>
                    </div>
                    
                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        Phone Number (Optional)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(03) 1234 5678"
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors"
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        Helps customers contact you directly
                      </p>
                    </div>
                  </div>
                  
                  {/* Section 3: Security */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Account Security</h3>
                    </div>
                    
                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                        Password *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={handlePasswordChange}
                          placeholder="Create a secure password"
                          required
                          disabled={isLoading}
                          className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors"
                        />
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Password Requirements:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className={`flex items-center gap-2 transition-colors ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                            {passwordValidation.length ? 
                              <CheckCircle className="w-4 h-4" /> : 
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                            }
                            <span>At least 8 characters</span>
                          </div>
                          <div className={`flex items-center gap-2 transition-colors ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                            {passwordValidation.uppercase ? 
                              <CheckCircle className="w-4 h-4" /> : 
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                            }
                            <span>Uppercase letter (A-Z)</span>
                          </div>
                          <div className={`flex items-center gap-2 transition-colors ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                            {passwordValidation.lowercase ? 
                              <CheckCircle className="w-4 h-4" /> : 
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                            }
                            <span>Lowercase letter (a-z)</span>
                          </div>
                          <div className={`flex items-center gap-2 transition-colors ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                            {passwordValidation.number ? 
                              <CheckCircle className="w-4 h-4" /> : 
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                            }
                            <span>Number (0-9)</span>
                          </div>
                          <div className={`flex items-center gap-2 transition-colors col-span-full ${passwordValidation.special ? 'text-green-600' : 'text-gray-500'}`}>
                            {passwordValidation.special ? 
                              <CheckCircle className="w-4 h-4" /> : 
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                            }
                            <span>Special character (@$!%*?&)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating your profile...
                      </>
                    ) : (
                      <>
                        Create Business Profile
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
              
              {/* Footer */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link 
                    href="/login" 
                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign in to your dashboard
                  </Link>
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                    Your business information will be verified for quality assurance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}