import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const AdminNotifySchema = z.object({
  type: z.enum(['new_business', 'business_update']),
  businessId: z.string(),
  businessName: z.string(),
  email: z.string().email(),
  suburb: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, businessId, businessName, email, suburb } = AdminNotifySchema.parse(body);

    // In a real implementation, you would:
    // 1. Send email to admin using Resend
    // 2. Create admin notification in database
    // 3. Possibly send Slack/Discord notification

    console.log('Admin Notification:', {
      type,
      businessId,
      businessName,
      email,
      suburb,
      timestamp: new Date().toISOString()
    });

    // Send admin notification email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      await resend.emails.send({
        from: `admin@${process.env.SENDER_DOMAIN || 'mail.suburbmates.com.au'}`,
        to: process.env.ADMIN_EMAIL || 'admin@suburbmates.com.au',
        subject: `New Business Registration: ${businessName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0A2540;">New Business Registration</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Business:</strong> ${businessName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Suburb:</strong> ${suburb}</p>
              <p><strong>Business ID:</strong> ${businessId}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/approve" 
                 style="background: #0A2540; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Review & Approve Business
              </a>
            </div>
            <p style="color: #64748b; font-size: 14px;">This business is awaiting approval to go live on SuburbMates.</p>
          </div>
        `
      });
      
      console.log('Admin notification email sent successfully');
    } catch (emailSendError) {
      console.error('Failed to send admin notification email:', emailSendError);
      // Don't throw error - log and continue
    }

    return NextResponse.json({
      success: true,
      message: "Admin notification sent"
    });

  } catch (error) {
    console.error("Admin notification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid notification data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send admin notification" },
      { status: 500 }
    );
  }
}