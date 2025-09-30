/**
 * Advanced Resend Features Integration
 * Leveraging latest Resend SDK capabilities for SuburbMates
 */

import { Resend } from 'resend';

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

export interface BatchEmailRequest {
  from: string;
  to: string[];
  subject: string;
  html: string;
  tags?: { name: string; value: string }[];
  metadata?: Record<string, string>;
}

export interface Contact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
  audienceId?: string;
}

export interface Audience {
  id?: string;
  name: string;
  description?: string;
}

export interface Broadcast {
  id?: string;
  name: string;
  audienceId: string;
  from: string;
  subject: string;
  html: string;
  scheduledAt?: Date;
}

export class ResendAdvanced {
  private static instance: ResendAdvanced;

  private constructor() {}

  public static getInstance(): ResendAdvanced {
    if (!ResendAdvanced.instance) {
      ResendAdvanced.instance = new ResendAdvanced();
    }
    return ResendAdvanced.instance;
  }

  // =================
  // BATCH OPERATIONS
  // =================

  /**
   * Send multiple emails efficiently using batch operations
   */
  async sendBatchEmails(emails: BatchEmailRequest[]): Promise<{
    successful: number;
    failed: number;
    results: Array<{ success: boolean; id?: string; error?: string }>;
  }> {
    try {
      const batchRequest = emails.map(email => ({
        from: email.from,
        to: email.to,
        subject: email.subject,
        html: email.html,
        tags: email.tags,
        metadata: email.metadata
      }));

      const response = await getResend().batch.send(batchRequest);
      
      if (response.error) {
        throw new Error(response.error.message);
      }

      return {
        successful: response.data?.length || 0,
        failed: 0,
        results: (response.data || []).map((item: any) => ({
          success: true,
          id: item.id
        }))
      };
    } catch (error: any) {
      return {
        successful: 0,
        failed: emails.length,
        results: emails.map(() => ({ success: false, error: error.message }))
      };
    }
  }

  /**
   * Send business notification emails in batch
   */
  async sendBusinessNotificationsBatch(notifications: Array<{
    type: 'welcome' | 'inquiry' | 'claim-approved';
    email: string;
    businessName: string;
    data?: Record<string, any>;
  }>): Promise<{ successful: number; failed: number }> {
    const batchEmails: BatchEmailRequest[] = [];

    for (const notification of notifications) {
      let subject: string;
      let html: string;

      switch (notification.type) {
        case 'welcome':
          subject = `🎉 Welcome to SuburbMates - ${notification.businessName} is Live!`;
          html = this.generateWelcomeEmailHTML(notification.businessName, notification.data);
          break;
        case 'inquiry':
          subject = `🔥 New Customer Inquiry for ${notification.businessName}`;
          html = this.generateInquiryEmailHTML(notification.businessName, notification.data);
          break;
        case 'claim-approved':
          subject = `✅ Claim Approved - You now own ${notification.businessName}`;
          html = this.generateClaimApprovedEmailHTML(notification.businessName, notification.data);
          break;
        default:
          continue;
      }

      batchEmails.push({
        from: 'SuburbMates <noreply@suburbmates.com.au>',
        to: [notification.email],
        subject,
        html,
        tags: [
          { name: 'type', value: notification.type },
          { name: 'business', value: notification.businessName }
        ],
        metadata: {
          business_name: notification.businessName,
          email_type: notification.type,
          sent_at: new Date().toISOString()
        }
      });
    }

    const result = await this.sendBatchEmails(batchEmails);
    return { successful: result.successful, failed: result.failed };
  }

  // =================
  // AUDIENCE MANAGEMENT
  // =================

