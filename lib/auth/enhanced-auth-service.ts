import { createClient } from '@supabase/supabase-js';
import { renderEmailTemplate } from '@/lib/email/templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Analytics event tracking
function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'authentication',
      ...properties
    });
  }
}

// Enhanced signup with proper redirects
export async function signUpWithEmail({
  email,
  password,
  businessName,
  metadata = {}
}: {
  email: string;
  password: string;
  businessName?: string;
  metadata?: Record<string, any>;
}) {
  try {
    trackEvent('sign_up_started', { has_business_name: !!businessName });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          business_name: businessName,
          ...metadata,
        }
      }
    });

    if (error) {
      trackEvent('sign_up_failed', { 
        error: error.message,
        error_code: error.status 
      });
      throw error;
    }

    // Track successful signup initiation
    trackEvent('sign_up_email_sent', { 
      has_business_name: !!businessName 
    });

    // Redirect to check-email page with context
    const redirectUrl = new URL('/auth/check-email', window.location.origin);
    redirectUrl.searchParams.set('email', email);
    redirectUrl.searchParams.set('type', 'signup');
    if (businessName) {
      redirectUrl.searchParams.set('business', businessName);
    }

    return {
      success: true,
      redirectUrl: redirectUrl.toString(),
      user: data.user,
      message: 'Please check your email to confirm your account'
    };

  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create account'
    };
  }
}

// Enhanced magic link signin
export async function signInWithMagicLink({ 
  email,
  isReturnUser = true 
}: { 
  email: string; 
  isReturnUser?: boolean; 
}) {
  try {
    trackEvent('magic_link_requested', { is_return_user: isReturnUser });

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          is_return_user: isReturnUser
        }
      }
    });

    if (error) {
      trackEvent('magic_link_failed', { 
        error: error.message,
        error_code: error.status 
      });
      throw error;
    }

    trackEvent('magic_link_sent', { is_return_user: isReturnUser });

    // Redirect to check-email page
    const redirectUrl = new URL('/auth/check-email', window.location.origin);
    redirectUrl.searchParams.set('email', email);
    redirectUrl.searchParams.set('type', 'magic-link');

    return {
      success: true,
      redirectUrl: redirectUrl.toString(),
      message: 'Please check your email for your login link'
    };

  } catch (error: any) {
    console.error('Magic link error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send magic link'
    };
  }
}

// Password reset with proper redirects
export async function resetPassword({ email }: { email: string }) {
  try {
    trackEvent('password_reset_requested');

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) {
      trackEvent('password_reset_failed', { 
        error: error.message,
        error_code: error.status 
      });
      throw error;
    }

    trackEvent('password_reset_email_sent');

    // Redirect to check-email page
    const redirectUrl = new URL('/auth/check-email', window.location.origin);
    redirectUrl.searchParams.set('email', email);
    redirectUrl.searchParams.set('type', 'recovery');

    return {
      success: true,
      redirectUrl: redirectUrl.toString(),
      message: 'Please check your email for password reset instructions'
    };

  } catch (error: any) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send reset email'
    };
  }
}

// Session management
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Get user error:', error);
    return null;
  }

  return user;
}

export async function signOut() {
  trackEvent('sign_out_initiated');
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    trackEvent('sign_out_failed', { error: error.message });
    throw error;
  }

  trackEvent('sign_out_completed');
  return { success: true };
}

// Auth state change listener
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    // Track important auth events
    if (event === 'SIGNED_IN') {
      trackEvent('session_established', {
        user_id: session?.user?.id,
        provider: session?.user?.app_metadata?.provider
      });
    } else if (event === 'SIGNED_OUT') {
      trackEvent('session_ended');
    } else if (event === 'TOKEN_REFRESHED') {
      trackEvent('session_refreshed');
    }

    callback(event, session);
  });
}

// Resend confirmation email
export async function resendConfirmation({ email }: { email: string }) {
  try {
    trackEvent('confirmation_resend_requested', { email });

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      }
    });

    if (error) {
      trackEvent('confirmation_resend_failed', { 
        error: error.message,
        error_code: error.status 
      });
      throw error;
    }

    trackEvent('confirmation_resend_sent', { email });

    return {
      success: true,
      message: 'Confirmation email sent! Please check your inbox.'
    };

  } catch (error: any) {
    console.error('Confirmation resend error:', error);
    return {
      success: false,
      error: error.message || 'Failed to resend confirmation email'
    };
  }
}

// Check if user needs to complete profile
export async function checkProfileCompletion() {
  const user = await getCurrentUser();
  
  if (!user) return { needsProfile: false };

  // Check if user has associated business profile
  try {
    const response = await fetch('/api/user/profile-status');
    const data = await response.json();
    
    return {
      needsProfile: !data.hasProfile,
      hasClaimedBusiness: data.hasClaimedBusiness,
      profileStatus: data.profileStatus
    };
  } catch (error) {
    console.error('Profile status check failed:', error);
    return { needsProfile: true };
  }
}
