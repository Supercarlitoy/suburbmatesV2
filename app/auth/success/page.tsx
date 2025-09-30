import { Suspense } from 'react';
import { Metadata } from 'next';
import { AuthSuccessContent } from './success-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SuburbMatesLogo } from '@/components/ui/SuburbMatesLogo';
import { glass } from '@/lib/design-system';

export const metadata: Metadata = {
  title: 'Welcome to SuburbMates | Email Confirmed',
  description: 'Your email has been successfully confirmed. Welcome to SuburbMates!',
  robots: 'noindex, nofollow',
};

export default function AuthSuccessPage() {
  return (
    <div className={`min-h-screen flex items-center justify-center ${glass.heroBg} p-4`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <SuburbMatesLogo variant="AuthLogo" size="md" />
          <p className="text-slate-600 mt-2">
            Melbourne's Business Community Platform
          </p>
        </div>

        <Card className={`shadow-lg border-0 ${glass.authCard}`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <CardTitle className="text-xl text-slate-900">
              Email Confirmed!
            </CardTitle>
            <CardDescription className="text-base">
              Welcome to SuburbMates
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Suspense fallback={<AuthSuccessSkeleton />}>
              <AuthSuccessContent />
            </Suspense>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-slate-500">
          <p>
            Need help getting started? Visit our{' '}
            <a 
              href="/help" 
              className="text-green-600 hover:text-green-800 underline"
            >
              help center
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthSuccessSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
      <div className="h-10 bg-slate-200 rounded animate-pulse"></div>
    </div>
  );
}