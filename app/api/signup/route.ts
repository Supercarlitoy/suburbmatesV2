import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/server/auth/auth";
import { verifyABN } from "@/features/verification/services/abr";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { sendEmailConfirmation } from "@/lib/config/email";

const prisma = new PrismaClient();

const SignupSchema = z.object({
  abn: z.string().optional(), // Made optional
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"),
  businessName: z.string().min(1),
  suburb: z.string().min(1),
  serviceAreas: z.array(z.string()).min(1, "At least one service area is required"),
  category: z.string().min(1, "Business category is required"),
  phone: z.string().optional()
});

function generateSlug(businessName: string, suburb: string): string {
  const combined = `${businessName}-${suburb}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${combined}-${suffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SignupSchema.parse(body);
    
    const { abn, email, password, businessName, suburb, serviceAreas, category, phone } = validatedData;

    // Verify ABN if provided (optional)
    let abrData = null;
    if (abn && abn.length >= 11) {
      try {
        abrData = await verifyABN(abn);
      } catch (error) {
        console.warn('ABN verification failed:', error);
        // Continue without ABN verification
      }
    }
    
    // Create Supabase auth user with custom email confirmation
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile`,
        data: {
          business_name: businessName,
          suburb: suburb
        }
      }
    });
    
    // Note: Supabase will send its own confirmation email
    // We can optionally send a custom welcome email after confirmation
    if (authData.user && !authData.user.email_confirmed_at) {
      console.log('User created, Supabase confirmation email sent to:', email);
      console.log('User will be redirected to dashboard after email confirmation');
    }

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create account" },
        { status: 400 }
      );
    }

    // Check if email confirmation is required
    if (!authData.user.email_confirmed_at && authData.user.confirmation_sent_at) {
      return NextResponse.json({
        success: true,
        message: "Account created! Please check your email to confirm your account before signing in.",
        requiresConfirmation: true,
        email: email
      });
    }

    // Generate unique slug for business listing
    const slug = generateSlug(businessName, suburb);
    
    // First create User record in Prisma to match Supabase user
    // Use upsert to handle case where user already exists
    const user = await prisma.user.upsert({
      where: { id: authData.user.id },
      update: {
        email: authData.user.email || email
      },
      create: {
        id: authData.user.id,
        email: authData.user.email || email,
        role: 'USER'
      }
    });
    
    // Create business record in database
    const business = await prisma.business.create({
      data: {
        slug,
        name: businessName,
        abn: abrData?.ABN || abn || null,
        email,
        suburb,
        serviceAreas: JSON.stringify(serviceAreas),
        category,
        phone: phone || null,
        approvalStatus: 'PENDING', // Requires admin approval
        ownerId: user.id
      }
    });

    // Send admin notification email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_business',
          businessId: business.id,
          businessName: business.name,
          email: business.email,
          suburb: business.suburb
        })
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
      // Don't fail the signup if email fails
    }

    // Send confirmation email to business owner
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: business.email,
          businessName: business.name,
          slug: business.slug
        })
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the signup if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Your profile is pending approval.",
      business: {
        id: business.id,
        slug: business.slug,
        name: business.name,
        approvalStatus: business.approvalStatus
      }
    });

  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.errors },
        { status: 400 }
      );
    }

    // Handle duplicate email/ABN
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: "Email or ABN already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}