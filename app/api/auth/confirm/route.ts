import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/server/auth/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard/profile';
  const error_code = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // Handle Supabase auth errors
  if (error_code) {
    console.error('Supabase auth error:', error_code, error_description);
    return NextResponse.redirect(
      new URL(`/login?error=${error_code}&message=${encodeURIComponent(error_description || 'Email confirmation failed')}`, request.url)
    );
  }

  // Handle successful confirmation
  if (token_hash && type) {
    const supabase = await createClient();

    try {
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      });

      if (!error) {
        console.log('Email confirmation successful, redirecting to:', next);
        // Redirect to the dashboard or specified next URL
        return NextResponse.redirect(new URL(next, request.url));
      } else {
        console.error('OTP verification failed:', error);
        return NextResponse.redirect(
          new URL(`/login?error=verification_failed&message=${encodeURIComponent(error.message)}`, request.url)
        );
      }
    } catch (verifyError: unknown) {
      console.error('Error during OTP verification:', verifyError);
      return NextResponse.redirect(
        new URL('/login?error=confirmation_error&message=Verification process failed', request.url)
      );
    }
  }

  // If there's missing parameters, redirect to login with error
  console.log('Missing confirmation parameters');
  return NextResponse.redirect(
    new URL('/login?error=invalid_confirmation&message=Invalid confirmation link', request.url)
  );
}