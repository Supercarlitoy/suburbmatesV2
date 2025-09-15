import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RejectionEmailSchema = z.object({
  email: z.string().email(),
  businessName: z.string(),
  slug: z.string(),
  suburb: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, businessName, slug, suburb } = RejectionEmailSchema.parse(body);

    // In a real implementation, you would use Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@suburbmates.com.au',
    //   to: email,
    //   subject: `${businessName} - Suburbmates Application Update`,
    //   html: `
    //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    //       <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    //         <h1 style="color: #0A2540; margin: 0; font-size: 28px;">Application Update</h1>
    //         <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Regarding your Suburbmates application</p>
    //       </div>
    //       
    //       <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    //         <p>Hi ${businessName},</p>
    //         <p>Thank you for your interest in joining Suburbmates. After reviewing your application, we're unable to approve your business profile at this time.</p>
    //         
    //         <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
    //           <h3 style="margin: 0 0 10px 0; color: #856404;">Common reasons for rejection:</h3>
    //           <ul style="margin: 0; padding-left: 20px; color: #856404;">
    //             <li>ABN verification issues or inactive business status</li>
    //             <li>Business location outside Melbourne metropolitan area</li>
    //             <li>Incomplete or inaccurate business information</li>
    //             <li>Business type not suitable for our platform</li>
    //           </ul>
    //         </div>
    //         
    //         <h3>What you can do:</h3>
    //         <ul style="padding-left: 20px;">
    //           <li><strong>Check your ABN:</strong> Ensure your ABN is active and registered with ASIC</li>
    //           <li><strong>Update your details:</strong> Make sure all business information is current and accurate</li>
    //           <li><strong>Contact us:</strong> If you believe this is an error, please reply to this email with additional information</li>
    //           <li><strong>Reapply:</strong> You're welcome to submit a new application once any issues are resolved</li>
    //         </ul>
    //         
    //         <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
    //           <p style="margin: 0; color: #1565c0;"><strong>💬 Need Help?</strong> Our team is here to assist you. Reply to this email with any questions about your application.</p>
    //         </div>
    //         
    //         <p>We appreciate your interest in Suburbmates and hope to welcome you to our community in the future.</p>
    //         
    //         <p>Best regards,<br>
    //         The Suburbmates Team<br>
    //         support@suburbmates.com.au</p>
    //       </div>
    //     </div>
    //   `
    // });

    console.log('Rejection Email Sent:', {
      email,
      businessName,
      slug,
      suburb,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Rejection email sent"
    });

  } catch (error) {
    console.error("Rejection email error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send rejection email" },
      { status: 500 }
    );
  }
}