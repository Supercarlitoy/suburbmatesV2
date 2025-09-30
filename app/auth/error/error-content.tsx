'use client';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resendConfirmation } from '@/lib/auth/enhanced-auth-service';

interface ErrorInfo {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  showResendEmail?: boolean;
}

export function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const email = searchParams.get('email');

  const getErrorInfo = (): ErrorInfo => {
    switch (error) {
      case 'access_denied':
        return {
          title: 'Email Confirmation Required',
          message: 'Please check your email and click the confirmation link to verify your account.',
          showResendEmail: true,
        };
      
      case 'invalid_request':
        return {
          title: 'Invalid Link',
          message: 'This confirmation link is invalid or has expired. Please request a new one.',
          showResendEmail: true,
        };
      
      case 'server_error':
        return {
          title: 'Server Error',
          message: 'We\'re experiencing technical difficulties. Please try again in a few minutes.',
          action: {
            label: 'Try Again',
            onClick: () => router.push('/auth/signin'),
          },
        };
      
      case 'signup_disabled':
        return {
          title: 'Registration Temporarily Disabled',
          message: 'New registrations are temporarily unavailable. Please try again later.',
          action: {
            label: 'Back to Sign In',
            onClick: () => router.push('/auth/signin'),
          },
        };
      
      case 'email_not_confirmed':
        return {
          title: 'Email Not Confirmed',
          message: 'Your email address hasn\'t been confirmed yet. Please check your inbox for the confirmation email.',
          showResendEmail: true,
        };
      
      case 'expired_token':
        return {
          title: 'Link Expired',
          message: 'This confirmation link has expired. Please request a new confirmation email.',
          showResendEmail: true,
        };
      
      case 'invalid_token':
        return {
          title: 'Invalid Token',
          message: 'This confirmation link is no longer valid. Please request a new confirmation email.',
          showResendEmail: true,
        };
      
      default:
        return {
          title: 'Authentication Error',
          message: errorDescription || 'An unexpected error occurred during authentication. Please try again.',
          action: {
            label: 'Back to Sign In',
            onClick: () => router.push('/auth/signin'),
          },
        };
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage('Email address not found. Please sign up again.');
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    try {
      const result = await resendConfirmation({ email });
      if (result.success) {
        setResendMessage(result.message ?? 'Confirmation email sent.');
      } else {
        setResendMessage(result.error || 'Failed to resend email. Please try signing up again.');
      }
    } catch (error) {
      console.error('Failed to resend confirmation:', error);
      setResendMessage('Failed to resend email. Please try signing up again.');
    } finally {
      setIsResending(false);
    }
  };

  const errorInfo = getErrorInfo();

  // Analytics tracking for error pages
  useEffect(() => {
if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'auth_error_viewed', {
        event_category: 'authentication',
        error_type: error || 'unknown',
        error_description: errorDescription,
        has_email: !!email,
      });
    }
  }, [error, errorDescription, email]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-slate-900">
          {errorInfo.title}
        </h3>
        <p className="text-slate-600">
          {errorInfo.message}
        </p>
      </div>

      {resendMessage && (
        <Alert className={resendMessage.includes('sent') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={resendMessage.includes('sent') ? 'text-green-800' : 'text-red-800'}>
            {resendMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {errorInfo.showResendEmail && email && (
          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isResending ? 'Sending...' : 'Resend Confirmation Email'}
          </Button>
        )}

        {errorInfo.action && (
          <Button
            onClick={errorInfo.action.onClick}
            variant="outline"
            className="w-full"
          >
            {errorInfo.action.label}
          </Button>
        )}

        <Button
          onClick={() => router.push('/')}
          variant="ghost"
          className="w-full text-slate-600 hover:text-slate-900"
        >
          Back to Home
        </Button>
      </div>

      {error && (
        <details className="text-xs text-slate-400 border-t pt-4">
          <summary className="cursor-pointer hover:text-slate-600">
            Technical Details
          </summary>
          <div className="mt-2 space-y-1">
            <p><strong>Error:</strong> {error}</p>
            {errorDescription && (
              <p><strong>Description:</strong> {errorDescription}</p>
            )}
            {email && (
              <p><strong>Email:</strong> {email}</p>
            )}
          </div>
        </details>
      )}
    </div>
  );
}