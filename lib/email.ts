import { Resend } from 'resend'

// Lazy-loaded Resend instance
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const fromEmail = process.env.AUTH_EMAIL_FROM || 'SuburbMates <noreply@suburbmates.com.au>'
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au'

// SuburbMates Email templates
export const emailTemplates = {
  // Business owner notifications
  newInquiry: {
    subject: (businessName: string) => `🔥 New Customer Inquiry for ${businessName}`,
    template: (data: { 
      businessName: string;
      customerName: string; 
      customerEmail: string;
      customerPhone?: string;
      message: string;
      inquiryId: string;
    }) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0A2540 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔥 New Customer Inquiry!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone is interested in ${data.businessName}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 20px;">Customer Details</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${data.customerName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
            ${data.customerPhone ? `<p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
          </div>
          
          <h3 style="color: #0A2540; font-size: 18px; margin-bottom: 15px;">Their Message:</h3>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; border-left: 4px solid #2563eb;">
            <p style="margin: 0; line-height: 1.6;">${data.message}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${data.customerEmail}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reply to Customer</a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <a href="${baseUrl}/dashboard/leads" style="color: #2563eb; text-decoration: none;">View All Leads →</a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px;">
          This inquiry was generated through your SuburbMates business profile<br>
          <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">SuburbMates.com.au</a>
        </div>
      </div>
    `
  },

  // Business registration welcome
  businessWelcome: {
    subject: '🎉 Welcome to SuburbMates - Your Business Profile is Live!',
    template: (data: {
      businessName: string;
      businessSlug: string;
      ownerName?: string;
    }) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0A2540 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to SuburbMates!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.businessName} is now live</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 20px;">🚀 Your Profile is Live!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Congratulations! Your business profile for <strong>${data.businessName}</strong> is now live on SuburbMates and ready to connect with Melbourne customers.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/business/${data.businessSlug}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 15px;">View Your Profile</a><br>
            <a href="${baseUrl}/dashboard" style="color: #2563eb; text-decoration: none;">Manage Your Business →</a>
          </div>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #0A2540; font-size: 16px; margin-bottom: 15px;">📈 Next Steps:</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Complete your business profile with photos and details</li>
              <li>Share your profile link on social media</li>
              <li>Start receiving customer inquiries</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px;">
          Melbourne's premier business directory<br>
          <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">SuburbMates.com.au</a>
        </div>
      </div>
    `
  },

  // Business claim notifications
  claimApproved: {
    subject: (businessName: string) => `✅ Claim Approved - You now own ${businessName} on SuburbMates`,
    template: (data: {
      businessName: string;
      businessSlug: string;
      claimantName?: string;
    }) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Claim Approved!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You now own ${data.businessName} on SuburbMates</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #059669; font-size: 20px; margin-bottom: 20px;">🎉 Congratulations!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Your ownership claim for <strong>${data.businessName}</strong> has been approved! You now have full control over your business profile.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/business/${data.businessSlug}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 15px;">View Your Profile</a><br>
            <a href="${baseUrl}/dashboard" style="color: #059669; text-decoration: none;">Manage Your Business →</a>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #059669; font-size: 16px; margin-bottom: 15px;">What you can do now:</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Customize your business profile</li>
              <li>Add photos and detailed descriptions</li>
              <li>Respond to customer inquiries</li>
              <li>Share your profile to attract more customers</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px;">
          Questions? Contact our support team<br>
          <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">SuburbMates.com.au</a>
        </div>
      </div>
    `
  },

  claimRejected: {
    subject: (businessName: string) => `❌ Claim Update - ${businessName} Verification`,
    template: (data: {
      businessName: string;
      reason?: string;
      claimantName?: string;
    }) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Claim Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Regarding ${data.businessName}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #dc2626; font-size: 20px; margin-bottom: 20px;">Additional Verification Needed</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We were unable to approve your ownership claim for <strong>${data.businessName}</strong> at this time. 
          </p>
          
          ${data.reason ? `
            <div style="background: #fef2f2; padding: 20px; border-radius: 6px; border-left: 4px solid #dc2626; margin-bottom: 25px;">
              <h3 style="color: #dc2626; font-size: 16px; margin-bottom: 10px;">Reason:</h3>
              <p style="margin: 0; line-height: 1.6;">${data.reason}</p>
            </div>
          ` : ''}
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #0A2540; font-size: 16px; margin-bottom: 15px;">What you can do:</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Contact our support team for assistance</li>
              <li>Provide additional verification documents</li>
              <li>Submit a new claim with more information</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:support@suburbmates.com.au" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Contact Support</a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px;">
          We're here to help - contact support for assistance<br>
          <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">SuburbMates.com.au</a>
        </div>
      </div>
    `
  },

  claimSubmitted: {
    subject: (businessName: string) => `🔔 Claim Submitted - ${businessName} on SuburbMates`,
    template: (data: {
      businessName: string;
      claimId: string;
      claimantName?: string;
    }) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔔 Claim Submitted</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">For ${data.businessName}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #2563eb; font-size: 20px; margin-bottom: 20px;">Thank You for Your Claim</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We've received your ownership claim for <strong>${data.businessName}</strong>. Our team will review your claim shortly.
          </p>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #2563eb; font-size: 16px; margin-bottom: 15px;">What happens next:</h3>
            <ol style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Our verification team will review your claim</li>
              <li>You may be contacted for additional information</li>
              <li>You'll receive an email with the final decision</li>
              <li>If approved, you'll gain full access to manage your business profile</li>
            </ol>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">
            <strong>Claim Reference:</strong> ${data.claimId}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard/claims" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Claim</a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px;">
          Need help? Contact our verification team<br>
          <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">SuburbMates.com.au</a>
        </div>
      </div>
    `
  },

  claimVerificationNeeded: {
    subject: (businessName: string) => `📋 Additional Verification Needed - ${businessName} Claim`,
    template: (data: {
      businessName: string;
      claimId: string;
      verificationItems?: string[];
      claimantName?: string;
    }) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📋 Additional Verification Needed</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">For your ${data.businessName} claim</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #f59e0b; font-size: 20px; margin-bottom: 20px;">We Need More Information</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We're reviewing your claim for <strong>${data.businessName}</strong>, but we need additional verification to proceed.
          </p>
          
          ${data.verificationItems && data.verificationItems.length > 0 ? `
            <div style="background: #fffbeb; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
              <h3 style="color: #f59e0b; font-size: 16px; margin-bottom: 15px;">Please provide the following:</h3>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                ${data.verificationItems.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6; margin-top: 25px;">
            <strong>Claim Reference:</strong> ${data.claimId}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/dashboard/claims/${data.claimId}/verify" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Provide Verification</a>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin-top: 25px;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>Note:</strong> Please respond within 14 days to keep your claim active.
            </p>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px;">
          Questions? Contact our verification team<br>
          <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">SuburbMates.com.au</a>
        </div>
      </div>
    `
  },

  // Business approval workflow emails
  businessApproved: {
    subject: (businessName: string) => `✅ Business Approved - ${businessName} is now live on SuburbMates`,
    template: (data: {
      businessName: string;
      ownerName: string;
      profileUrl: string;
    }) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">✅ Business Approved!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.businessName} is now live</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${data.ownerName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Great news! Your business profile for <strong>${data.businessName}</strong> has been approved and is now live on SuburbMates.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.profileUrl}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-bottom: 15px;">View Your Live Profile</a><br>
            <a href="${baseUrl}/dashboard" style="color: #059669; text-decoration: none;">Manage Your Business →</a>
          </div>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #059669; font-size: 16px; margin-bottom: 15px;">🚀 What's Next:</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Start receiving customer inquiries</li>
              <li>Share your profile on social media</li>
              <li>Complete your profile with photos and additional details</li>
              <li>Monitor your profile analytics</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px;">
          Questions? Contact our support team<br>
          <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">SuburbMates.com.au</a>
        </div>
      </div>
    `
  },

  businessRejected: {
    subject: (businessName: string) => `📋 Business Review Required - ${businessName}`,
    template: (data: {
      businessName: string;
      ownerName: string;
      reason: string;
      appealUrl: string;
    }) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📋 Review Required</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">For ${data.businessName}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${data.ownerName},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Thank you for submitting your business profile for <strong>${data.businessName}</strong>. We need to review some details before we can make your profile live.
          </p>
          
          <div style="background: #fffbeb; padding: 20px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
            <h3 style="color: #f59e0b; font-size: 16px; margin-bottom: 10px;">Review Required:</h3>
            <p style="margin: 0; line-height: 1.6;">${data.reason}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 25px 0;">
            <h3 style="color: #0A2540; font-size: 16px; margin-bottom: 15px;">What you can do:</h3>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Contact our support team for clarification</li>
              <li>Update your business information</li>
              <li>Provide additional verification if needed</li>
              <li>Submit an appeal if you believe this was an error</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:support@suburbmates.com.au" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">Contact Support</a>
            <a href="${data.appealUrl}" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Submit Appeal</a>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px;">
          We're here to help - contact support for assistance<br>
          <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">SuburbMates.com.au</a>
        </div>
      </div>
    `
  },
  
  contactForm: {
    subject: 'New Contact Form Submission',
    template: (data: { name: string; email: string; subject: string; message: string; company?: string }) => `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Company:</strong> ${data.company || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
    `
  },
  
  leadNotification: {
    subject: 'New Lead Generated',
    template: (lead: { firstName: string; lastName: string; email: string; company: string; source: string }) => `
      <h2>New Lead Generated</h2>
      <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Company:</strong> ${lead.company}</p>
      <p><strong>Source:</strong> ${lead.source}</p>
      <p>Please follow up with this lead as soon as possible.</p>
    `
  },
  
  passwordReset: {
    subject: 'Reset Your Password',
    template: (resetLink: string) => `
      <h1>Reset Your Password</h1>
      <p>You requested to reset your password. Click the link below to create a new password:</p>
      <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  }
}

// Email sending functions
export async function sendInquiryNotificationEmail(
  businessOwnerEmail: string,
  data: {
    customerName: string;
    customerEmail: string;
    message: string;
    businessName: string;
    inquiryId: string;
  }
): Promise<void> {
  try {
    await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: businessOwnerEmail,
subject: emailTemplates.newInquiry.subject(data.businessName),
html: emailTemplates.newInquiry.template(data),
      replyTo: data.customerEmail,
    });
    
    console.log(`Inquiry notification sent to ${businessOwnerEmail} for ${data.businessName}`);
  } catch (error) {
    console.error('Failed to send inquiry notification email:', error);
    throw error;
  }
}

export async function sendBusinessRegistrationEmail(
  email: string,
  data: {
    ownerName: string;
    businessName: string;
    profileUrl: string;
    approvalStatus?: string;
    requiresReview?: boolean;
    abnVerified?: boolean;
  }
): Promise<void> {
  try {
    // Choose email template based on approval status
    let subject: string;
    let template: string;
    
    if (data.approvalStatus === 'APPROVED') {
      subject = emailTemplates.businessWelcome.subject;
      template = emailTemplates.businessWelcome.template({
        businessName: data.businessName,
        businessSlug: data.profileUrl.split('/').pop() || '',
        ownerName: data.ownerName,
      });
    } else if (data.approvalStatus === 'PENDING' && data.requiresReview) {
      subject = `🔔 Business Profile Submitted - ${data.businessName} Under Review`;
      template = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Profile Under Review</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.businessName}</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi ${data.ownerName},
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Thank you for submitting your business profile for <strong>${data.businessName}</strong>! Your profile is currently under review by our team.
            </p>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="color: #2563eb; font-size: 16px; margin-bottom: 15px;">What happens next:</h3>
              <ol style="margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Our team will review your business profile</li>
                <li>We'll verify your business information${data.abnVerified ? ' (ABN already verified ✓)' : ''}</li>
                <li>You'll receive an email once your profile is approved</li>
                <li>Your profile will go live and start attracting customers</li>
              </ol>
            </div>
            
            <p style="font-size: 14px; color: #64748b; text-align: center;">
              This usually takes 1-2 business days
            </p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-radius: 0 0 8px 8px;">
            Questions? Contact our support team<br>
            <a href="${baseUrl}" style="color: #2563eb; text-decoration: none;">SuburbMates.com.au</a>
          </div>
        </div>
      `;
    } else {
      // Fallback to welcome template for auto-approved
      subject = emailTemplates.businessWelcome.subject;
      template = emailTemplates.businessWelcome.template({
        businessName: data.businessName,
        businessSlug: data.profileUrl.split('/').pop() || '',
        ownerName: data.ownerName,
      });
    }

    await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: email,
      subject: subject,
      html: template,
    });
    
    console.log(`Business registration email sent to ${email} for ${data.businessName} (Status: ${data.approvalStatus})`);
  } catch (error) {
    console.error('Failed to send business registration email:', error);
    throw error;
  }
}

