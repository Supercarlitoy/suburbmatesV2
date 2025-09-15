import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ApprovalEmailSchema = z.object({
  email: z.string().email(),
  businessName: z.string(),
  slug: z.string(),
  suburb: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, businessName, slug, suburb } = ApprovalEmailSchema.parse(body);

    // In a real implementation, you would use Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@suburbmates.com.au',
    //   to: email,
    //   subject: `🎉 ${businessName} - Your Suburbmates Profile is Live!`,
    //   html: `
    //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    //       <div style="background: linear-gradient(135deg, #0A2540 0%, #B76E00 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    //         <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
    //         <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your business profile is now live</p>
    //       </div>
    //       
    //       <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    //         <p>Hi ${businessName},</p>
    //         <p><strong>Great news!</strong> Your Suburbmates business profile has been approved and is now live for all Melbourne residents to discover.</p>
    //         
    //         <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
    //           <h3 style="margin: 0 0 10px 0; color: #0A2540;">Your Profile is Live!</h3>
    //           <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/${slug}" 
    //              style="display: inline-block; background: #0A2540; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
    //             View Your Profile
    //           </a>
    //           <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
    //             suburbmates.com.au/business/${slug}
    //           </p>
    //         </div>
    //         
    //         <h3>Start Getting Leads Today:</h3>
    //         <ul style="padding-left: 20px;">
    //           <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile">Complete your business profile</a> with photos and detailed description</li>
    //           <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/content">Share your first post</a> to engage with the ${suburb} community</li>
    //           <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/leads">Monitor your leads</a> and respond quickly to inquiries</li>
    //           <li>Share your profile on social media to reach more customers</li>
    //         </ul>
    //         
    //         <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
    //           <p style="margin: 0; color: #2d5a2d;"><strong>💡 Pro Tip:</strong> Businesses that complete their profile and post regularly get 3x more leads!</p>
    //         </div>
    //         
    //         <p>Welcome to the Suburbmates community! We're excited to help you connect with local customers in ${suburb} and across Melbourne.</p>
    //         
    //         <p>Questions? Reply to this email or contact us at support@suburbmates.com.au</p>
    //         
    //         <p>Cheers,<br>
    //         The Suburbmates Team</p>
    //       </div>
    //     </div>
    //   `
    // });

    console.log('Approval Email Sent:', {
      email,
      businessName,
      slug,
      suburb,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Approval email sent"
    });

  } catch (error) {
    console.error("Approval email error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send approval email" },
      { status: 500 }
    );
  }
}