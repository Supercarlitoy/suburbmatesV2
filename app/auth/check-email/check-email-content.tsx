"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Mail, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

export function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'signup'; // signup, recovery, invite
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);

  // Analytics tracking
  useEffect(() => {
    // Track that user reached check email page
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'check_email_shown', {
        event_category: 'authentication',
        event_label: type,
        value: 1
      });
    }
  }, [type]);

  // Resend cooldown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const getEmailInstructions = () => {
    switch (type) {
      case 'recovery':
        return {
          title: 'Password Reset Link Sent',
          description: 'Check your email for a link to reset your password.',
          sender: 'no-reply@suburbmates.com.au',
          subject: 'Reset Your SuburbMates Password'
        };
      case 'invite':
        return {
          title: 'Business Invitation Sent',
          description: 'Check your email for an invitation to manage your business profile.',
          sender: 'no-reply@suburbmates.com.au',
          subject: 'Invitation to Manage Your Business on SuburbMates'
        };
      default:
        return {
          title: 'Confirmation Email Sent',
          description: 'Check your email for a link to complete your registration.',
          sender: 'no-reply@suburbmates.com.au',
          subject: 'Confirm Your SuburbMates Account'
        };
    }
  };

  const handleResendEmail = async () => {
    if (!email || timeLeft > 0) return;
    
    setIsResending(true);
    setResendStatus('idle');

    try {
      let result;
      
      if (type === 'recovery') {
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`
        });
      } else {
        result = await supabase.auth.resend({
          type: 'signup',
          email: email
        });
      }

      if (result.error) {
        throw result.error;
      }

      setResendStatus('success');
      setTimeLeft(60); // 60 second cooldown
      
      // Track resend action
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'email_resend_requested', {
          event_category: 'authentication',
          event_label: type,
          value: 1
        });
      }
    } catch (error) {
      console.error('Error resending email:', error);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const instructions = getEmailInstructions();
  const maskedEmail = email ? 
    email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 
    'your email address';

  return (
    <div className="space-y-6">
      {/* Email Instructions */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm text-slate-700">
              <strong>Email sent to:</strong> {maskedEmail}
            </p>
            <p className="text-sm text-slate-600">
              <strong>From:</strong> {instructions.sender}
            </p>
            <p className="text-sm text-slate-600">
              <strong>Subject:</strong> {instructions.subject}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Next Steps:
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the confirmation link in the email</li>
            <li>You'll be redirected back to complete your setup</li>
          </ol>
        </div>
      </div>

      {/* Resend Email Section */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-4">
            Didn't receive the email?
          </p>
          
          {email && (
            <Button
              onClick={handleResendEmail}
              disabled={isResending || timeLeft > 0}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : timeLeft > 0 ? (
                `Resend in ${timeLeft}s`
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Email
                </>
              )}
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {resendStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Email sent successfully! Please check your inbox.
            </AlertDescription>
          </Alert>
        )}

        {resendStatus === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to send email. Please try again or contact support.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Additional Help */}
      <div className="border-t pt-4">
        <p className="text-xs text-slate-500 text-center">
          Email not arriving? Check your spam folder or try adding{' '}
          <span className="font-medium">no-reply@suburbmates.com.au</span>{' '}
          to your contacts.
        </p>
      </div>
    </div>
  );
}