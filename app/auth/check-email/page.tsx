import { Suspense } from 'react';
import { Metadata } from 'next';
import { CheckEmailContent } from './check-email-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SuburbMatesLogo } from '@/components/ui/SuburbMatesLogo';
import { glass } from '@/lib/design-system';

export const metadata: Metadata = {
  title: 'Check Your Email | SuburbMates',
  description: 'Please check your email to complete your SuburbMates registration.',
  robots: 'noindex, nofollow', // Don't index auth pages
};

export default function CheckEmailPage() {
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
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <CardTitle className="text-xl text-slate-900">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-base">
              We've sent you a confirmation link to complete your registration
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Suspense fallback={<CheckEmailSkeleton />}>
              <CheckEmailContent />
            </Suspense>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-slate-500">
          <p>
            Need help? Contact us at{' '}
            <a 
              href="mailto:support@suburbmates.com.au" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              support@suburbmates.com.au
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckEmailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
      <div className="h-10 bg-slate-200 rounded animate-pulse"></div>
    </div>
  );
}