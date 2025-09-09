import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to NEXUS',
    template: (name: string) => `
      <h1>Welcome to NEXUS, ${name}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board.</p>
      <p>Get started by exploring our features and setting up your profile.</p>
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
    const { data, error } = await resend.emails.send({
      from: 'NEXUS <noreply@yourdomain.com>',
      to: [to],
      subject: emailTemplates.welcome.subject,
      html: emailTemplates.welcome.template(name),
    })

    if (error) {
      console.error('Error sending welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

export async function sendContactFormEmail(
  adminEmail: string,
  formData: { name: string; email: string; subject: string; message: string; company?: string }
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'NEXUS Contact Form <noreply@yourdomain.com>',
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
    const { data, error } = await resend.emails.send({
      from: 'NEXUS Leads <noreply@yourdomain.com>',
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
    const { data, error } = await resend.emails.send({
      from: 'NEXUS Security <noreply@yourdomain.com>',
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