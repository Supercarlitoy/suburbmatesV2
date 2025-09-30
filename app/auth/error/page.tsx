import { Suspense } from 'react';
import { Metadata } from 'next';
import { AuthErrorContent } from './error-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SuburbMatesLogo } from '@/components/ui/SuburbMatesLogo';
import { glass } from '@/lib/design-system';

export const metadata: Metadata = {
  title: 'Authentication Error | SuburbMates',
  description: 'There was an issue with your authentication request.',
  robots: 'noindex, nofollow',
};

export default function AuthErrorPage() {
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
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            <CardTitle className="text-xl text-slate-900">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-base">
              There was an issue processing your request
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Suspense fallback={<AuthErrorSkeleton />}>
              <AuthErrorContent />
            </Suspense>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-slate-500">
          <p>
            Still having trouble? Contact us at{' '}
            <a 
              href="mailto:support@suburbmates.com.au" 
              className="text-red-600 hover:text-red-800 underline"
            >
              support@suburbmates.com.au
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthErrorSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
      <div className="h-10 bg-slate-200 rounded animate-pulse"></div>
    </div>
  );
}