import { NextRequest, NextResponse } from "next/server";
import { verifyABN, ABRVerificationError } from "@/features/verification/services/abr";
import { z } from "zod";

const VerifyABNSchema = z.object({
  abn: z.string().min(11, "ABN must be 11 digits").max(14, "ABN too long")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { abn } = VerifyABNSchema.parse(body);

    // Verify ABN using our ABR service
    const abrData = await verifyABN(abn);

    return NextResponse.json({
      success: true,
      // Core business information
      entityName: abrData.entityName,
      businessName: abrData.businessName,
      abn: abrData.ABN,
      acn: abrData.ACN,
      
      // Status information
      status: abrData.status,
      abnStatus: abrData.abnStatus,
      entityType: abrData.entityType,
      
      // Tax registrations
      gst: abrData.GST,
      dgr: abrData.DGR,
      gstStatusEffectiveDate: abrData.gstStatusEffectiveDate,
      
      // Address information
      address: abrData.address,
      
      // Business names
      businessNames: abrData.businessNames,
      
      // Dates
      abnStatusEffectiveDate: abrData.abnStatusEffectiveDate
    });

  } catch (error) {
    console.error("ABN verification error:", error);

    if (error instanceof ABRVerificationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid ABN format", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "ABN verification failed. Please try again." },
      { status: 500 }
    );
  }
}