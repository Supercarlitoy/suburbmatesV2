import { PrismaClient, ApprovalStatus, Business } from '@prisma/client';
import { calculateQualityScore } from './quality-scoring';
import { findDuplicates } from './duplicate-detection';
import { AIBusinessVerification } from './ai-automation';
import { logAuditEvent } from '@/lib/utils/audit';

/**
 * Admin Business Service
 * Centralized service for admin business operations with service layer integration
 * DIRECTORY ADMIN SPECIFICATION: Complete service layer integration for admin operations
 */

interface AdminBusinessFilters {
  status?: ApprovalStatus;
  suburb?: string;
  category?: string;
  abnStatus?: string;
  source?: string;
  hasOwner?: boolean;
  qualityScoreMin?: number;
  qualityScoreMax?: number;
}

interface AdminBusinessOptions {
  includeQualityScore?: boolean;
  includeDuplicates?: boolean;
  includeAIAnalysis?: boolean;
  includeOwner?: boolean;
  includeCustomization?: boolean;
  includeLeads?: boolean;
  includeInquiries?: boolean;
}

interface AdminBusinessResult {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  abn: string | null;
  bio: string | null;
  suburb: string;
  category: string | null;
  approvalStatus: ApprovalStatus;
  abnStatus: string;
  qualityScore: number | null;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Optional enhanced data
  owner?: any;
  customization?: any;
  leads?: any[];
  inquiries?: any[];
  leadCount?: number;
  inquiryCount?: number;
  
  // Service layer enhancements
  calculatedQualityScore?: number;
  qualityScoreUpToDate?: boolean;
  duplicates?: {
    strict: any[];
    loose: any[];
    hasStrictDuplicates: boolean;
    hasLooseDuplicates: boolean;
  };
  aiAnalysis?: {
    confidence: number;
    recommendation: string;
    reasons: string[];
    lastAnalyzed: string;
  };
}

interface AdminBusinessStats {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  averageQualityScore: number;
  recentRegistrations: number; // Last 7 days
  duplicatesDetected: number;
  abnVerifiedCount: number;
}

