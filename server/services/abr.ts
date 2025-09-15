import { z } from "zod";

// ABR API Response Schema - Complete field mapping
const ABRResponseSchema = z.object({
  // Core business identifiers
  ABN: z.string(),
  ACN: z.string().optional(),
  entityName: z.string(),
  businessName: z.string().optional(),
  
  // Business status and type
  status: z.string(),
  entityType: z.string().optional(),
  entityTypeCode: z.string().optional(),
  
  // Tax registrations
  GST: z.union([z.boolean(), z.string()]).optional(),
  DGR: z.union([z.boolean(), z.string()]).optional(),
  
  // Address information
  address: z.object({
    state: z.string().optional(),
    postcode: z.string().optional(),
    suburb: z.string().optional(),
    streetAddress: z.string().optional(),
  }).optional(),
  
  // Additional fields from ABR API
  abnStatus: z.string().optional(),
  abnStatusEffectiveDate: z.string().optional(),
  gstStatusEffectiveDate: z.string().optional(),
  
  // Business names array
  businessNames: z.array(z.string()).optional(),
  
  // Error handling
  message: z.string().optional(),
  exception: z.string().optional(),
});

export type ABRResponse = z.infer<typeof ABRResponseSchema>;

// ABR Verification Error
export class ABRVerificationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "ABRVerificationError";
  }
}

/**
 * Verify Australian Business Number (ABN) using ABR API
 * @param abn - 11 digit ABN (with or without spaces)
 * @returns Promise<ABRResponse> - Business details from ABR
 */
export async function verifyABN(abn: string): Promise<ABRResponse> {
  // Clean ABN - remove spaces and validate format
  const cleanABN = abn.replace(/\s/g, "");
  
  if (!/^\d{11}$/.test(cleanABN)) {
    throw new ABRVerificationError("Invalid ABN format. Must be 11 digits.", "INVALID_FORMAT");
  }

  // Use the official ABR JSON API endpoint
  const ABR_GUID = process.env.ABR_API_GUID || "test-guid"; // Allow test GUID for development
  
  try {
    // ABR API call using official JSON endpoint
    const response = await fetch(
      `https://abr.business.gov.au/json/AbnDetails.aspx?abn=${cleanABN}&guid=${ABR_GUID}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Suburbmates/1.0",
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new ABRVerificationError(
        `ABR API request failed: ${response.status} ${response.statusText}`,
        "API_ERROR"
      );
    }

    const data = await response.json();

    // Check for API errors first
    if (data.exception || data.message) {
      throw new ABRVerificationError(
        data.message || data.exception || "ABR API returned an error",
        "API_ERROR"
      );
    }

    // Check if ABN was found
    if (!data || !data.ABN) {
      throw new ABRVerificationError("ABN not found in ABR database", "ABN_NOT_FOUND");
    }

    // Parse GST and DGR status (can be "Y"/"N" strings or boolean)
    const parseGSTStatus = (gst: any): boolean | undefined => {
      if (gst === "Y" || gst === true) return true;
      if (gst === "N" || gst === false) return false;
      return undefined;
    };

    // Validate and parse response with all available fields
    const validatedData = ABRResponseSchema.parse({
      // Core identifiers
      ABN: data.ABN,
      ACN: data.ACN,
      entityName: data.entityName || data.businessName || "Unknown Business",
      businessName: data.businessName,
      
      // Status and type
      status: data.status || data.abnStatus || "Unknown",
      entityType: data.entityType,
      entityTypeCode: data.entityTypeCode,
      
      // Tax registrations
      GST: parseGSTStatus(data.GST),
      DGR: parseGSTStatus(data.DGR),
      
      // Address (handle both nested and flat structures)
      address: (data.address || data.state || data.postcode || data.suburb) ? {
        state: data.address?.state || data.state,
        postcode: data.address?.postcode || data.postcode,
        suburb: data.address?.suburb || data.suburb,
        streetAddress: data.address?.streetAddress || data.streetAddress,
      } : undefined,
      
      // Additional fields
      abnStatus: data.abnStatus,
      abnStatusEffectiveDate: data.abnStatusEffectiveDate,
      gstStatusEffectiveDate: data.gstStatusEffectiveDate,
      
      // Business names (can be array or single name)
      businessNames: Array.isArray(data.businessNames) ? data.businessNames : 
                    data.businessName ? [data.businessName] : undefined,
      
      // Error fields
      message: data.message,
      exception: data.exception,
    });

    return validatedData;
  } catch (error) {
    if (error instanceof ABRVerificationError) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new ABRVerificationError(
        "Invalid response format from ABR API",
        "INVALID_RESPONSE"
      );
    }

    // Network or other errors
    throw new ABRVerificationError(
      `ABR verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "NETWORK_ERROR"
    );
  }
}

/**
 * Format ABN for display (XX XXX XXX XXX)
 * @param abn - 11 digit ABN
 * @returns Formatted ABN string
 */
export function formatABN(abn: string): string {
  const cleanABN = abn.replace(/\s/g, "");
  if (!/^\d{11}$/.test(cleanABN)) {
    return abn; // Return as-is if invalid
  }
  
  return `${cleanABN.slice(0, 2)} ${cleanABN.slice(2, 5)} ${cleanABN.slice(5, 8)} ${cleanABN.slice(8, 11)}`;
}

/**
 * Validate ABN format (client-side validation)
 * @param abn - ABN string to validate
 * @returns boolean - true if valid format
 */
export function isValidABNFormat(abn: string): boolean {
  const cleanABN = abn.replace(/\s/g, "");
  return /^\d{11}$/.test(cleanABN);
}

/**
 * Check if business is Melbourne-based from ABR response
 * @param abrResponse - ABR API response
 * @returns boolean - true if Melbourne-based
 */
export function isMelbourneBusiness(abrResponse: ABRResponse): boolean {
  const melbournePostcodes = [
    // Melbourne CBD and inner suburbs
    "3000", "3001", "3002", "3003", "3004", "3005", "3006", "3008",
    // Inner suburbs
    "3010", "3011", "3012", "3013", "3015", "3016", "3018", "3019",
    "3020", "3021", "3022", "3023", "3024", "3025", "3031", "3032",
    "3033", "3034", "3036", "3037", "3038", "3039", "3040", "3041",
    "3042", "3043", "3044", "3045", "3046", "3047", "3048", "3049",
    "3050", "3051", "3052", "3053", "3054", "3055", "3056", "3057",
    "3058", "3059", "3060", "3061", "3062", "3063", "3064", "3065",
    "3066", "3067", "3068", "3070", "3071", "3072", "3073", "3074",
    "3075", "3076", "3078", "3079", "3081", "3082", "3083", "3084",
    "3085", "3086", "3087", "3088", "3089", "3090", "3091", "3093",
    "3094", "3095", "3096", "3097", "3099",
  ];

  const state = abrResponse.address?.state?.toUpperCase();
  const postcode = abrResponse.address?.postcode;

  // Check if Victoria and Melbourne postcode
  return state === "VIC" && postcode ? melbournePostcodes.includes(postcode) : false;
}