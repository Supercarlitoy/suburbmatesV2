'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/enhanced-auth-service';

export function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  const email = searchParams.get('email');
  const hasBusinessName = searchParams.get('business');
  const isNewUser = searchParams.get('new') === 'true';

  useEffect(() => {
    // Analytics tracking for successful confirmation
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'email_confirmed', {
        event_category: 'authentication',
        is_new_user: isNewUser,
        has_business_name: !!hasBusinessName,
      });
    }

    // Get user information
    const loadUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        setUserInfo(user);
      } catch (error) {
        console.error('Failed to load user info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, [isNewUser, hasBusinessName]);

  const handleContinue = () => {
    // Track the continue action
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'onboarding_continue', {
        event_category: 'user_journey',
        has_business_name: !!hasBusinessName,
        user_type: isNewUser ? 'new' : 'returning',
      });
    }

    // Route based on business context
    if (hasBusinessName) {
      // User provided business name during signup - go to create profile
      router.push('/business/create?source=signup');
    } else {
      // No business name - show workflow choice
      router.push('/onboarding/workflow-choice');
    }
  };

  const handleExploreFirst = () => {
    // Track explore action
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'explore_first_selected', {
        event_category: 'user_journey',
        has_business_name: !!hasBusinessName,
      });
    }

    router.push('/explore?welcome=true');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
        <div className="h-10 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-slate-900">
          {isNewUser ? 'Account Created Successfully!' : 'Welcome Back!'}
        </h3>
        <p className="text-slate-600">
          {email && `Your email ${email} has been confirmed. `}
          {hasBusinessName 
            ? `Let's get your business "${hasBusinessName}" set up on SuburbMates.`
            : "You're ready to start connecting with Melbourne's business community."
          }
        </p>
      </div>

      {/* Personalized welcome message based on context */}
      <div className="bg-navy-50 border border-navy-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-navy-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-navy-900">What's next?</h4>
            <p className="mt-1 text-sm text-navy-700">
              {hasBusinessName 
                ? "We'll help you create a professional profile and get your business discovered by local customers."
                : "Choose to create a new business profile or claim an existing one. You can also explore what other businesses are doing on SuburbMates."
              }
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleContinue}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
        >
          {hasBusinessName ? 'Set Up My Business Profile' : 'Get Started'}
        </Button>

        {!hasBusinessName && (
          <Button
            onClick={handleExploreFirst}
            variant="outline"
            className="w-full"
          >
            Explore SuburbMates First
          </Button>
        )}

        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="w-full text-slate-600 hover:text-slate-900"
        >
          Go to Dashboard
        </Button>
      </div>

      {/* Show user info if available */}
      {userInfo && (
        <div className="border-t pt-4">
          <p className="text-xs text-slate-500">
            Signed in as {userInfo.email}
          </p>
          {userInfo.user_metadata?.business_name && (
            <p className="text-xs text-slate-500">
              Business: {userInfo.user_metadata.business_name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}