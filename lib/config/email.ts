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

// Email templates for SuburbMates
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to SuburbMates! 🏠',
    template: (name: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Welcome to SuburbMates! 🏠</h1>
          <p style="color: #64748b; font-size: 16px;">Connecting Melbourne businesses with local residents</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 15px;">Hi ${name}!</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 15px;">
            Thank you for joining SuburbMates! We're excited to help you connect with local Melbourne businesses and residents.
          </p>
          <p style="color: #475569; line-height: 1.6;">
            Your business profile is now being reviewed by our team. You'll receive an email confirmation once it's approved and live on our platform.
          </p>
        </div>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://suburbmates.com.au/dashboard/profile" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Complete Your Profile</a>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            Need help? Contact us at <a href="mailto:support@suburbmates.com.au" style="color: #2563eb;">support@suburbmates.com.au</a>
          </p>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 15px;">
            SuburbMates - Your local business directory for Melbourne
          </p>
        </div>
      </div>
    `
  },
  
  emailConfirmation: {
    subject: 'Confirm Your SuburbMates Account 📧',
    template: (confirmationLink: string, businessName?: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">Confirm Your Account 📧</h1>
          <p style="color: #64748b; font-size: 16px;">SuburbMates - Melbourne's Local Business Directory</p>
        </div>
        
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #0c4a6e; font-size: 20px; margin-bottom: 15px;">Almost there!</h2>
          <p style="color: #0369a1; line-height: 1.6; margin-bottom: 15px;">
            ${businessName ? `Welcome to SuburbMates, ${businessName}!` : 'Welcome to SuburbMates!'} 
            Please confirm your email address to complete your registration.
          </p>
          <p style="color: #0369a1; line-height: 1.6;">
            Click the button below to verify your email and activate your account:
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationLink}" style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">Confirm Email Address</a>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <p style="color: #92400e; font-size: 14px; margin: 0;">
            <strong>⏰ Important:</strong> This confirmation link will expire in 24 hours. If you don't confirm within this time, you'll need to sign up again.
          </p>
        </div>
        
        <div style="margin: 25px 0;">
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="background: #f1f5f9; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #64748b;">
            ${confirmationLink}
          </p>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            Didn't sign up for SuburbMates? You can safely ignore this email.
          </p>
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            Need help? Contact us at <a href="mailto:support@suburbmates.com.au" style="color: #2563eb;">support@suburbmates.com.au</a>
          </p>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 15px;">
            SuburbMates - Connecting Melbourne businesses with local residents
          </p>
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
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const { data, error } = await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: [to],
      subject: emailTemplates.welcome.subject,
      html: emailTemplates.welcome.template(name),
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }

    console.log('Welcome email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

export async function sendEmailConfirmation(to: string, confirmationLink: string, businessName?: string) {
  try {
    const { data, error } = await getResend().emails.send({
      from: 'SuburbMates <noreply@suburbmates.com.au>',
      to: [to],
      subject: emailTemplates.emailConfirmation.subject,
      html: emailTemplates.emailConfirmation.template(confirmationLink, businessName),
    })

    if (error) {
      console.error('Error sending email confirmation:', error)
      return { success: false, error }
    }

    console.log('Email confirmation sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending email confirmation:', error)
    return { success: false, error }
  }
}

export async function sendContactFormEmail(
  adminEmail: string,
  formData: { name: string; email: string; subject: string; message: string; company?: string }
) {
  try {
    const { data, error } = await getResend().emails.send({
      from: 'SuburbMates Contact Form <noreply@suburbmates.com.au>',
      to: [adminEmail],
      subject: emailTemplates.contactForm.subject,
      html: emailTemplates.contactForm.template(formData),
      replyTo: formData.email,
    })

    if (error) {
      console.error('Error sending contact form email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending contact form email:', error)
    return { success: false, error }
  }
}

export async function sendLeadNotificationEmail(
  adminEmail: string,
  leadData: { firstName: string; lastName: string; email: string; company: string; source: string }
) {
  try {
    const { data, error } = await getResend().emails.send({
      from: 'SuburbMates Leads <noreply@suburbmates.com.au>',
      to: [adminEmail],
      subject: emailTemplates.leadNotification.subject,
      html: emailTemplates.leadNotification.template(leadData),
    })

    if (error) {
      console.error('Error sending lead notification email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending lead notification email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  try {
    const { data, error } = await getResend().emails.send({
      from: 'SuburbMates Security <noreply@suburbmates.com.au>',
      to: [to],
      subject: emailTemplates.passwordReset.subject,
      html: emailTemplates.passwordReset.template(resetLink),
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}