// Claim notification functions
export async function sendClaimApprovedEmail(
  email: string,
  data: {
    businessName: string;
    businessSlug: string;
    claimantName?: string;
  }
): Promise<void> {
  try {
    await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: email,
subject: emailTemplates.claimApproved.subject(data.businessName),
html: emailTemplates.claimApproved.template(data),
    });
    
    console.log(`Claim approved email sent to ${email} for ${data.businessName}`);
  } catch (error) {
    console.error('Failed to send claim approved email:', error);
    throw error;
  }
}

export async function sendClaimRejectedEmail(
  email: string,
  data: {
    businessName: string;
    reason?: string;
    claimantName?: string;
  }
): Promise<void> {
  try {
    await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: email,
subject: emailTemplates.claimRejected.subject(data.businessName),
html: emailTemplates.claimRejected.template(data),
    });
    
    console.log(`Claim rejected email sent to ${email} for ${data.businessName}`);
  } catch (error) {
    console.error('Failed to send claim rejected email:', error);
    throw error;
  }
}

export async function sendClaimSubmittedEmail(
  email: string,
  data: {
    businessName: string;
    claimId: string;
    claimantName?: string;
  }
): Promise<void> {
  try {
    await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: email,
subject: emailTemplates.claimSubmitted.subject(data.businessName),
html: emailTemplates.claimSubmitted.template(data),
    });
    
    console.log(`Claim submitted email sent to ${email} for ${data.businessName}`);
  } catch (error) {
    console.error('Failed to send claim submitted email:', error);
    throw error;
  }
}

