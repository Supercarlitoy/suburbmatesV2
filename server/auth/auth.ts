import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Create Supabase client for server-side operations
 * Used in Server Components, Route Handlers, and Server Actions
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create Supabase client for middleware
 * Used in middleware.ts for route protection
 */
export function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, supabaseResponse };
}

/**
 * Get current user session
 * Returns user data if authenticated, null if not
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user is admin
 * Returns true if user has admin role
 */
export async function isAdmin() {
  const user = await getCurrentUser();
  
  if (!user) {
    return false;
  }
  
  // Check user metadata for admin role
  return user.user_metadata?.role === "admin" || user.app_metadata?.role === "admin";
}

/**
 * Get user's business profile
 * Returns business data if user has a business, null if not
 */
export async function getUserBusiness() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  // This would typically query your database
  // For now, return null - implement with Prisma later
  return null;
}

/**
 * Sign out user
 * Clears session and redirects
 */
export async function signOut() {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return { success: false, error: "Failed to sign out" };
  }
}