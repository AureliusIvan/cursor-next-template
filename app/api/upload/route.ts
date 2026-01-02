import { type Router, route } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";
import { aws } from "@better-upload/server/clients";

// Configure your S3-compatible storage credentials in .env:
// AWS_ACCESS_KEY_ID=your-access-key
// AWS_SECRET_ACCESS_KEY=your-secret-key
// AWS_REGION=your-region (e.g., us-east-1)
// S3_BUCKET_NAME=your-bucket-name

const router: Router = {
  client: aws(),
  bucketName: process.env.S3_BUCKET_NAME || "my-bucket",
  routes: {
    // For chat attachments (images and documents)
    chatAttachments: route({
      fileTypes: ["image/*", "application/pdf", "text/*"],
      multipleFiles: true,
      maxFiles: 5,
      maxFileSize: 10 * 1024 * 1024,
    }),
    // For contact extraction (single image upload)
    contactExtraction: route({
      fileTypes: ["image/*"],
      multipleFiles: false,
      maxFileSize: 10 * 1024 * 1024,
    }),
  },
};

export const { POST } = toRouteHandler(router);