  /**
   * Create audience for business owners, customers, etc.
   */
  async createAudience(name: string, description?: string): Promise<{ success: boolean; audienceId?: string; error?: string }> {
    try {
      const response = await getResend().audiences.create({
        name,
        description: description || `SuburbMates ${name} audience`
      });

      if (response.error) {
        return { success: false, error: response.error.message };
      }

      return { success: true, audienceId: response.data?.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all audiences
   */
  async getAudiences(): Promise<Audience[]> {
    try {
      const response = await getResend().audiences.list();
      if (response.error) {
        console.error('Failed to fetch audiences:', response.error);
        return [];
      }
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch audiences:', error);
      return [];
    }
  }

  /**
   * Add contact to audience
   */
  async addContact(audienceId: string, contact: Contact): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      const response = await getResend().contacts.create({
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        unsubscribed: contact.unsubscribed || false,
        audienceId
      });

      if (response.error) {
        return { success: false, error: response.error.message };
      }

      return { success: true, contactId: response.data?.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get contacts from audience
   */
  async getContacts(audienceId: string): Promise<Contact[]> {
    try {
      const response = await getResend().contacts.list({ audienceId });
      if (response.error) {
        console.error('Failed to fetch contacts:', response.error);
        return [];
      }
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      return [];
    }
  }

  // =================
  // BROADCAST CAMPAIGNS
  // =================

  /**
   * Create newsletter/marketing broadcast
   */
  async createBroadcast(broadcast: Broadcast): Promise<{ success: boolean; broadcastId?: string; error?: string }> {
    try {
      const response = await getResend().broadcasts.create({
        name: broadcast.name,
        audienceId: broadcast.audienceId,
        from: broadcast.from,
        subject: broadcast.subject,
        html: broadcast.html,
        scheduledAt: broadcast.scheduledAt
      });

      if (response.error) {
        return { success: false, error: response.error.message };
      }

      return { success: true, broadcastId: response.data?.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send broadcast immediately
   */
  async sendBroadcast(broadcastId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await getResend().broadcasts.send(broadcastId);
      
      if (response.error) {
        return { success: false, error: response.error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all broadcasts
   */
  async getBroadcasts(): Promise<Broadcast[]> {
    try {
      const response = await getResend().broadcasts.list();
      if (response.error) {
        console.error('Failed to fetch broadcasts:', response.error);
        return [];
      }
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch broadcasts:', error);
      return [];
    }
  }

  // =================
  // ENHANCED EMAIL OPERATIONS
  // =================

  /**
   * Get email details by ID
   */
  async getEmailDetails(emailId: string): Promise<{
    id: string;
    status: string;
    subject: string;
    to: string[];
    from: string;
    sentAt?: Date;
    openedAt?: Date;
    clickedAt?: Date;
  } | null> {
    try {
      const response = await getResend().emails.get(emailId);
      
      if (response.error) {
        console.error('Failed to fetch email details:', response.error);
        return null;
      }

      const email = response.data;
      return {
        id: email.id,
        status: email.last_event || 'pending',
        subject: email.subject,
        to: Array.isArray(email.to) ? email.to : [email.to],
        from: email.from,
        sentAt: email.created_at ? new Date(email.created_at) : undefined,
        openedAt: email.opened_at ? new Date(email.opened_at) : undefined,
        clickedAt: email.clicked_at ? new Date(email.clicked_at) : undefined
      };
    } catch (error) {
      console.error('Failed to fetch email details:', error);
      return null;
    }
  }

  /**
   * Cancel scheduled email
   */
  async cancelEmail(emailId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await getResend().emails.cancel(emailId);
      
      if (response.error) {
        return { success: false, error: response.error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =================
  // API KEY MANAGEMENT
  // =================

  /**
   * Create new API key (admin function)
   */
  async createApiKey(name: string, permission: 'full_access' | 'sending_access'): Promise<{ success: boolean; key?: string; error?: string }> {
    try {
      const response = await getResend().apiKeys.create({
        name,
        permission
      });

      if (response.error) {
        return { success: false, error: response.error.message };
      }

      return { success: true, key: response.data?.token };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all API keys
   */
  async listApiKeys(): Promise<Array<{ id: string; name: string; created_at: Date }>> {
    try {
      const response = await getResend().apiKeys.list();
      if (response.error) {
        console.error('Failed to fetch API keys:', response.error);
        return [];
      }
      return (response.data?.data || response.data || []).map((key: any) => ({
        id: key.id,
        name: key.name,
        created_at: new Date(key.created_at)
      }));
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      return [];
    }
  }

  // =================
  // SUBURBMATES-SPECIFIC FEATURES
  // =================

  /**
   * Setup SuburbMates email audiences
   */
  async setupSuburbMatesAudiences(): Promise<{
    businessOwnersId?: string;
    customersId?: string;
    marketingId?: string;
    errors: string[];
  }> {
    const result = {
      businessOwnersId: undefined as string | undefined,
      customersId: undefined as string | undefined,
      marketingId: undefined as string | undefined,
      errors: [] as string[]
    };

    // Create business owners audience
    const businessOwners = await this.createAudience(
      'Business Owners',
      'SuburbMates business owners and claimants'
    );
    if (businessOwners.success) {
      result.businessOwnersId = businessOwners.audienceId;
    } else {
      result.errors.push(`Failed to create business owners audience: ${businessOwners.error}`);
    }

    // Create customers audience
    const customers = await this.createAudience(
      'Customers',
      'SuburbMates customers and inquirers'
    );
    if (customers.success) {
      result.customersId = customers.audienceId;
    } else {
      result.errors.push(`Failed to create customers audience: ${customers.error}`);
    }

    // Create marketing audience
    const marketing = await this.createAudience(
      'Marketing Newsletter',
      'SuburbMates newsletter subscribers'
    );
    if (marketing.success) {
      result.marketingId = marketing.audienceId;
    } else {
      result.errors.push(`Failed to create marketing audience: ${marketing.error}`);
    }

    return result;
  }

  /**
   * Send weekly business digest to owners
   */
  async sendWeeklyBusinessDigest(businessData: Array<{
    email: string;
    businessName: string;
    inquiries: number;
    views: number;
    newReviews: number;
  }>): Promise<{ successful: number; failed: number }> {
    const notifications = businessData.map(business => ({
      type: 'weekly-digest' as const,
      email: business.email,
      businessName: business.businessName,
      data: {
        inquiries: business.inquiries,
        views: business.views,
        newReviews: business.newReviews,
        weekOf: new Date().toLocaleDateString()
      }
    }));

    // Use batch sending for efficiency
    const batchEmails: BatchEmailRequest[] = notifications.map(notification => ({
      from: 'SuburbMates <digest@suburbmates.com.au>',
      to: [notification.email],
      subject: `📊 Weekly Digest - ${notification.businessName} Performance`,
      html: this.generateWeeklyDigestHTML(notification.businessName, notification.data),
      tags: [
        { name: 'type', value: 'weekly-digest' },
        { name: 'business', value: notification.businessName }
      ],
      metadata: {
        business_name: notification.businessName,
        email_type: 'weekly-digest',
        week_of: notification.data.weekOf
      }
    }));

    const result = await this.sendBatchEmails(batchEmails);
    return { successful: result.successful, failed: result.failed };
  }

  // =================
  // TEMPLATE GENERATORS
  // =================

  private generateWelcomeEmailHTML(businessName: string, data?: Record<string, any>): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to SuburbMates! 🎉</h1>
        <p>Congratulations! <strong>${businessName}</strong> is now live on SuburbMates.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's next:</h3>
          <ul>
            <li>Complete your business profile</li>
            <li>Start receiving customer inquiries</li>
            <li>Share your profile link</li>
          </ul>
        </div>
        <a href="https://suburbmates.com.au/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Dashboard</a>
      </div>
    `;
  }

  private generateInquiryEmailHTML(businessName: string, data?: Record<string, any>): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #dc2626;">🔥 New Customer Inquiry!</h1>
        <p>Someone is interested in <strong>${businessName}</strong>!</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Customer Details:</h3>
          <p><strong>Name:</strong> ${data?.customerName || 'Customer'}</p>
          <p><strong>Email:</strong> ${data?.customerEmail || 'Not provided'}</p>
          <p><strong>Message:</strong> ${data?.message || 'No message provided'}</p>
        </div>
        <a href="mailto:${data?.customerEmail}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reply to Customer</a>
      </div>
    `;
  }

  private generateClaimApprovedEmailHTML(businessName: string, data?: Record<string, any>): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #059669;">✅ Claim Approved!</h1>
        <p>Congratulations! Your claim for <strong>${businessName}</strong> has been approved.</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>You can now:</h3>
          <ul>
            <li>Manage your business profile</li>
            <li>Respond to customer inquiries</li>
            <li>Update business information</li>
          </ul>
        </div>
        <a href="https://suburbmates.com.au/dashboard" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Manage Business</a>
      </div>
    `;
  }

  private generateWeeklyDigestHTML(businessName: string, data: Record<string, any>): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">📊 Weekly Performance Digest</h1>
        <h2>${businessName}</h2>
        <p>Here's how your business performed this week (${data.weekOf}):</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0;">
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #2563eb; font-size: 24px;">${data.inquiries}</h3>
            <p style="margin: 5px 0; color: #64748b;">New Inquiries</p>
          </div>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #059669; font-size: 24px;">${data.views}</h3>
            <p style="margin: 5px 0; color: #64748b;">Profile Views</p>
          </div>
          <div style="background: #fffbeb; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #d97706; font-size: 24px;">${data.newReviews}</h3>
            <p style="margin: 5px 0; color: #64748b;">New Reviews</p>
          </div>
        </div>
        
        <a href="https://suburbmates.com.au/dashboard/analytics" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Full Analytics</a>
      </div>
    `;
  }
}

// Export singleton instance
export const resendAdvanced = ResendAdvanced.getInstance();

// Helper functions
export async function sendBulkBusinessNotifications(notifications: Array<{
  type: 'welcome' | 'inquiry' | 'claim-approved';
  email: string;
  businessName: string;
  data?: Record<string, any>;
}>) {
  return resendAdvanced.sendBusinessNotificationsBatch(notifications);
}

export async function createBusinessOwnersAudience() {
  return resendAdvanced.createAudience('Business Owners', 'SuburbMates business owners');
}

export async function setupEmailAudiences() {
  return resendAdvanced.setupSuburbMatesAudiences();
}

export default resendAdvanced;