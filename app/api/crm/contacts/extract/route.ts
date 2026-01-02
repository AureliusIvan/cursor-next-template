import { NextResponse } from "next/server";
import { extractContactFromImage } from "@/lib/ai/utils/contact-extractor";

/**
 * POST handler for extracting contact information from images
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required and must be a string" },
        { status: 400 }
      );
    }

    // Extract contact information from the image
    const extractedContact = await extractContactFromImage(imageUrl);

    return NextResponse.json({
      success: true,
      contact: extractedContact,
    });
  } catch (error) {
    console.error("Contact extraction error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to extract contact information",
      },
      { status: 500 }
    );
  }
}
