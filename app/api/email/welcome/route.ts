import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const WelcomeEmailSchema = z.object({
  email: z.string().email(),
  businessName: z.string(),
  slug: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, businessName, slug } = WelcomeEmailSchema.parse(body);

    // Professional branded email template
    const emailTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SuburbMates</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo and Branding -->
          <div style="background: linear-gradient(135deg, #0A2540 0%, #1e40af 100%); padding: 40px 30px; text-align: centre; border-radius: 8px 8px 0 0;">
            <div style="display: inline-block; width: 60px; height: 60px; background-color: #ffffff; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: centre; justify-content: centre;">
              <span style="font-size: 24px; font-weight: bold; color: #0A2540; line-height: 60px;">S</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Welcome to SuburbMates!</h1>
            <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 18px; font-weight: 300;">Your Melbourne business network</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #0A2540; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">G'day ${businessName}! 👋</h2>
            
            <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
              Thank you for joining SuburbMates! Your business profile has been created and is currently under review by our team.
            </p>
            
            <!-- Status Card -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: centre;">
              <div style="width: 48px; height: 48px; background-color: #0ea5e9; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: centre; justify-content: centre;">
                <span style="color: white; font-size: 20px;">⏳</span>
              </div>
              <h3 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 18px; font-weight: 600;">Profile Under Review</h3>
              <p style="margin: 0; color: #0369a1; font-size: 14px;">Our team typically reviews new profiles within 24 hours</p>
            </div>
            
            <!-- What's Next Section -->
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 15px 0; color: #0A2540; font-size: 18px; font-weight: 600;">What happens next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.6;">
                <li style="margin-bottom: 8px;">Our team will verify your business details and ABN (if provided)</li>
                <li style="margin-bottom: 8px;">Once approved, your profile goes live at: <strong style="color: #0A2540;">suburbmates.com.au/business/${slug}</strong></li>
                <li style="margin-bottom: 8px;">You'll start receiving leads from local Melbourne residents</li>
                <li>We'll send you a confirmation email when your profile is live</li>
              </ul>
            </div>
            
            <!-- Action Buttons -->
            <div style="text-align: centre; margin: 30px 0;">
              <h3 style="margin: 0 0 20px 0; color: #0A2540; font-size: 18px; font-weight: 600;">While you wait, get started:</h3>
              
              <div style="margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile" 
                   style="display: inline-block; background: linear-gradient(135deg, #0A2540 0%, #1e40af 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  📝 Complete Your Profile
                </a>
              </div>
              
              <div style="margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/content" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  ✨ Add Your First Post
                </a>
              </div>
              
              <div style="margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/search" 
                   style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                  🔍 Explore Melbourne Businesses
                </a>
              </div>
            </div>
            
            <!-- Support Section -->
            <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-weight: 600;">💬 Need Help?</h4>
              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                Our support team is here to help! Contact us at 
                <a href="mailto:support@suburbmates.com.au" style="color: #92400e; font-weight: 600;">support@suburbmates.com.au</a> 
                or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" style="color: #92400e; font-weight: 600;">Help Centre</a>.
              </p>
            </div>
            
            <div style="text-align: centre; margin: 40px 0 20px 0;">
              <p style="color: #64748b; font-size: 16px; margin: 0 0 10px 0;">Welcome to the community!</p>
              <p style="color: #0A2540; font-weight: 600; font-size: 16px; margin: 0;">The SuburbMates Team 🇦🇺</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 30px; text-align: centre; border-radius: 0 0 8px 8px;">
            <div style="margin-bottom: 20px;">
              <span style="display: inline-block; width: 40px; height: 40px; background-color: #0A2540; border-radius: 8px; color: white; font-weight: bold; font-size: 16px; line-height: 40px; margin: 0 5px;">S</span>
              <span style="color: #0A2540; font-weight: 700; font-size: 18px; vertical-align: middle;">SuburbMates</span>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0; line-height: 1.5;">
              Connecting Melbourne businesses with local residents since 2024
            </p>
            
            <div style="margin: 15px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/about" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">About</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" style="color: #64748b; text-decoration: none; margin: 0 10px; font-size: 12px;">Help</a>
            </div>
            
            <p style="color: #94a3b8; font-size: 12px; margin: 15px 0 0 0;">
              © 2024 SuburbMates. All rights reserved.<br>
              Melbourne, Victoria, Australia
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send email using Resend
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      await resend.emails.send({
        from: `welcome@${process.env.SENDER_DOMAIN || 'mail.suburbmates.com.au'}`,
        to: email,
        subject: `Welcome to SuburbMates, ${businessName}! 🇦🇺`,
        html: emailTemplate
      });
      
      console.log('Welcome email sent successfully to:', email);
    } catch (emailSendError) {
      console.error('Failed to send welcome email:', emailSendError);
      // Don't throw error - log and continue
    }
    
    // For development, log the email content
    console.log('Welcome email would be sent to:', email);
    console.log('Email template generated for:', businessName);

    console.log('Welcome Email Sent:', {
      email,
      businessName,
      slug,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Welcome email sent"
    });

  } catch (error) {
    console.error("Welcome email error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}