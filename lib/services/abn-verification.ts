import { z } from 'zod';

// ABN verification types
export interface AbnDetails {
  abn: string;
  businessName?: string;
  businessType?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
  gstStatus?: 'REGISTERED' | 'NOT_REGISTERED';
  registrationDate?: Date;
  entityType?: string;
  mainTradingName?: string;
  tradingNames?: string[];
  address?: {
    state?: string;
    postcode?: string;
    locality?: string;
  };
}

export interface AbnVerificationResult {
  isValid: boolean;
  isActive?: boolean;
  details?: AbnDetails;
  error?: string;
}

/**
 * Validates ABN format and checksum (Australian Business Number)
 * ABN is an 11-digit identifier for businesses operating in Australia
 */
export function validateAbnFormat(abn: string): boolean {
  if (!abn || typeof abn !== 'string') return false;
  
  // Remove spaces and non-digit characters
  const cleanAbn = abn.replace(/\s/g, '').replace(/\D/g, '');
  
  // Must be exactly 11 digits
  if (cleanAbn.length !== 11) return false;
  
  // ABN checksum validation algorithm
  // Subtract 1 from first digit, multiply each digit by weight, sum and check mod 89
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;
  
  for (let i = 0; i < 11; i++) {
    let digit = parseInt(cleanAbn[i]);
    if (i === 0) digit -= 1; // Subtract 1 from first digit
    sum += digit * weights[i];
  }
  
  return sum % 89 === 0;
}

/**
 * Formats ABN with standard spacing (XX XXX XXX XXX)
 */
export function formatAbn(abn: string): string {
  const clean = abn.replace(/\s/g, '').replace(/\D/g, '');
  if (clean.length !== 11) return abn;
  
  return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 11)}`;
}

/**
 * Cleans and validates ABN input
 */
export function cleanAbn(abn: string): string | null {
  const clean = abn.replace(/\s/g, '').replace(/\D/g, '');
  return validateAbnFormat(clean) ? clean : null;
}

/**
 * Verifies ABN with ABR (Australian Business Register) API
 * This would typically require an ABR Web Services GUID and authentication
 * For now, includes basic validation with mock API integration structure
 */
export async function verifyAbnWithAbr(abn: string): Promise<AbnVerificationResult> {
  try {
    // Basic format validation first
    if (!validateAbnFormat(abn)) {
      return {
        isValid: false,
        error: 'Invalid ABN format or checksum'
      };
    }
    
    const cleanedAbn = cleanAbn(abn);
    if (!cleanedAbn) {
      return {
        isValid: false,
        error: 'Unable to parse ABN'
      };
    }

    // In production, this would call the real ABR Web Services API
    // For now, we'll implement basic validation and mock some responses
    
    // Check environment variables for ABR API configuration
    const abrGuid = process.env.ABR_WEBSERVICES_GUID;
    const abrEndpoint = process.env.ABR_API_ENDPOINT || 'https://abr.business.gov.au/abrxmlsearch/AbrXmlSearch.asmx';
    
    if (!abrGuid) {
      console.warn('ABR_WEBSERVICES_GUID not configured, falling back to format validation only');
      return {
        isValid: true,
        details: {
          abn: formatAbn(cleanedAbn),
          status: 'ACTIVE' // Assume active if format is valid
        }
      };
    }

    // Mock ABR API call structure (implement actual API call in production)
    // const response = await fetch(`${abrEndpoint}/ABRSearchByABN`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/xml',
    //   },
    //   // ABR API requires specific XML format with GUID and ABN
    // });

    // For development, return basic validation result
    return {
      isValid: true,
      isActive: true,
      details: {
        abn: formatAbn(cleanedAbn),
        status: 'ACTIVE',
        businessName: 'Business Name (from ABR)', // Would come from API
        entityType: 'Company', // Would come from API
      }
    };

  } catch (error) {
    console.error('ABN verification error:', error);
    return {
      isValid: false,
      error: 'Failed to verify ABN with ABR service'
    };
  }
}

/**
 * Comprehensive ABN verification that includes format validation and optional ABR lookup
 */
export async function verifyAbn(abn: string, skipAbrLookup = false): Promise<AbnVerificationResult> {
  // Always validate format first
  if (!validateAbnFormat(abn)) {
    return {
      isValid: false,
      error: 'Invalid ABN format or checksum'
    };
  }

  // If format is valid but we're skipping ABR lookup
  if (skipAbrLookup) {
    return {
      isValid: true,
      details: {
        abn: formatAbn(abn),
        status: 'ACTIVE' // Assume active based on format
      }
    };
  }

  // Full verification with ABR lookup
  return verifyAbnWithAbr(abn);
}

/**
 * Zod schema for ABN validation in forms
 */
export const AbnSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true; // Allow empty
      return validateAbnFormat(val);
    },
    {
      message: 'Invalid ABN format. ABN must be 11 digits with valid checksum.'
    }
  )
  .transform((val) => {
    if (!val || val.trim() === '') return null;
    return cleanAbn(val);
  });

/**
 * Determines ABN status based on verification result
 */
export function getAbnStatus(verificationResult: AbnVerificationResult): 'NOT_PROVIDED' | 'PENDING' | 'VERIFIED' | 'INVALID' | 'EXPIRED' {
  if (!verificationResult.isValid) {
    return 'INVALID';
  }
  
  if (verificationResult.details?.status === 'ACTIVE' && verificationResult.isActive) {
    return 'VERIFIED';
  }
  
  if (verificationResult.details?.status === 'CANCELLED' || verificationResult.details?.status === 'INACTIVE') {
    return 'EXPIRED';
  }
  
  return 'PENDING'; // Verification in progress
}

/**
 * Mock function to simulate ABR business search by name
 * In production, this would search ABR database by business name
 */
export async function searchBusinessByName(businessName: string, suburb?: string): Promise<AbnDetails[]> {
  // This would typically call ABR search API
  // For now, return empty array
  console.log(`Mock ABR search for: ${businessName} in ${suburb || 'any suburb'}`);
  return [];
}

/**
 * Validates if ABN belongs to active business entity
 */
export function isActiveBusinessAbn(details?: AbnDetails): boolean {
  if (!details) return false;
  return details.status === 'ACTIVE';
}

/**
 * Gets display status for ABN verification in UI
 */
export function getAbnDisplayStatus(abnStatus: string): { label: string; color: string; icon?: string } {
  switch (abnStatus) {
    case 'VERIFIED':
      return { label: 'ABN Verified', color: 'green', icon: '✓' };
    case 'PENDING':
      return { label: 'ABN Verification Pending', color: 'yellow', icon: '⏳' };
    case 'INVALID':
      return { label: 'Invalid ABN', color: 'red', icon: '✗' };
    case 'EXPIRED':
      return { label: 'ABN Expired/Cancelled', color: 'orange', icon: '⚠' };
    case 'NOT_PROVIDED':
    default:
      return { label: 'No ABN Provided', color: 'gray', icon: '—' };
  }
}