export async function sendClaimVerificationNeededEmail(
  email: string,
  data: {
    businessName: string;
    claimId: string;
    verificationItems?: string[];
    claimantName?: string;
  }
): Promise<void> {
  try {
    await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: email,
      subject: emailTemplates.claimVerificationNeeded.subject(data.businessName),
      html: emailTemplates.claimVerificationNeeded.template(data),
    });
    
    console.log(`Claim verification needed email sent to ${email} for ${data.businessName}`);
  } catch (error) {
    console.error('Failed to send claim verification needed email:', error);
    throw error;
  }
}

// Business approval workflow email functions
export async function sendBusinessApprovalEmail(
  email: string,
  data: {
    businessName: string;
    ownerName: string;
    profileUrl: string;
  }
): Promise<void> {
  try {
    await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: email,
      subject: emailTemplates.businessApproved.subject(data.businessName),
      html: emailTemplates.businessApproved.template(data),
    });
    
    console.log(`Business approval email sent to ${email} for ${data.businessName}`);
  } catch (error) {
    console.error('Failed to send business approval email:', error);
    throw error;
  }
}

export async function sendBusinessRejectionEmail(
  email: string,
  data: {
    businessName: string;
    ownerName: string;
    reason: string;
    appealUrl: string;
  }
): Promise<void> {
  try {
    await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: email,
      subject: emailTemplates.businessRejected.subject(data.businessName),
      html: emailTemplates.businessRejected.template(data),
    });
    
    console.log(`Business rejection email sent to ${email} for ${data.businessName}`);
  } catch (error) {
    console.error('Failed to send business rejection email:', error);
    throw error;
  }
}
