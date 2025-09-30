/**
 * Audit Logging Utilities
 * Functions for tracking business actions and user activities
 */

import { prisma } from '@/lib/database/prisma';

export interface AuditEventData {
  actorId?: string; // User ID who performed the action
  action: string; // Action type (CREATE_BUSINESS, CLAIM_BUSINESS, etc.)
  target?: string; // Target resource ID (business ID, etc.)
  meta?: Record<string, any>; // Additional metadata
  ipAddress?: string; // IP address for security tracking
  userAgent?: string; // User agent for device tracking
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(data: AuditEventData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: data.actorId ?? null,
        action: data.action,
        target: data.target ?? null,
        meta: (data.meta as any) ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging shouldn't break the main flow
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Predefined audit actions for business operations
 */
export const AUDIT_ACTIONS = {
  // Business Profile Actions
  CREATE_BUSINESS_PROFILE: 'CREATE_BUSINESS_PROFILE',
  UPDATE_BUSINESS_PROFILE: 'UPDATE_BUSINESS_PROFILE',
  DELETE_BUSINESS_PROFILE: 'DELETE_BUSINESS_PROFILE',
  PUBLISH_BUSINESS_PROFILE: 'PUBLISH_BUSINESS_PROFILE',
  UNPUBLISH_BUSINESS_PROFILE: 'UNPUBLISH_BUSINESS_PROFILE',
  
  // Customization Actions
  UPDATE_BUSINESS_THEME: 'UPDATE_BUSINESS_THEME',
  UPDATE_BUSINESS_LAYOUT: 'UPDATE_BUSINESS_LAYOUT',
  UPLOAD_BUSINESS_LOGO: 'UPLOAD_BUSINESS_LOGO',
  UPDATE_BUSINESS_GALLERY: 'UPDATE_BUSINESS_GALLERY',
  
  // Claim Actions
  SUBMIT_OWNERSHIP_CLAIM: 'SUBMIT_OWNERSHIP_CLAIM',
  APPROVE_OWNERSHIP_CLAIM: 'APPROVE_OWNERSHIP_CLAIM',
  REJECT_OWNERSHIP_CLAIM: 'REJECT_OWNERSHIP_CLAIM',
  CLOSE_OWNERSHIP_CLAIM: 'CLOSE_OWNERSHIP_CLAIM',
  
  // Inquiry/Lead Actions
  SUBMIT_BUSINESS_INQUIRY: 'SUBMIT_BUSINESS_INQUIRY',
  RESPOND_TO_INQUIRY: 'RESPOND_TO_INQUIRY',
  MARK_INQUIRY_CONVERTED: 'MARK_INQUIRY_CONVERTED',
  
  // Sharing Actions
  SHARE_BUSINESS_PROFILE: 'SHARE_BUSINESS_PROFILE',
  GENERATE_SHARE_LINK: 'GENERATE_SHARE_LINK',
  VIEW_SHARED_PROFILE: 'VIEW_SHARED_PROFILE',
  
  // Administrative Actions
  ADMIN_APPROVE_BUSINESS: 'ADMIN_APPROVE_BUSINESS',
  ADMIN_REJECT_BUSINESS: 'ADMIN_REJECT_BUSINESS',
  ADMIN_SUSPEND_BUSINESS: 'ADMIN_SUSPEND_BUSINESS',
  ADMIN_RESTORE_BUSINESS: 'ADMIN_RESTORE_BUSINESS',
  
  // Authentication Actions
  USER_SIGNUP: 'USER_SIGNUP',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

/**
 * Type-safe audit logging with predefined actions
 */
export async function logBusinessAction(
  action: keyof typeof AUDIT_ACTIONS,
  data: Omit<AuditEventData, 'action'>
): Promise<void> {
  return logAuditEvent({
    ...data,
    action: AUDIT_ACTIONS[action],
  });
}

/**
 * Log user authentication events
 */
export async function logAuthEvent(
  userId: string,
  action: 'USER_SIGNUP' | 'USER_LOGIN' | 'USER_LOGOUT' | 'PASSWORD_RESET',
  meta?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAuditEvent({
    actorId: userId,
    action: AUDIT_ACTIONS[action],
    meta,
    ipAddress,
    userAgent,
  });
}

/**
 * Log business profile changes
 */
export async function logProfileChange(
  userId: string,
  businessId: string,
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH',
  changes?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const actionMap = {
    CREATE: AUDIT_ACTIONS.CREATE_BUSINESS_PROFILE,
    UPDATE: AUDIT_ACTIONS.UPDATE_BUSINESS_PROFILE,
    DELETE: AUDIT_ACTIONS.DELETE_BUSINESS_PROFILE,
    PUBLISH: AUDIT_ACTIONS.PUBLISH_BUSINESS_PROFILE,
    UNPUBLISH: AUDIT_ACTIONS.UNPUBLISH_BUSINESS_PROFILE,
  };

  return logAuditEvent({
    actorId: userId,
    action: actionMap[changeType],
    target: businessId,
    meta: changes,
    ipAddress,
    userAgent,
  });
}

/**
 * Log ownership claim events
 */
export async function logClaimEvent(
  userId: string,
  businessId: string,
  claimId: string,
  action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CLOSE',
  meta?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const actionMap = {
    SUBMIT: AUDIT_ACTIONS.SUBMIT_OWNERSHIP_CLAIM,
    APPROVE: AUDIT_ACTIONS.APPROVE_OWNERSHIP_CLAIM,
    REJECT: AUDIT_ACTIONS.REJECT_OWNERSHIP_CLAIM,
    CLOSE: AUDIT_ACTIONS.CLOSE_OWNERSHIP_CLAIM,
  };

  return logAuditEvent({
    actorId: userId,
    action: actionMap[action],
    target: businessId,
    meta: {
      claimId,
      ...meta,
    },
    ipAddress,
    userAgent,
  });
}

/**
 * Get audit log for a specific business
 */
export async function getBusinessAuditLog(
  businessId: string,
  limit: number = 50
) {
  return prisma.auditLog.findMany({
    where: {
      target: businessId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Get audit log for a specific user
 */
export async function getUserAuditLog(
  userId: string,
  limit: number = 50
) {
  return prisma.auditLog.findMany({
    where: {
      actorId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

export default {
  logAuditEvent,
  logBusinessAction,
  logAuthEvent,
  logProfileChange,
  logClaimEvent,
  getBusinessAuditLog,
  getUserAuditLog,
  AUDIT_ACTIONS,
};