/**
 * SuburbMates Email Manager
 * Unified interface for email operations from WARP IDE
 */

import { Resend } from 'resend';
import { 
  sendInquiryNotificationEmail,
  sendBusinessRegistrationEmail, 
  sendClaimApprovedEmail,
  sendClaimRejectedEmail,
  sendClaimSubmittedEmail,
  sendClaimVerificationNeededEmail,
  emailTemplates 
} from './email';
import { sendWelcomeEmail, sendEmailConfirmation } from './config/email';

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

const DOMAIN = 'suburbmates.com.au';

export interface EmailSystemStatus {
  resendConnected: boolean;
  domainVerified: boolean;
  templatesLoaded: boolean;
  envConfigured: boolean;
  errors: string[];
}

export interface EmailAnalytics {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  bounceRate: number;
  recentEmails: EmailActivity[];
}

export interface EmailActivity {
  id: string;
  to: string;
  subject: string;
  status: 'delivered' | 'bounced' | 'opened' | 'clicked' | 'pending';
  sentAt: Date;
}

export class EmailManager {
  private static instance: EmailManager;

  private constructor() {}

  public static getInstance(): EmailManager {
    if (!EmailManager.instance) {
      EmailManager.instance = new EmailManager();
    }
    return EmailManager.instance;
  }

