import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create Supabase client for server-side auth confirmation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'email' | 'recovery' | 'invite' | null;
  const next = searchParams.get('next') ?? '/dashboard';

  if (!token_hash || !type) {
    console.error('Missing token_hash or type in confirmation URL');
    return NextResponse.redirect(`${origin}/auth/error?message=invalid-confirmation-link`);
  }

  try {
    // Verify the token hash
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      console.error('Email confirmation error:', error);
      
      // Redirect to error page with specific error info
      const errorUrl = new URL('/auth/error', origin);
      errorUrl.searchParams.set('message', 'confirmation-failed');
      errorUrl.searchParams.set('details', error.message);
      return NextResponse.redirect(errorUrl.toString());
    }

    if (!data.user) {
      console.error('No user data after confirmation');
      return NextResponse.redirect(`${origin}/auth/error?message=no-user-data`);
    }

    // Redirect to success page with appropriate context
    const successUrl = new URL('/auth/success', origin);
    
    // Add user context to the success page
    successUrl.searchParams.set('email', data.user.email || '');
    
    // Check if this is a newly confirmed user
    const wasJustConfirmed = data.user.email_confirmed_at && 
      new Date(data.user.email_confirmed_at) > new Date(Date.now() - 5 * 60 * 1000); // Within last 5 minutes
    
    if (wasJustConfirmed) {
      successUrl.searchParams.set('new', 'true');
    }
    
    // Add business name if present in user metadata
    const businessName = data.user.user_metadata?.business_name;
    if (businessName) {
      successUrl.searchParams.set('business', businessName);
    }
    
    const redirectPath = successUrl.toString();

    // Set session cookies for the confirmed user
    const response = NextResponse.redirect(redirectPath);
    
    // Set auth cookies if available
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.session.expires_in || 3600
      });
      
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
    
    // Log successful confirmation for analytics
    console.log(`[AUTH] Email confirmed successfully for user ${data.user.id}, redirecting to ${redirectPath}`);
    
    return response;

  } catch (error) {
    console.error('Unexpected error during email confirmation:', error);
    
    const errorUrl = new URL('/auth/error', origin);
    errorUrl.searchParams.set('message', 'unexpected-error');
    return NextResponse.redirect(errorUrl.toString());
  }
}