"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/database/prisma";
import { z } from "zod";

// Schema for lead creation (server-side validation)
const createLeadSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message too long"),
  source: z.enum(['PROFILE', 'SEARCH', 'FEED', 'SHARE']).optional().default('PROFILE'),
});

const updateLeadSchema = z.object({
  id: z.string().min(1, "Lead ID is required"),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']),
});

type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

/**
 * Server Action: Create a new lead
 * This is a safe write operation that runs on the server
 */
export async function createLead(formData: FormData): Promise<ActionResult> {
  try {
    // Extract and validate form data
    const rawData = {
      businessId: formData.get('businessId') as string,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      message: formData.get('message') as string,
      source: (formData.get('source') as string) || 'PROFILE',
    };

    const validatedData = createLeadSchema.parse(rawData);

    // Verify business exists and is approved
    const business = await prisma.business.findUnique({
      where: {
        id: validatedData.businessId,
        approvalStatus: 'APPROVED',
      },
    });

    if (!business) {
      return {
        success: false,
        error: "Business not found or not approved",
      };
    }

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        businessId: validatedData.businessId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        source: validatedData.source,
        status: 'NEW',
      },
    });

    // Log for audit trail
    console.log(`[AUDIT] Lead created: ${lead.id} for business ${business.name} by ${validatedData.name} (${validatedData.email})`);

    // TODO: Send email notification to business owner
    // This would be implemented with a real email service in production
    console.log(`[EMAIL] New lead notification for business ${business.name}:`, {
      leadId: lead.id,
      customerName: lead.name,
      customerEmail: lead.email,
      message: lead.message,
    });

    // Revalidate relevant pages
    revalidatePath(`/business/${business.slug}`);
    revalidatePath('/dashboard/leads');

    return {
      success: true,
      data: { leadId: lead.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
      };
    }

    console.error('[ERROR] Create lead failed:', error);
    return {
      success: false,
      error: "Failed to create lead. Please try again.",
    };
  }
}

/**
 * Server Action: Update lead status
 * Only accessible to business owners for their own leads
 */
export async function updateLeadStatus(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please log in.",
      };
    }

    // Extract and validate form data
    const rawData = {
      id: formData.get('id') as string,
      status: formData.get('status') as string,
    };

    const validatedData = updateLeadSchema.parse(rawData);

    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!business) {
      return {
        success: false,
        error: "Business profile not found",
      };
    }

    // Verify lead exists and belongs to user's business
    const existingLead = await prisma.lead.findUnique({
      where: {
        id: validatedData.id,
        businessId: business.id,
      },
    });

    if (!existingLead) {
      return {
        success: false,
        error: "Lead not found or access denied",
      };
    }

    // Update the lead
    const updatedLead = await prisma.lead.update({
      where: {
        id: validatedData.id,
      },
      data: {
        status: validatedData.status,
      },
    });

    // Log for audit trail
    console.log(`[AUDIT] Lead status updated: ${updatedLead.id} from ${existingLead.status} to ${validatedData.status} by user ${session.user.id}`);

    // Revalidate leads page
    revalidatePath('/dashboard/leads');

    return {
      success: true,
      data: updatedLead,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
      };
    }

    console.error('[ERROR] Update lead status failed:', error);
    return {
      success: false,
      error: "Failed to update lead status. Please try again.",
    };
  }
}

/**
 * Server Action: Delete lead
 * Only accessible to business owners for their own leads
 */
export async function deleteLead(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized. Please log in.",
      };
    }

    const leadId = formData.get('id') as string;
    
    if (!leadId) {
      return {
        success: false,
        error: "Lead ID is required",
      };
    }

    // Get user's business
    const business = await prisma.business.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!business) {
      return {
        success: false,
        error: "Business profile not found",
      };
    }

    // Verify lead exists and belongs to user's business
    const existingLead = await prisma.lead.findUnique({
      where: {
        id: leadId,
        businessId: business.id,
      },
    });

    if (!existingLead) {
      return {
        success: false,
        error: "Lead not found or access denied",
      };
    }

    // Delete the lead
    await prisma.lead.delete({
      where: {
        id: leadId,
      },
    });

    // Log for audit trail
    console.log(`[AUDIT] Lead deleted: ${leadId} (${existingLead.name} - ${existingLead.email}) by user ${session.user.id}`);

    // Revalidate leads page
    revalidatePath('/dashboard/leads');

    return {
      success: true,
      data: { message: "Lead deleted successfully" },
    };
  } catch (error) {
    console.error('[ERROR] Delete lead failed:', error);
    return {
      success: false,
      error: "Failed to delete lead. Please try again.",
    };
  }
}