"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, ArrowRight, Building, Users, Star } from "lucide-react";
import Link from "next/link";
import { glass } from "@/lib/design-system";
import { SuburbMatesLogo } from "@/components/ui/SuburbMatesLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        // Get the updated session to check user role
        const session = await getSession();
        
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${glass.heroBg} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-100/40 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-100/40 to-orange-100/40 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Branding and Benefits */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <Building className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Melbourne's Business Network</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Welcome back to{" "}
              <span className={glass.gradientText}>
                SuburbMates
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Connect with your local community, grow your business, and build meaningful relationships across Melbourne.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-gray-700">Join 10,000+ verified businesses</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Building className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-gray-700">Melbourne-focused networking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-gray-700">Verified business profiles</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className={`border-0 shadow-2xl ${glass.authCard}`}>
            <CardHeader className="space-y-4 text-center pb-8">
              <div className="mb-2">
                <SuburbMatesLogo variant="AuthLogo" size="md" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Sign in to your account
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Access your business dashboard and network
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-primary focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link 
                    href="/signup" 
                    className="font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Create your business profile
                  </Link>
                </p>
              </div>
              
              {/* Development mode info */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Development Mode - Test Accounts
                </p>
                <div className="text-xs text-blue-600 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Admin:</span>
                    <span className="font-mono bg-white/60 px-2 py-1 rounded">admin@suburbmates.local</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Business:</span>
                    <span className="font-mono bg-white/60 px-2 py-1 rounded">mike@mikesplumbing.local</span>
                  </div>
                  <p className="text-center font-medium text-blue-700 pt-1 border-t border-blue-200">
                    Password: any (skipped in dev)
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