class AdminBusinessService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get businesses for admin with service layer enhancements
   */
  async getBusinessesForAdmin(
    filters: AdminBusinessFilters = {},
    options: AdminBusinessOptions = {},
    limit = 50,
    offset = 0
  ): Promise<{ businesses: AdminBusinessResult[]; total: number }> {
    // Build where clause
    const where: any = {};
    
    if (filters.status) {
      where.approvalStatus = filters.status;
    }
    
    if (filters.suburb) {
      where.suburb = { contains: filters.suburb, mode: 'insensitive' };
    }
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.abnStatus) {
      where.abnStatus = filters.abnStatus;
    }
    
    if (filters.source) {
      where.source = filters.source;
    }
    
    if (filters.hasOwner !== undefined) {
      where.ownerId = filters.hasOwner ? { not: null } : null;
    }
    
    if (filters.qualityScoreMin !== undefined) {
      where.qualityScore = { gte: filters.qualityScoreMin };
    }
    
    if (filters.qualityScoreMax !== undefined) {
      where.qualityScore = { ...(where.qualityScore || {}), lte: filters.qualityScoreMax };
    }

    // Build include clause
    const include: any = {};
    
    if (options.includeOwner) {
      include.owner = {
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true
        }
      };
    }
    
    if (options.includeCustomization) {
      include.customization = true;
    }
    
    if (options.includeLeads) {
      include.leads = {
        select: {
          id: true,
          status: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5 // Recent leads for quick overview
      };
    }
    
    if (options.includeInquiries) {
      include.inquiries = {
        select: {
          id: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      };
    }

    // Fetch businesses and total count
    const [businesses, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        include,
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      this.prisma.business.count({ where })
    ]);

    // Enhance businesses with service layer data
    const enhancedBusinesses = await Promise.all(
      businesses.map(async (business) => {
        const enhancements: AdminBusinessResult = {
          id: business.id,
          name: business.name,
          email: business.email,
          phone: business.phone,
          website: business.website,
          abn: business.abn,
          bio: business.bio,
          suburb: business.suburb,
          category: business.category,
          approvalStatus: business.approvalStatus,
          abnStatus: business.abnStatus,
          qualityScore: business.qualityScore,
          source: business.source,
          createdAt: business.createdAt,
          updatedAt: business.updatedAt,
          owner: (business as any).owner,
          customization: (business as any).customization,
          leads: (business as any).leads || [],
          inquiries: (business as any).inquiries || [],
          leadCount: ((business as any).leads || []).length,
          inquiryCount: ((business as any).inquiries || []).length,
        };

        // Add quality score analysis if requested
        if (options.includeQualityScore) {
          const currentQualityScore = calculateQualityScore({
            name: business.name,
            description: business.bio || undefined,
            phone: business.phone || undefined,
            email: business.email || undefined,
            website: business.website || undefined,
            abn: business.abn || undefined,
            abnStatus: business.abnStatus,
            createdAt: business.createdAt,
            updatedAt: business.updatedAt,
          });
          
          enhancements.calculatedQualityScore = currentQualityScore;
          enhancements.qualityScoreUpToDate = Math.abs(currentQualityScore - (business.qualityScore || 0)) < 5;
        }

        // Add duplicate detection if requested
        if (options.includeDuplicates) {
          const strictDuplicates = await findDuplicates({
            name: business.name,
            phone: business.phone || undefined,
            website: business.website || undefined,
            suburb: business.suburb,
            email: business.email || undefined,
          }, this.prisma, 'strict', business.id);
          
          const looseDuplicates = await findDuplicates({
            name: business.name,
            phone: business.phone || undefined,
            website: business.website || undefined,
            suburb: business.suburb,
            email: business.email || undefined,
          }, this.prisma, 'loose', business.id);
          
          enhancements.duplicates = {
            strict: strictDuplicates.slice(0, 3), // Limit for performance
            loose: looseDuplicates.slice(0, 5),
            hasStrictDuplicates: strictDuplicates.length > 0,
            hasLooseDuplicates: looseDuplicates.length > 0,
          };
        }

        // Add AI analysis if requested (for pending businesses)
        if (options.includeAIAnalysis && business.approvalStatus === 'PENDING') {
          try {
            const aiResult = await AIBusinessVerification.verifyBusinessClaim({
              businessName: business.name,
              abn: business.abn || undefined,
              email: business.email || undefined,
              phone: business.phone || undefined,
              website: business.website || undefined,
              description: business.bio || undefined,
            }, 'admin_review', {});
            
            enhancements.aiAnalysis = {
              confidence: aiResult.score,
              recommendation: aiResult.status,
              reasons: aiResult.reasons,
              lastAnalyzed: new Date().toISOString(),
            };
          } catch (error) {
            console.error('AI analysis failed for business:', business.id, error);
            enhancements.aiAnalysis = {
              confidence: 0,
              recommendation: 'manual_review',
              reasons: ['AI analysis unavailable'],
              lastAnalyzed: new Date().toISOString(),
            };
          }
        }

        return enhancements;
      })
    );

    return {
      businesses: enhancedBusinesses,
      total
    };
  }

  /**
   * Get comprehensive admin statistics
   */
  async getAdminStats(): Promise<AdminBusinessStats> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      avgQualityScore,
      recentRegistrations,
      abnVerifiedCount
    ] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.business.count({ where: { approvalStatus: 'PENDING' } }),
      this.prisma.business.count({ where: { approvalStatus: 'APPROVED' } }),
      this.prisma.business.count({ where: { approvalStatus: 'REJECTED' } }),
      this.prisma.business.aggregate({
        _avg: { qualityScore: true },
        where: { qualityScore: { not: null as any } }
      }),
      this.prisma.business.count({
        where: {
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      this.prisma.business.count({ where: { abnStatus: 'VERIFIED' } })
    ]);

    // Count duplicates (businesses with duplicateOfId set)
    const duplicatesDetected = await this.prisma.business.count({
      where: { duplicateOfId: { not: null } }
    });

    return {
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      averageQualityScore: (avgQualityScore._avg && avgQualityScore._avg.qualityScore) || 0,
      recentRegistrations,
      duplicatesDetected,
      abnVerifiedCount,
    };
  }

  /**
   * Get a single business with full service layer enhancement for admin
   */
  async getBusinessForAdmin(
    businessId: string,
    options: AdminBusinessOptions = {
      includeQualityScore: true,
      includeDuplicates: true,
      includeAIAnalysis: true,
      includeOwner: true,
      includeCustomization: true,
      includeLeads: true,
      includeInquiries: true
    }
  ): Promise<AdminBusinessResult | null> {
    const result = await this.getBusinessesForAdmin(
      {}, // No filters, we're getting by ID
      options,
      1, // limit
      0  // offset
    );

    // Get the specific business
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        owner: options.includeOwner ? {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        } : false,
        customization: options.includeCustomization,
        leads: options.includeLeads ? {
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        } : false,
        inquiries: options.includeInquiries ? {
          select: {
            id: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        } : false
      }
    });

    if (!business) {
      return null;
    }

    // Use the same enhancement logic as getBusinessesForAdmin
    const enhancements: AdminBusinessResult = {
      id: business.id,
      name: business.name,
      email: business.email,
      phone: business.phone,
      website: business.website,
      abn: business.abn,
      bio: business.bio,
      suburb: business.suburb,
      category: business.category,
      approvalStatus: business.approvalStatus,
      abnStatus: business.abnStatus,
      qualityScore: business.qualityScore,
      source: business.source,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
      owner: (business as any).owner,
      customization: (business as any).customization,
      leads: (business as any).leads || [],
      inquiries: (business as any).inquiries || [],
      leadCount: ((business as any).leads || []).length,
      inquiryCount: ((business as any).inquiries || []).length,
    };

    // Apply service layer enhancements
    if (options.includeQualityScore) {
      const currentQualityScore = calculateQualityScore({
        name: business.name,
        description: business.bio || undefined,
        phone: business.phone || undefined,
        email: business.email || undefined,
        website: business.website || undefined,
        abn: business.abn || undefined,
        abnStatus: business.abnStatus,
        createdAt: business.createdAt,
        updatedAt: business.updatedAt,
      });
      
      enhancements.calculatedQualityScore = currentQualityScore;
      enhancements.qualityScoreUpToDate = Math.abs(currentQualityScore - (business.qualityScore || 0)) < 5;
    }

    if (options.includeDuplicates) {
      const strictDuplicates = await findDuplicates({
        name: business.name,
        phone: business.phone || undefined,
        website: business.website || undefined,
        suburb: business.suburb,
        email: business.email || undefined,
      }, this.prisma, 'strict', business.id);
      
      const looseDuplicates = await findDuplicates({
        name: business.name,
        phone: business.phone || undefined,
        website: business.website || undefined,
        suburb: business.suburb,
        email: business.email || undefined,
      }, this.prisma, 'loose', business.id);
      
      enhancements.duplicates = {
        strict: strictDuplicates,
        loose: looseDuplicates,
        hasStrictDuplicates: strictDuplicates.length > 0,
        hasLooseDuplicates: looseDuplicates.length > 0,
      };
    }

    if (options.includeAIAnalysis && business.approvalStatus === 'PENDING') {
      try {
        const aiResult = await AIBusinessVerification.verifyBusinessClaim({
          businessName: business.name,
          abn: business.abn || undefined,
          email: business.email || undefined,
          phone: business.phone || undefined,
          website: business.website || undefined,
          description: business.bio || undefined,
        }, 'admin_review', {});
        
        enhancements.aiAnalysis = {
          confidence: aiResult.score,
          recommendation: aiResult.status,
          reasons: aiResult.reasons,
          lastAnalyzed: new Date().toISOString(),
        };
      } catch (error) {
        console.error('AI analysis failed for business:', business.id, error);
        enhancements.aiAnalysis = {
          confidence: 0,
          recommendation: 'manual_review',
          reasons: ['AI analysis unavailable'],
          lastAnalyzed: new Date().toISOString(),
        };
      }
    }

    return enhancements;
  }

  /**
   * Get current admin user ID (placeholder method for compatibility)
   */
  getCurrentAdminId(): string | null {
    // This is a placeholder - in reality this should get the current admin from context
    // For now, return null to indicate system action
    return null;
  }

  /**
   * Log admin access event for audit trails
   */
  async logAdminAccess(
    action: string,
    targetId: string | null,
    adminUserId: string | null,
    metadata: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await logAuditEvent({
      action,
      target: targetId || undefined,
      meta: {
        ...metadata,
        adminUserId
      },
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown'
    });
  }
}

// Export types
export type {
  AdminBusinessFilters,
  AdminBusinessOptions,
  AdminBusinessResult,
  AdminBusinessStats
};

export { AdminBusinessService };