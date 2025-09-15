"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

// Validation schemas
const updateCustomizationSchema = z.object({
  layout: z.enum(['CLASSIC', 'BOLD', 'COMPACT']).optional(),
  accent: z.enum(['BLUE', 'MINT', 'AMBER', 'PURPLE', 'RED', 'GREEN']).optional(),
  tagline: z.string().max(60, "Tagline must be 60 characters or less").optional(),
  highlights: z.array(z.string().max(40, "Highlight must be 40 characters or less")).max(5, "Maximum 5 highlights allowed").optional(),
  services: z.array(z.string().max(40, "Service must be 40 characters or less")).max(8, "Maximum 8 services allowed").optional(),
  coverImageUrl: z.string().url("Invalid cover image URL").optional().nullable(),
  logoUrl: z.string().url("Invalid logo URL").optional().nullable(),
  gallery: z.array(z.string().url("Invalid gallery image URL")).max(6, "Maximum 6 gallery images allowed").optional(),
  shareTheme: z.enum(['STANDARD', 'BOLD']).optional(),
  watermarkOpacity: z.number().min(0.1).max(0.2).optional()
});

const updateProfileThemeSchema = z.object({
  theme: z.enum(['classic', 'bold', 'compact']),
  customizations: z.object({
    tagline: z.string().max(60).optional(),
    highlights: z.array(z.string().max(40)).max(5).optional(),
    coverImage: z.string().url().optional(),
    accentColor: z.string().optional()
  }).optional()
});

type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

/**
 * Server Action: Update business profile customization
 * Handles both full customization model and quick JSON theme updates
 */
export async function updateProfileCustomization(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please log in.",
      };
    }

    // Get user's business
    const business = await prisma.business.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        customization: true
      }
    });

    if (!business) {
      return {
        success: false,
        error: "Business profile not found",
      };
    }

    // Extract and validate form data
    const rawData = {
      layout: formData.get('layout') as string || undefined,
      accent: formData.get('accent') as string || undefined,
      tagline: formData.get('tagline') as string || undefined,
      highlights: formData.get('highlights') ? JSON.parse(formData.get('highlights') as string) : undefined,
      services: formData.get('services') ? JSON.parse(formData.get('services') as string) : undefined,
      coverImageUrl: formData.get('coverImageUrl') as string || undefined,
      logoUrl: formData.get('logoUrl') as string || undefined,
      gallery: formData.get('gallery') ? JSON.parse(formData.get('gallery') as string) : undefined,
      shareTheme: formData.get('shareTheme') as string || undefined,
      watermarkOpacity: formData.get('watermarkOpacity') ? parseFloat(formData.get('watermarkOpacity') as string) : undefined
    };

    // Remove undefined values
    const cleanData = Object.fromEntries(
      Object.entries(rawData).filter(([, value]) => value !== undefined)
    );

    const validatedData = updateCustomizationSchema.parse(cleanData);

    // Update or create customization
    const customization = await prisma.businessProfileCustomization.upsert({
      where: {
        businessId: business.id,
      },
      update: {
        ...validatedData,
        updatedAt: new Date(),
      },
      create: {
        businessId: business.id,
        ...validatedData,
      },
    });

    // Log for audit trail
    console.log(`[AUDIT] Profile customization updated: ${customization.id} for business ${business.name} by user ${session.user.id}`);

    // Revalidate profile pages
    revalidatePath(`/business/${business.slug}`);
    revalidatePath(`/business/${business.slug}/edit`);
    revalidatePath('/dashboard/profile');

    return {
      success: true,
      data: customization,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
      };
    }

    console.error('[ERROR] Update profile customization failed:', error);
    return {
      success: false,
      error: "Failed to update profile customization. Please try again.",
    };
  }
}

/**
 * Server Action: Quick theme update using business data
 * For rapid prototyping and simpler theme switching
 */
export async function updateProfileTheme(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please log in.",
      };
    }

    // Get user's business
    const business = await prisma.business.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!business) {
      return {
        success: false,
        error: "Business profile not found",
      };
    }

    // Extract and validate form data
    const rawData = {
      theme: formData.get('theme') as string,
      customizations: formData.get('customizations') ? JSON.parse(formData.get('customizations') as string) : undefined
    };

    const validatedData = updateProfileThemeSchema.parse(rawData);

    // Store theme data for client-side usage
    const profileThemeData = {
      theme: validatedData.theme,
      customizations: validatedData.customizations || {},
      updatedAt: new Date().toISOString()
    };

    // Update business timestamp
    await prisma.business.update({
      where: {
        id: business.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // Log for audit trail
    console.log(`[AUDIT] Profile theme updated: ${validatedData.theme} for business ${business.name} by user ${session.user.id}`);

    // Revalidate profile pages
    revalidatePath(`/business/${business.slug}`);
    revalidatePath('/dashboard/profile');

    return {
      success: true,
      data: { theme: validatedData.theme, profileTheme: profileThemeData },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
      };
    }

    console.error('[ERROR] Update profile theme failed:', error);
    return {
      success: false,
      error: "Failed to update profile theme. Please try again.",
    };
  }
}

/**
 * Server Action: Upload and validate images for profile
 * Handles cover images, logos, and gallery images with size/type validation
 */
export async function uploadProfileImage(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please log in.",
      };
    }

    const imageType = formData.get('imageType') as string; // 'cover', 'logo', 'gallery'
    const file = formData.get('file') as File;

    if (!file || !imageType) {
      return {
        success: false,
        error: "File and image type are required",
      };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size too large. Maximum 5MB allowed.",
      };
    }

    // Get user's business
    const business = await prisma.business.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!business) {
      return {
        success: false,
        error: "Business profile not found",
      };
    }

    // In a real implementation, you would upload to a cloud storage service
    // For now, we'll simulate the upload and return a placeholder URL
    const simulatedUrl = `/uploads/${business.slug}/${imageType}/${Date.now()}-${file.name}`;

    // Log for audit trail
    console.log(`[AUDIT] Image uploaded: ${imageType} for business ${business.name} by user ${session.user.id}`);
    console.log(`[INFO] Simulated upload URL: ${simulatedUrl}`);

    return {
      success: true,
      data: { 
        url: simulatedUrl,
        type: imageType,
        filename: file.name,
        size: file.size
      },
    };
  } catch (error) {
    console.error('[ERROR] Upload profile image failed:', error);
    return {
      success: false,
      error: "Failed to upload image. Please try again.",
    };
  }
}

/**
 * Server Action: Reset profile customization to defaults
 */
export async function resetProfileCustomization(_formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please log in.",
      };
    }

    // Get user's business
    const business = await prisma.business.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        customization: true
      }
    });

    if (!business) {
      return {
        success: false,
        error: "Business profile not found",
      };
    }

    // Delete existing customization (will use defaults)
    if (business.customization) {
      await prisma.businessProfileCustomization.delete({
        where: {
          id: business.customization.id,
        },
      });
    }

    // Update business timestamp
    await prisma.business.update({
      where: {
        id: business.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // Log for audit trail
    console.log(`[AUDIT] Profile customization reset for business ${business.name} by user ${session.user.id}`);

    // Revalidate profile pages
    revalidatePath(`/business/${business.slug}`);
    revalidatePath(`/business/${business.slug}/edit`);
    revalidatePath('/dashboard/profile');

    return {
      success: true,
      data: { message: "Profile customization reset to defaults" },
    };
  } catch (error) {
    console.error('[ERROR] Reset profile customization failed:', error);
    return {
      success: false,
      error: "Failed to reset profile customization. Please try again.",
    };
  }
}