  /**
   * Get comprehensive email system status
   */
  async getSystemStatus(): Promise<EmailSystemStatus> {
    const status: EmailSystemStatus = {
      resendConnected: false,
      domainVerified: false,
      templatesLoaded: false,
      envConfigured: false,
      errors: []
    };

    // Check environment configuration
    const requiredEnvVars = ['RESEND_API_KEY', 'AUTH_EMAIL_FROM', 'NEXT_PUBLIC_APP_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      status.envConfigured = true;
    } else {
      status.errors.push(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // Test Resend connection
    try {
      const domains = await getResend().domains.list();
      status.resendConnected = true;

      // Check domain verification
      const domainList = domains.data?.data || domains.data || domains;
      if (Array.isArray(domainList)) {
        const ourDomain = domainList.find((d: any) => d.name === DOMAIN);
        if (ourDomain?.status === 'verified') {
          status.domainVerified = true;
        } else {
          status.errors.push(`Domain ${DOMAIN} not verified in Resend`);
        }
      }
    } catch (error) {
      status.errors.push(`Resend API connection failed: ${error.message}`);
    }

    // Check templates
    try {
      const templateCount = Object.keys(emailTemplates).length;
      if (templateCount > 0) {
        status.templatesLoaded = true;
      }
    } catch (error) {
      status.errors.push(`Email templates failed to load: ${error.message}`);
    }

    return status;
  }

  /**
   * Send test email with customizable template
   */
  async sendTestEmail(
    to: string, 
    template: 'basic' | 'welcome' | 'inquiry' = 'basic',
    customData?: Record<string, any>
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      const templates = {
        basic: {
          subject: '🧪 SuburbMates Test Email',
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">Email System Test ✅</h1>
              <p>Your SuburbMates email system is working correctly!</p>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0369a1;">System Status:</h3>
                <ul style="color: #0369a1;">
                  <li>✅ Resend API connected</li>
                  <li>✅ Domain: ${DOMAIN}</li>
                  <li>✅ Templates loaded</li>
                  <li>✅ Email delivery working</li>
                </ul>
              </div>
              <p style="color: #64748b; font-size: 14px;">
                Test sent: ${new Date().toLocaleString()}
                ${customData ? `<br>Custom data: ${JSON.stringify(customData)}` : ''}
              </p>
            </div>
          `
        },
        welcome: () => sendWelcomeEmail(to, customData?.businessName || 'Test Business'),
        inquiry: () => sendInquiryNotificationEmail(to, {
          customerName: 'Test Customer',
          customerEmail: 'customer@test.com',
          message: 'This is a test inquiry to verify email functionality.',
          businessName: customData?.businessName || 'Test Business',
          inquiryId: 'TEST-' + Date.now()
        })
      };

      if (template === 'welcome' || template === 'inquiry') {
        const result = await templates[template]();
        return { success: result.success || true, emailId: result.data?.id };
      }

      const { data, error } = await getResend().emails.send({
        from: `SuburbMates <noreply@${DOMAIN}>`,
        to: [to],
        subject: templates.basic.subject,
        html: templates.basic.html
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, emailId: data.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send business notification emails
   */
  async sendBusinessEmail(
    type: 'welcome' | 'inquiry' | 'claim-approved' | 'claim-rejected' | 'claim-submitted',
    recipient: string,
    data: Record<string, any>
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      switch (type) {
        case 'welcome':
          await sendBusinessRegistrationEmail(recipient, data);
          break;
        case 'inquiry':
          await sendInquiryNotificationEmail(recipient, data);
          break;
        case 'claim-approved':
          await sendClaimApprovedEmail(recipient, data);
          break;
        case 'claim-rejected':
          await sendClaimRejectedEmail(recipient, data);
          break;
        case 'claim-submitted':
          await sendClaimSubmittedEmail(recipient, data);
          break;
        default:
          throw new Error(`Unknown email type: ${type}`);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email analytics (if available)
   */
  async getEmailAnalytics(limit = 50): Promise<EmailAnalytics | null> {
    try {
      let response;
      try {
        response = await getResend().emails.list({ limit });
      } catch {
        // Fallback to direct API call
        const apiResponse = await fetch('https://api.resend.com/emails', {
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        response = await apiResponse.json();
      }

      const emails = response.data?.data || response.data || response;
      if (!Array.isArray(emails)) {
        return null;
      }

      const totalSent = emails.length;
      const delivered = emails.filter(e => e.last_event === 'delivered').length;
      const opened = emails.filter(e => e.last_event === 'opened').length;
      const bounced = emails.filter(e => e.last_event === 'bounced').length;

      const recentEmails: EmailActivity[] = emails.slice(0, limit).map(email => ({
        id: email.id,
        to: Array.isArray(email.to) ? email.to[0] : email.to,
        subject: email.subject || 'No subject',
        status: email.last_event || 'pending',
        sentAt: new Date(email.created_at)
      }));

      return {
        totalSent,
        deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
        openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
        bounceRate: totalSent > 0 ? (bounced / totalSent) * 100 : 0,
        recentEmails
      };
    } catch (error) {
      console.error('Failed to fetch email analytics:', error);
      return null;
    }
  }

  /**
   * Send bulk emails from array data
   */
  async sendBulkEmails(
    emailRequests: Array<{
      type: string;
      recipient: string;
      data: Record<string, any>;
    }>,
    delayMs = 1000
  ): Promise<{ 
    successful: number; 
    failed: number; 
    results: Array<{ success: boolean; error?: string }> 
  }> {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const request of emailRequests) {
      try {
        const result = await this.sendBusinessEmail(
          request.type as any, 
          request.recipient, 
          request.data
        );
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
        
        results.push(result);
        
        // Delay between emails to avoid rate limiting
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        failed++;
        results.push({ success: false, error: error.message });
      }
    }

    return { successful, failed, results };
  }

  /**
   * Get available email templates
   */
  getAvailableTemplates(): Record<string, { subject: string; description: string }> {
    return {
      newInquiry: {
        subject: 'New Customer Inquiry',
        description: 'Notify business owners of customer inquiries'
      },
      businessWelcome: {
        subject: 'Welcome to SuburbMates',
        description: 'Welcome new business registrations'
      },
      claimApproved: {
        subject: 'Claim Approved',
        description: 'Notify users their business claim was approved'
      },
      claimRejected: {
        subject: 'Claim Needs Review',
        description: 'Notify users their claim needs additional verification'
      },
      claimSubmitted: {
        subject: 'Claim Submitted',
        description: 'Confirm claim submission received'
      },
      claimVerificationNeeded: {
        subject: 'Additional Verification Required',
        description: 'Request additional documentation for claims'
      }
    };
  }

  /**
   * Validate email addresses
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check domain verification status
   */
  async checkDomainStatus(): Promise<{
    domain: string;
    verified: boolean;
    status: string;
    records?: Array<{ type: string; name: string; value: string }>;
  } | null> {
    try {
      const response = await getResend().domains.list();
      const domains = response.data?.data || response.data || response;
      
      if (!Array.isArray(domains)) {
        return null;
      }

      const ourDomain = domains.find((d: any) => d.name === DOMAIN);
      if (!ourDomain) {
        return null;
      }

      return {
        domain: ourDomain.name,
        verified: ourDomain.status === 'verified',
        status: ourDomain.status,
        records: ourDomain.records?.map((r: any) => ({
          type: r.record,
          name: r.name,
          value: r.value
        }))
      };
    } catch (error) {
      console.error('Failed to check domain status:', error);
      return null;
    }
  }
}

// Export singleton instance
export const emailManager = EmailManager.getInstance();

// Helper functions for direct use
export async function quickSendTest(email: string, template?: 'basic' | 'welcome' | 'inquiry') {
  return emailManager.sendTestEmail(email, template);
}

export async function quickSystemCheck() {
  return emailManager.getSystemStatus();
}

export async function quickAnalytics() {
  return emailManager.getEmailAnalytics();
}

export default emailManager;