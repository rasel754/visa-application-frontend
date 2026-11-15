import { PreprocessedImageResult } from "./types";

const MAX_IMAGE_WIDTH = 1600;

/**
 * Loads an image File or Blob into an HTMLImageElement
 */
export function loadImageElement(file: Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for preprocessing: " + String(err)));
    };
    img.src = url;
  });
}

/**
 * Applies grayscale, contrast boost, and unsharp mask convolution to ImageData.
 * Keeps characters sharp and crisp for Tesseract OCR.
 */
export function enhanceImageDataForOCR(imageData: ImageData, contrastBoost = 45): ImageData {
  const { width, height, data } = imageData;
  const gray = new Uint8ClampedArray(width * height);

  // 1. Convert to grayscale and calculate min/max for contrast stretching
  let minLum = 255;
  let maxLum = 0;

  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    // Standard luminosity weights
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    gray[j] = lum;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  // 2. Contrast adjustment factor
  // factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  const factor = (259 * (contrastBoost + 255)) / (255 * (259 - contrastBoost));
  const contrastLUT = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) {
    const adjusted = factor * (v - 128) + 128;
    contrastLUT[v] = Math.max(0, Math.min(255, Math.round(adjusted)));
  }

  // 3. 3x3 Sharpening Kernel:
  // [  0, -1,  0 ]
  // [ -1,  5, -1 ]
  // [  0, -1,  0 ]
  const output = new ImageData(width, height);
  const outData = output.data;

  for (let y = 0; y < height; y++) {
    const yOffset = y * width;
    const isEdgeY = y === 0 || y === height - 1;

    for (let x = 0; x < width; x++) {
      const idx = yOffset + x;
      const pixelIdx = idx * 4;

      if (isEdgeY || x === 0 || x === width - 1) {
        // Border pixels: direct contrast-adjusted grayscale
        const val = contrastLUT[gray[idx]!]!;
        outData[pixelIdx] = val;
        outData[pixelIdx + 1] = val;
        outData[pixelIdx + 2] = val;
        outData[pixelIdx + 3] = 255;
        continue;
      }

      // Center pixel and orthogonal neighbors
      const center = gray[idx]!;
      const up = gray[idx - width]!;
      const down = gray[idx + width]!;
      const left = gray[idx - 1]!;
      const right = gray[idx + 1]!;

      const sharpened = 5 * center - (up + down + left + right);
      const clampedSharpened = Math.max(0, Math.min(255, sharpened));
      const finalVal = contrastLUT[clampedSharpened]!;

      outData[pixelIdx] = finalVal;
      outData[pixelIdx + 1] = finalVal;
      outData[pixelIdx + 2] = finalVal;
      outData[pixelIdx + 3] = 255;
    }
  }

  return output;
}

/**
 * Preprocesses an input image file for OCR:
 * - Keeps original clean File untouched for eventual upload.
 * - Scales down to max 1600px width.
 * - Applies grayscale + contrast boost + sharpening on an offscreen canvas.
 * - Optionally generates a crop canvas for the bottom 32% (MRZ zone).
 */
export async function preprocessImage(
  file: File,
  options: {
    createMrzCrop?: boolean;
    mrzZoneHeightRatio?: number; // default 0.32 (bottom 32%)
    contrastBoost?: number;
  } = {},
): Promise<PreprocessedImageResult> {
  const {
    createMrzCrop = false,
    mrzZoneHeightRatio = 0.32,
    contrastBoost = 45,
  } = options;

  const img = await loadImageElement(file);

  // Compute scaled dimensions preserving aspect ratio
  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  if (targetWidth > MAX_IMAGE_WIDTH) {
    const ratio = MAX_IMAGE_WIDTH / targetWidth;
    targetWidth = MAX_IMAGE_WIDTH;
    targetHeight = Math.round(targetHeight * ratio);
  }

  // Create full-size offscreen canvas
  const fullCanvas = document.createElement("canvas");
  fullCanvas.width = targetWidth;
  fullCanvas.height = targetHeight;
  const ctx = fullCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to create 2D canvas context for image preprocessing");
  }

  // Draw scaled image
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Extract ImageData and enhance for OCR
  const originalImageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const enhancedImageData = enhanceImageDataForOCR(originalImageData, contrastBoost);
  ctx.putImageData(enhancedImageData, 0, 0);

  // Generate MRZ crop if requested
  let mrzCropCanvas: HTMLCanvasElement | undefined;
  if (createMrzCrop) {
    mrzCropCanvas = document.createElement("canvas");
    const cropHeight = Math.round(targetHeight * mrzZoneHeightRatio);
    const startY = targetHeight - cropHeight;

    mrzCropCanvas.width = targetWidth;
    mrzCropCanvas.height = cropHeight;

    const mrzCtx = mrzCropCanvas.getContext("2d", { willReadFrequently: true });
    if (mrzCtx) {
      // Draw bottom region from enhanced full canvas
      mrzCtx.drawImage(
        fullCanvas,
        0,
        startY,
        targetWidth,
        cropHeight,
        0,
        0,
        targetWidth,
        cropHeight,
      );
    }
  }

  const previewUrl = URL.createObjectURL(file);

  return {
    cleanFile: file,
    previewUrl,
    fullCanvas,
    mrzCropCanvas,
  };
}
