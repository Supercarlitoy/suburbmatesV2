import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email template types
type EmailTemplate = 
  | 'new-inquiry' 
  | 'claim-submitted' 
  | 'claim-approved' 
  | 'claim-rejected'
  | 'welcome-business'
  | 'registration-confirmation';

// Validation schema
const EmailSchema = z.object({
  to: z.string().email('Valid email is required'),
  template: z.enum([
    'new-inquiry', 
    'claim-submitted', 
    'claim-approved', 
    'claim-rejected',
    'welcome-business',
    'registration-confirmation'
  ]),
  data: z.record(z.any()), // Dynamic data for template
});

// Email templates
const getEmailTemplate = (template: EmailTemplate, data: Record<string, any>) => {
  switch (template) {
    case 'new-inquiry':
      return {
        subject: `New local customer inquiry for ${data.businessName} | SuburbMates`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 2rem; text-align: center;">
              <div style="display: inline-block; background: white; padding: 8px 16px; border-radius: 20px; margin-bottom: 1rem;">
                <span style="color: #1e3a8a; font-weight: bold; font-size: 0.9rem;">SUBURBMATES</span>
              </div>
              <h1 style="margin: 0; font-size: 1.5rem; font-weight: 600;">New Local Customer Inquiry</h1>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">A verified local customer is interested in ${data.businessName}</p>
            </div>
            
            <div style="padding: 2rem; background: white;">
              <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="display: inline-block; background: #f0f9ff; padding: 8px 16px; border-radius: 20px; border: 1px solid #bfdbfe;">
                  <span style="color: #1e40af; font-weight: 500; font-size: 0.85rem;">📍 ABN-VERIFIED MELBOURNE BUSINESS</span>
                </div>
              </div>
              
              <h2 style="color: #1e40af; margin: 0 0 1.5rem 0; text-align: center; font-size: 1.25rem;">Customer Contact Details</h2>
              
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid #e2e8f0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div>
                    <p style="margin: 0 0 0.25rem 0; color: #64748b; font-size: 0.85rem; font-weight: 500;">CUSTOMER NAME</p>
                    <p style="margin: 0; color: #1e293b; font-weight: 600;">${data.customerName}</p>
                  </div>
                  <div>
                    <p style="margin: 0 0 0.25rem 0; color: #64748b; font-size: 0.85rem; font-weight: 500;">EMAIL ADDRESS</p>
                    <p style="margin: 0;"><a href="mailto:${data.customerEmail}" style="color: #1e40af; text-decoration: none; font-weight: 500;">${data.customerEmail}</a></p>
                  </div>
                </div>
                ${data.customerPhone ? `
                <div style="margin-bottom: 1rem;">
                  <p style="margin: 0 0 0.25rem 0; color: #64748b; font-size: 0.85rem; font-weight: 500;">PHONE NUMBER</p>
                  <p style="margin: 0;"><a href="tel:${data.customerPhone}" style="color: #1e40af; text-decoration: none; font-weight: 500;">${data.customerPhone}</a></p>
                </div>
                ` : ''}
                <div>
                  <p style="margin: 0 0 0.5rem 0; color: #64748b; font-size: 0.85rem; font-weight: 500;">INQUIRY MESSAGE</p>
                  <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <p style="margin: 0; color: #374151; line-height: 1.5;">${data.message.replace(/\n/g, '<br>')}</p>
                  </div>
                </div>
              </div>

              
              <div style="background: #eff6ff; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; border: 1px solid #bfdbfe;">
                <h3 style="margin: 0 0 0.5rem 0; color: #1e40af; font-size: 1rem;">💡 Business Growth Tip</h3>
                <p style="margin: 0; color: #1e40af; font-size: 0.9rem; line-height: 1.4;">
                  <strong>Respond within 1 hour</strong> to increase conversion rates by 60%. Melbourne customers value quick, professional responses from local businesses.
                </p>
              </div>

              <div style="text-align: center; margin: 2rem 0;">
                <div style="margin-bottom: 1rem;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inquiries" 
                     style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                    📧 Reply to Customer
                  </a>
                </div>
                <div>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                     style="color: #64748b; text-decoration: none; font-size: 0.9rem; border-bottom: 1px solid #cbd5e1;">
                    View Dashboard →
                  </a>
                </div>
              </div>

              <div style="border-top: 2px solid #e2e8f0; padding-top: 1.5rem; color: #64748b; font-size: 0.8rem; text-align: center;">
                <p style="margin: 0 0 0.5rem 0; font-weight: 500;">
                  🎯 <strong>SuburbMates Quality Lead</strong> • Inquiry ID: ${data.inquiryId}
                </p>
                <p style="margin: 0; line-height: 1.4;">
                  This customer found you through our ABN-verified Melbourne business directory.<br>
                  All SuburbMates leads are pre-qualified for local intent and authenticity.
                </p>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 2rem; text-align: center; color: #475569; font-size: 0.85rem; border-top: 1px solid #e2e8f0;">
              <div style="margin-bottom: 1rem;">
                <img src="https://suburbmates.com.au/logo.png" alt="SuburbMates" style="height: 24px; vertical-align: middle;" onerror="this.style.display='none'">
                <span style="font-weight: bold; color: #1e40af; margin-left: 8px;">SUBURBMATES</span>
              </div>
              <p style="margin: 0 0 0.5rem 0; font-weight: 500;">
                Melbourne's trusted local business directory
              </p>
              <p style="margin: 0;">
                <a href="https://suburbmates.com.au" style="color: #3b82f6; text-decoration: none;">suburbmates.com.au</a> • 
                <a href="https://suburbmates.com.au/privacy" style="color: #64748b; text-decoration: none;">Privacy</a> • 
                <a href="https://suburbmates.com.au/terms" style="color: #64748b; text-decoration: none;">Terms</a>
              </p>
            </div>
          </div>
        `,
      };

    case 'claim-submitted':
      return {
        subject: `Business claim submitted - ${data.businessName} | SuburbMates Melbourne`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 2rem; text-align: center;">
              <div style="display: inline-block; background: white; padding: 8px 16px; border-radius: 20px; margin-bottom: 1rem;">
                <span style="color: #1e3a8a; font-weight: bold; font-size: 0.9rem;">SUBURBMATES</span>
              </div>
              <h1 style="margin: 0; font-size: 1.5rem; font-weight: 600;">✅ Claim Submitted Successfully</h1>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Your ownership claim for ${data.businessName} is being reviewed</p>
            </div>
            
            <div style="padding: 2rem; background: white;">
              <h2 style="color: #374151; margin: 0 0 1.5rem 0;">What's Next?</h2>
              
              <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 1.5rem; margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 0.5rem 0; color: #0369a1;">Verification Process</h3>
                <p style="margin: 0; color: #0c4a6e;">
                  Our team will verify your ownership of ${data.businessName} using the information you provided.
                  This typically takes 1-2 business days.
                </p>
              </div>

              <div style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 1rem 0; color: #374151;">Claim Details</h3>
                <p style="margin: 0 0 0.5rem 0;"><strong>Business:</strong> ${data.businessName}</p>
                <p style="margin: 0 0 0.5rem 0;"><strong>Verification Method:</strong> ${data.verificationType}</p>
                <p style="margin: 0 0 0.5rem 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
                <p style="margin: 0;"><strong>Claim ID:</strong> ${data.claimId}</p>
              </div>

              <h3 style="color: #374151; margin: 1.5rem 0 1rem 0;">Once Approved</h3>
              <ul style="color: #374151; padding-left: 1.5rem;">
                <li style="margin-bottom: 0.5rem;">Full access to customize your business profile</li>
                <li style="margin-bottom: 0.5rem;">Professional shareable profile with SuburbMates branding</li>
                <li style="margin-bottom: 0.5rem;">Lead management and analytics dashboard</li>
                <li style="margin-bottom: 0.5rem;">Social media optimization tools</li>
              </ul>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 1.5rem; color: #6b7280; font-size: 0.875rem;">
                <p style="margin: 0;">
                  We'll email you as soon as your claim is processed. Questions? 
                  <a href="mailto:support@suburbmates.com.au" style="color: #667eea;">Contact our support team</a>
                </p>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
              <p style="margin: 0;">
                Powered by <a href="https://suburbmates.com.au" style="color: #667eea;">SuburbMates</a>
              </p>
            </div>
          </div>
        `,
      };

    case 'claim-approved':
      return {
        subject: `🎉 Business claim approved - Welcome to SuburbMates, ${data.businessName}!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 2rem; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="display: inline-block; background: white; padding: 8px 16px; border-radius: 20px; margin-bottom: 1rem; position: relative;">
                <span style="color: #059669; font-weight: bold; font-size: 0.9rem;">SUBURBMATES</span>
              </div>
              <h1 style="margin: 0; font-size: 1.75rem; font-weight: 700; position: relative;">🎉 Claim Approved!</h1>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.95; font-size: 1.1rem; position: relative;">Welcome to Melbourne's trusted business directory</p>
            </div>
            
            <div style="padding: 2rem; background: white;">
              <h2 style="color: #374151; margin: 0 0 1.5rem 0;">You now own your business profile!</h2>
              
              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1.5rem; margin-bottom: 1.5rem;">
                <p style="margin: 0; color: #166534;">
                  Congratulations! You can now customize your profile, manage leads, and start attracting more customers.
                </p>
              </div>

              <h3 style="color: #374151; margin: 1.5rem 0 1rem 0;">Get Started</h3>
              <div style="text-align: center; margin: 1.5rem 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/${data.businessSlug}/edit" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 1rem;">
                  Customize Profile
                </a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Dashboard
                </a>
              </div>

              <h3 style="color: #374151; margin: 1.5rem 0 1rem 0;">What You Can Do Now</h3>
              <ul style="color: #374151; padding-left: 1.5rem;">
                <li style="margin-bottom: 0.5rem;">🎨 Customize your profile design and content</li>
                <li style="margin-bottom: 0.5rem;">📱 Generate QR codes and social media content</li>
                <li style="margin-bottom: 0.5rem;">📧 Receive and manage customer inquiries</li>
                <li style="margin-bottom: 0.5rem;">📊 Track profile views and lead conversions</li>
                <li style="margin-bottom: 0.5rem;">🌐 Share your professional SuburbMates profile</li>
              </ul>

              <div style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                <p style="margin: 0; color: #374151; text-align: center;">
                  <strong>Your shareable profile:</strong><br>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/${data.businessSlug}" style="color: #667eea;">
                    suburbmates.com.au/business/${data.businessSlug}
                  </a>
                </p>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
              <p style="margin: 0;">
                Need help getting started? <a href="mailto:support@suburbmates.com.au" style="color: #667eea;">Contact our support team</a>
              </p>
            </div>
          </div>
        `,
      };

    case 'welcome-business':
      return {
        subject: `Welcome to SuburbMates - ${data.businessName} is now live in Melbourne! 🎆`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 2.5rem; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: -40px; right: -40px; width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="position: absolute; bottom: -20px; left: -20px; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
              <div style="display: inline-block; background: white; padding: 8px 16px; border-radius: 20px; margin-bottom: 1rem; position: relative;">
                <span style="color: #1e3a8a; font-weight: bold; font-size: 0.9rem;">SUBURBMATES</span>
              </div>
              <h1 style="margin: 0; font-size: 1.75rem; font-weight: 700; position: relative;">🏢 Welcome to SuburbMates!</h1>
              <p style="margin: 0.5rem 0 0 0; opacity: 0.95; font-size: 1rem; position: relative;">${data.businessName} is now part of Melbourne's premier business directory</p>
            </div>
            
            <div style="padding: 2rem; background: white;">
              <h2 style="color: #374151; margin: 0 0 1.5rem 0;">You're all set up!</h2>
              
              <p style="color: #374151; margin-bottom: 1.5rem;">
                Welcome to the SuburbMates business community! Your profile for <strong>${data.businessName}</strong> 
                is now live and ready to attract customers in Melbourne.
              </p>

              <div style="text-align: center; margin: 2rem 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/${data.businessSlug}" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 1rem;">
                  View Your Profile
                </a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/${data.businessSlug}/edit" 
                   style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Customize Profile
                </a>
              </div>

              <h3 style="color: #374151; margin: 1.5rem 0 1rem 0;">Next Steps</h3>
              <ul style="color: #374151; padding-left: 1.5rem;">
                <li style="margin-bottom: 0.5rem;">Complete your profile customization</li>
                <li style="margin-bottom: 0.5rem;">Add photos and detailed business information</li>
                <li style="margin-bottom: 0.5rem;">Share your profile on social media</li>
                <li style="margin-bottom: 0.5rem;">Generate QR codes for offline marketing</li>
              </ul>

              <div style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                <p style="margin: 0; color: #374151; text-align: center;">
                  <strong>Your shareable profile:</strong><br>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/business/${data.businessSlug}" style="color: #667eea;">
                    suburbmates.com.au/business/${data.businessSlug}
                  </a>
                </p>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 1.5rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
              <p style="margin: 0;">
                Questions? <a href="mailto:support@suburbmates.com.au" style="color: #667eea;">Contact our support team</a>
              </p>
            </div>
          </div>
        `,
      };

    default:
      throw new Error(`Unknown email template: ${template}`);
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const { to, template, data } = EmailSchema.parse(body);

    // Get email template
    const emailTemplate = getEmailTemplate(template, data);

    // Send email via Resend
    const result = await resend.emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
    });

  } catch (error) {
    console.error('Email send error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid email request',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'email',
    provider: 'resend' 
  });
}