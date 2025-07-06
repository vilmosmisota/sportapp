import { r2FileUploadService } from "@/libs/upload/fileUploadService";
import { LOGO_PRESET, optimizeImage } from "@/libs/upload/imageOptimizeService";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tenantId = formData.get("tenantId") as string | null;
    const uploadType = formData.get("uploadType") as string | null;
    const oldFileKey = formData.get("oldFileKey") as string | null;
    const tenantName = formData.get("tenantName") as string | null;

    if (!file || !tenantId || !uploadType) {
      return NextResponse.json(
        { error: "Missing required fields: file, tenantId, uploadType" },
        { status: 400 }
      );
    }

    if (oldFileKey) {
      await r2FileUploadService.deleteFile(oldFileKey);
    }

    // Validate file type and size
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "image/svg+xml",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type." },
        { status: 400 }
      );
    }
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      );
    }

    // Optimize image if needed
    let uploadBuffer: Buffer;
    let uploadFileName = file.name;
    let uploadContentType = file.type;
    let folder = "other";
    if (file.type.startsWith("image/")) {
      let optimizeOptions;
      if (uploadType === "logo") {
        optimizeOptions = LOGO_PRESET;
        folder = "images";
      } else {
        optimizeOptions = {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 80,
          format: "jpeg" as const,
        };
        folder = "images";
      }
      const arrayBuffer = await file.arrayBuffer();
      uploadBuffer = await optimizeImage(
        Buffer.from(arrayBuffer),
        optimizeOptions
      );
      uploadFileName = uploadFileName.replace(
        /\.[^/.]+$/,
        "." + optimizeOptions.format
      );
      uploadContentType =
        optimizeOptions.format === "png"
          ? "image/png"
          : optimizeOptions.format === "webp"
          ? "image/webp"
          : "image/jpeg";
    } else {
      // Not an image, just upload as is
      const arrayBuffer = await file.arrayBuffer();
      uploadBuffer = Buffer.from(arrayBuffer);
      folder = "documents";
    }

    // Upload to R2
    const uploadResult = await r2FileUploadService.uploadFile({
      file: uploadBuffer,
      fileName: uploadFileName,
      contentType: uploadContentType,
      folder,
      tenantId,
      tenantName: tenantName || undefined,
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || "Upload failed" },
        { status: 500 }
      );
    }

    // Construct the public URL using the custom domain
    const key = uploadResult.key;
    const publicBaseUrl = "https://www.sportwise.net";
    const publicUrl = `${publicBaseUrl}/${key}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
      tenantId,
    });
  } catch (error) {
    console.error("File upload failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
