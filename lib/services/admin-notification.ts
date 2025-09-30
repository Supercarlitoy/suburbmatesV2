import { Resend } from "resend";
import { logAuditEvent } from "@/lib/utils/audit";

/**
 * Admin Notification Service
 * Centralized service for sending admin notifications with audit logging
 * DIRECTORY ADMIN SPECIFICATION: Admin notification system with proper audit trail
 */

interface AdminNotificationData {
  type: 'NEW_BUSINESS_REGISTRATION' | 'BUSINESS_CLAIM_SUBMITTED' | 'BUSINESS_UPDATE' | 'QUALITY_ALERT' | 'DUPLICATE_DETECTED';
  businessId: string;
  businessName: string;
  email?: string;
  suburb?: string;
  additionalData?: Record<string, any>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  adminUserId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AdminNotificationResult {
  success: boolean;
  emailSent: boolean;
  auditLogged: boolean;
  error?: string;
  details?: any;
}

class AdminNotificationService {
  private resend: Resend;
  private adminEmail: string;
  private fromEmail: string;
  private appUrl: string;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required for admin notifications');
    }
    
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@suburbmates.com.au';
    this.fromEmail = `admin@${process.env.SENDER_DOMAIN || 'mail.suburbmates.com.au'}`;
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://suburbmates.com.au';
  }

  /**
   * Send admin notification with comprehensive audit logging
   */
  async sendNotification(data: AdminNotificationData): Promise<AdminNotificationResult> {
    let emailSent = false;
    let auditLogged = false;
    let error: string | undefined;

    try {
      // Generate email content based on notification type
      const emailContent = this.generateEmailContent(data);

      // Send email notification
      try {
        await this.resend.emails.send({
          from: this.fromEmail,
          to: this.adminEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        
        emailSent = true;
        console.log(`Admin notification email sent: ${data.type} for business ${data.businessName}`);
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
        error = `Email sending failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`;
        // Don't throw - continue with audit logging
      }

      // Log audit event for all admin notifications
      try {
        await logAuditEvent({
          action: `ADMIN_NOTIFICATION_${data.type}`,
          target: data.businessId,
          meta: {
            notificationType: data.type,
            businessName: data.businessName,
            businessEmail: data.email,
            suburb: data.suburb,
            priority: data.priority || 'NORMAL',
            emailSent,
            adminEmail: this.adminEmail,
            additionalData: data.additionalData,
          },
          ipAddress: data.ipAddress || 'system',
          userAgent: data.userAgent || 'admin-notification-service',
        });
        
        auditLogged = true;
      } catch (auditError) {
        console.error('Failed to log admin notification audit:', auditError);
        if (!error) {
          error = `Audit logging failed: ${auditError instanceof Error ? auditError.message : 'Unknown error'}`;
        }
      }

      return {
        success: emailSent || auditLogged,
        emailSent,
        auditLogged,
        error,
      };

    } catch (generalError) {
      console.error('Admin notification service error:', generalError);
      return {
        success: false,
        emailSent: false,
        auditLogged: false,
        error: generalError instanceof Error ? generalError.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate email content based on notification type
   */
  private generateEmailContent(data: AdminNotificationData): { subject: string; html: string } {
    const baseUrl = this.appUrl;
    
    switch (data.type) {
      case 'NEW_BUSINESS_REGISTRATION':
        return {
          subject: `🔔 New Business Registration: ${data.businessName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0A2540 0%, #1e3a8a 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🔔 New Business Registration</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">SuburbMates Admin Panel</p>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e2e8f0;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #0A2540; margin-bottom: 15px;">Business Details</h3>
                  <p><strong>Business Name:</strong> ${data.businessName}</p>
                  ${data.email ? `<p><strong>Email:</strong> ${data.email}</p>` : ''}
                  ${data.suburb ? `<p><strong>Suburb:</strong> ${data.suburb}</p>` : ''}
                  <p><strong>Business ID:</strong> ${data.businessId}</p>
                  <p><strong>Priority:</strong> <span style="color: ${this.getPriorityColor(data.priority || 'NORMAL')};">${data.priority || 'NORMAL'}</span></p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/admin/businesses?filter=pending" 
                     style="background: #0A2540; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Review & Approve Business
                  </a>
                </div>
                
                <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 25px 0;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;">
                    <strong>Action Required:</strong> This business is awaiting approval to go live on SuburbMates. Please review the details and approve or request additional information.
                  </p>
                </div>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                <p>SuburbMates Admin Notification System</p>
                <p>${new Date().toLocaleString('en-AU')}</p>
              </div>
            </div>
          `
        };

      case 'BUSINESS_CLAIM_SUBMITTED':
        return {
          subject: `🎯 Business Claim Submitted: ${data.businessName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🎯 Business Claim Submitted</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Ownership Verification Required</p>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e2e8f0;">
                <div style="background: #fdf4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #7c3aed; margin-bottom: 15px;">Claim Details</h3>
                  <p><strong>Business:</strong> ${data.businessName}</p>
                  ${data.email ? `<p><strong>Claimant Email:</strong> ${data.email}</p>` : ''}
                  ${data.suburb ? `<p><strong>Location:</strong> ${data.suburb}</p>` : ''}
                  <p><strong>Business ID:</strong> ${data.businessId}</p>
                  ${data.additionalData?.claimId ? `<p><strong>Claim ID:</strong> ${data.additionalData.claimId}</p>` : ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/admin/claims" 
                     style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Review Claim
                  </a>
                </div>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                <p>SuburbMates Admin Notification System</p>
              </div>
            </div>
          `
        };

      case 'QUALITY_ALERT':
        return {
          subject: `⚠️ Quality Alert: ${data.businessName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">⚠️ Quality Alert</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Business Quality Issue Detected</p>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e2e8f0;">
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                  <h3 style="color: #dc2626; margin-bottom: 15px;">Quality Issue</h3>
                  <p><strong>Business:</strong> ${data.businessName}</p>
                  <p><strong>Issue:</strong> ${data.additionalData?.issue || 'Quality score below threshold'}</p>
                  <p><strong>Current Quality Score:</strong> ${data.additionalData?.qualityScore || 'Unknown'}/100</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/admin/businesses/${data.businessId}" 
                     style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Review Business
                  </a>
                </div>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                <p>SuburbMates Quality Monitoring System</p>
              </div>
            </div>
          `
        };

      case 'DUPLICATE_DETECTED':
        return {
          subject: `🔍 Duplicate Detected: ${data.businessName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🔍 Duplicate Business Detected</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Manual Review Required</p>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e2e8f0;">
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #92400e; margin-bottom: 15px;">Duplicate Details</h3>
                  <p><strong>Business:</strong> ${data.businessName}</p>
                  <p><strong>Detection Type:</strong> ${data.additionalData?.duplicateType || 'Unknown'}</p>
                  <p><strong>Confidence:</strong> ${data.additionalData?.confidence || 'High'}</p>
                  ${data.additionalData?.duplicateCount ? `<p><strong>Duplicates Found:</strong> ${data.additionalData.duplicateCount}</p>` : ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/admin/duplicates" 
                     style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Resolve Duplicates
                  </a>
                </div>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                <p>SuburbMates Duplicate Detection System</p>
              </div>
            </div>
          `
        };

      default:
        return {
          subject: `📝 Business Update: ${data.businessName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0A2540;">Business Update Notification</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Business:</strong> ${data.businessName}</p>
                <p><strong>Type:</strong> ${data.type}</p>
                <p><strong>Business ID:</strong> ${data.businessId}</p>
                ${data.email ? `<p><strong>Email:</strong> ${data.email}</p>` : ''}
                ${data.suburb ? `<p><strong>Suburb:</strong> ${data.suburb}</p>` : ''}
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/admin/businesses" 
                   style="background: #0A2540; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Admin Dashboard
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px;">SuburbMates Admin Notification</p>
            </div>
          `
        };
    }
  }

  /**
   * Get color code for priority levels
   */
  private getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT': return '#dc2626';
      case 'HIGH': return '#f59e0b';
      case 'NORMAL': return '#059669';
      case 'LOW': return '#64748b';
      default: return '#059669';
    }
  }

  /**
   * Send new business registration notification
   */
  async notifyNewBusinessRegistration(data: {
    businessId: string;
    businessName: string;
    email?: string;
    suburb?: string;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    adminUserId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AdminNotificationResult> {
    return this.sendNotification({
      type: 'NEW_BUSINESS_REGISTRATION',
      ...data,
    });
  }

  /**
   * Send business claim submitted notification
   */
  async notifyClaimSubmitted(data: {
    businessId: string;
    businessName: string;
    claimantEmail?: string;
    suburb?: string;
    claimId?: string;
    adminUserId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AdminNotificationResult> {
    return this.sendNotification({
      type: 'BUSINESS_CLAIM_SUBMITTED',
      businessId: data.businessId,
      businessName: data.businessName,
      email: data.claimantEmail,
      suburb: data.suburb,
      priority: 'HIGH',
      additionalData: { claimId: data.claimId },
      adminUserId: data.adminUserId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  /**
   * Send quality alert notification
   */
  async notifyQualityAlert(data: {
    businessId: string;
    businessName: string;
    qualityScore: number;
    issue: string;
    adminUserId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AdminNotificationResult> {
    return this.sendNotification({
      type: 'QUALITY_ALERT',
      businessId: data.businessId,
      businessName: data.businessName,
      priority: data.qualityScore < 30 ? 'URGENT' : 'HIGH',
      additionalData: {
        qualityScore: data.qualityScore,
        issue: data.issue,
      },
      adminUserId: data.adminUserId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  /**
   * Send duplicate detection notification
   */
  async notifyDuplicateDetected(data: {
    businessId: string;
    businessName: string;
    duplicateType: 'strict' | 'loose';
    duplicateCount: number;
    confidence: string;
    adminUserId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AdminNotificationResult> {
    return this.sendNotification({
      type: 'DUPLICATE_DETECTED',
      businessId: data.businessId,
      businessName: data.businessName,
      priority: data.duplicateType === 'strict' ? 'HIGH' : 'NORMAL',
      additionalData: {
        duplicateType: data.duplicateType,
        duplicateCount: data.duplicateCount,
        confidence: data.confidence,
      },
      adminUserId: data.adminUserId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }
}

// Export singleton instance
export const adminNotificationService = new AdminNotificationService();

// Export types for use in other modules
export type { AdminNotificationData, AdminNotificationResult };