/**
 * Contact extraction utility using multimodal AI
 */

import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { CONTACT_EXTRACTION_PROMPT } from "../prompts";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact data schema for extraction
 */
const contactSchema = z.object({
  name: z.string().nullable(),
  email: z.union([z.string(), z.null()]).transform((val) => {
    if (!val || typeof val !== "string") {
      return null;
    }
    const trimmed = val.trim();
    // Basic email validation
    if (trimmed && EMAIL_REGEX.test(trimmed)) {
      return trimmed;
    }
    return null;
  }),
  phone: z.string().nullable(),
  company: z.string().nullable(),
  role: z.string().nullable(),
});

export type ExtractedContact = z.infer<typeof contactSchema>;

/**
 * Extract contact information from an image URL using Gemini vision
 */
export async function extractContactFromImage(imageUrl: string): Promise<ExtractedContact> {
  const model = google("gemini-3-flash-preview");

  try {
    const result = await generateText({
      model,
      output: Output.object({ schema: contactSchema }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: CONTACT_EXTRACTION_PROMPT,
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
    });

    // Validate and clean the extracted data
    const extracted = contactSchema.parse(result.output);

    // Clean up the data
    return {
      name: extracted.name?.trim() || null,
      email: extracted.email?.trim() || null,
      phone: extracted.phone?.trim() || null,
      company: extracted.company?.trim() || null,
      role: extracted.role?.trim() || null,
    };
  } catch (error) {
    // If extraction fails, return empty contact
    console.error("Failed to extract contact from image:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to extract contact: ${error.message}`
        : "Failed to extract contact from image"
    );
  }
}
