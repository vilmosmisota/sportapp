import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export interface FileUploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export interface FileUploadOptions {
  file: File | Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
  tenantId?: string | number;
}

class R2FileUploadService {
  private client: S3Client;
  private bucketName: string;
  private endpoint: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME!;
    this.endpoint = process.env.R2_ENDPOINT_URL!;
    if (!this.bucketName || !this.endpoint) {
      throw new Error(
        "R2 configuration missing. Please check environment variables."
      );
    }
    this.client = new S3Client({
      region: "auto",
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  private sanitizeFileName(fileName: string): string {
    // Remove unsafe characters, keep extension
    const base = fileName.replace(/[^a-zA-Z0-9-_\.]/g, "_");
    return base;
  }

  private simpleSlug(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private generateKey(
    fileName: string,
    folder?: string,
    tenantId?: string | number,
    tenantName?: string
  ): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 10);
    const sanitized = this.sanitizeFileName(fileName);
    let key = "";
    if (tenantId) {
      let slug = tenantName ? this.simpleSlug(tenantName) : undefined;
      key += `tenants/${tenantId}${slug ? `-${slug}` : ""}/`;
    }
    if (folder) key += `${folder}/`;
    key += `${timestamp}_${random}_${sanitized}`;
    return key;
  }

  async uploadFile(
    options: FileUploadOptions & { tenantName?: string }
  ): Promise<FileUploadResult> {
    const { file, fileName, contentType, folder, tenantId, tenantName } =
      options;
    if (!file || !fileName || !contentType) {
      return {
        success: false,
        error: "Missing file, fileName, or contentType.",
      };
    }
    // Edge: Only allow certain types (for images, extend as needed)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(contentType)) {
      return { success: false, error: "Unsupported file type." };
    }
    // Edge: Max size 5MB (configurable)
    const maxSize = 5 * 1024 * 1024;
    const size = file instanceof File ? file.size : (file as Buffer).length;
    if (size > maxSize) {
      return { success: false, error: "File too large. Max 5MB." };
    }
    try {
      const key = this.generateKey(fileName, folder, tenantId, tenantName);
      const body =
        file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: "public-read",
      });
      await this.client.send(command);
      const url = `${this.endpoint.replace(/\/$/, "")}/${
        this.bucketName
      }/${key}`;
      return { success: true, url, key };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Upload failed",
      };
    }
  }

  async deleteFile(key: string): Promise<FileUploadResult> {
    if (!key) return { success: false, error: "Missing key." };
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.client.send(command);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Delete failed",
      };
    }
  }

  // Convenience for logo uploads
  async uploadLogo(
    file: File,
    tenantId: string | number,
    tenantName: string
  ): Promise<FileUploadResult> {
    return this.uploadFile({
      file,
      fileName: file.name,
      contentType: file.type,
      folder: "images",
      tenantId,
      tenantName,
    });
  }
}

export const r2FileUploadService = new R2FileUploadService();

// R2_BUCKET_NAME=tenants
// folder path in the cloud
// /tenants/tenantId/images/ - logos, tenant images
// /tenants/tenantId/documents/ - tenant documents
