import sharp from "sharp";

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 1-100
  format?: "jpeg" | "png" | "webp";
}

/**
 * Optimize an image buffer: resize, compress, and convert format.
 * @param inputBuffer The original image buffer
 * @param options Optimization options
 * @returns Optimized image buffer
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  options: OptimizeOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 512,
    maxHeight = 512,
    quality = 80,
    format = "jpeg",
  } = options;

  let pipeline = sharp(inputBuffer).resize({
    width: maxWidth,
    height: maxHeight,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (format === "jpeg") {
    pipeline = pipeline.jpeg({ quality });
  } else if (format === "png") {
    pipeline = pipeline.png({ quality });
  } else if (format === "webp") {
    pipeline = pipeline.webp({ quality });
  }

  return pipeline.toBuffer();
}

export const LOGO_PRESET: OptimizeOptions = {
  maxWidth: 256,
  maxHeight: 256,
  quality: 85,
  format: "png",
};
