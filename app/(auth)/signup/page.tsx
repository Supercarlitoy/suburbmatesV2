"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { SuburbMultiSelect } from "@/features/business-profiles/components/SuburbMultiSelect";
import { CategorySelect } from "@/features/business-profiles/components/CategorySelect";

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
    <Card className="glass-card shadow-premium">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Join Suburbmates
        </CardTitle>
        <CardDescription>
          Create your verified business profile for Melbourne
        </CardDescription>
        <div className="flex justify-center gap-2 mt-2">
          <Badge variant="secondary" className="bg-success/10 text-success">
            ABR Verified
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Melbourne Focused
          </Badge>
        </div>
      </CardHeader>
      
      {/* Success State Display */}
      {isSuccess && (
        <div className="px-6 pb-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <p className="font-medium">🎉 Registration Successful!</p>
                <p className="text-sm">
                  Your SuburbMates business account has been created. You'll be redirected to your dashboard shortly to complete your profile setup.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Instructions Section */}
      <div className="px-6 pb-4">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p className="font-medium">How to complete your registration:</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• <strong>ABN (Optional):</strong> Enter your Australian Business Number if you have one. Verification can be done later from your dashboard.</li>
                <li>• <strong>Business Category:</strong> Choose the category that best describes your services.</li>
                <li>• <strong>Service Areas:</strong> Select all Melbourne suburbs where you provide services.</li>
                <li>• <strong>Contact Details:</strong> Provide accurate information for customer inquiries.</li>
              </ul>
              <p className="text-sm mt-2 font-medium text-blue-900">💡 ABN verification is completely optional and can enhance your profile credibility later.</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ABN Verification Section */}
          <div className="space-y-2">
            <Label htmlFor="abn">Australian Business Number (ABN)</Label>
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
            />
            <p className="text-xs text-muted-foreground">
               Australian Business Number (11 digits) - Optional
             </p>
            {abnError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{abnError}</AlertDescription>
              </Alert>
            )}
            {/* ABN verification status removed from signup */}
          </div>

          {/* Business Details */}
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              placeholder="Your business name"
              required
              disabled={false}
            />
          </div>

          {/* Business Category */}
          <div className="space-y-2">
            <Label>Business Category *</Label>
            <CategorySelect
              value={formData.category}
              onChange={(category) => setFormData(prev => ({ ...prev, category }))}
              disabled={false}
               placeholder="Select your business type..."
             />
             <p className="text-xs text-muted-foreground">
               Choose the category that best describes your business
             </p>
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="suburb">Primary Suburb</Label>
             <Input
               id="suburb"
               type="text"
               value={formData.suburb}
               onChange={(e) => setFormData(prev => ({ ...prev, suburb: e.target.value }))}
               placeholder="Richmond, Fitzroy, etc."
               required
               disabled={false}
             />
             <p className="text-xs text-muted-foreground">
               Your main business location
             </p>
           </div>

           {/* Service Areas Multi-Select */}
           <div className="space-y-2">
             <Label className="flex items-center gap-2">
               <MapPin className="h-4 w-4" />
               Service Areas *
             </Label>
             <SuburbMultiSelect
               value={formData.serviceAreas}
               onChange={(areas) => setFormData(prev => ({ ...prev, serviceAreas: areas }))}
               placeholder="Select suburbs you service..."
               disabled={false}
               maxSelections={20}
             />
             <p className="text-xs text-muted-foreground">
               Choose all Melbourne suburbs where you provide services. You can select up to 20 areas.
             </p>
           </div>

           <div className="space-y-2">
             <Label htmlFor="email">Business Email</Label>
             <Input
               id="email"
               type="email"
               value={formData.email}
               onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
               placeholder="contact@yourbusiness.com.au"
               required
               disabled={false}
             />
           </div>

           <div className="space-y-2">
             <Label htmlFor="phone">Phone (Optional)</Label>
             <Input
               id="phone"
               type="tel"
               value={formData.phone}
               onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
               placeholder="(03) 1234 5678"
               disabled={false}
             />
           </div>

           <div className="space-y-2">
             <Label htmlFor="password">Password</Label>
             <Input
               id="password"
               type="password"
               value={formData.password}
               onChange={handlePasswordChange}
               placeholder="Create a secure password"
               required
               disabled={false}
             />
             {/* Password Requirements */}
             <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
               <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
               <div className="grid grid-cols-1 gap-1 text-xs">
                 <div className={`flex items-center gap-2 ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
                   {passwordValidation.length ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                   At least 8 characters
                 </div>
                 <div className={`flex items-center gap-2 ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                   {passwordValidation.uppercase ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                   One uppercase letter (A-Z)
                 </div>
                 <div className={`flex items-center gap-2 ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                   {passwordValidation.lowercase ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                   One lowercase letter (a-z)
                 </div>
                 <div className={`flex items-center gap-2 ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
                   {passwordValidation.number ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                   One number (0-9)
                 </div>
                 <div className={`flex items-center gap-2 ${passwordValidation.special ? 'text-green-600' : 'text-gray-500'}`}>
                   {passwordValidation.special ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                   One special character (@$!%*?&)
                 </div>
               </div>
              </div>
            </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              "Create Business Profile"
            )}
          </Button>
        </form>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}