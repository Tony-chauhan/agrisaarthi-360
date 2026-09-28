"use client";

import {
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MIN_IMAGE_DIMENSION,
} from "@/lib/crop-health/types";

/**
 * CLIENT-SIDE IMAGE GATE
 *
 * Validates type (magic bytes, not extension) and size before anything
 * is sent. Optional canvas downscale keeps large phone photos manageable
 * while preserving enough resolution for visible symptoms.
 */

export interface PreparedImage {
  /** Base64 without the data: prefix, ready for a provider payload. */
  base64: string;
  mimeType: string;
  previewUrl: string;
  fileName: string;
  fileSizeBytes: number;
  width: number;
  height: number;
}

export type ImagePreparationResult =
  | { status: "ready"; image: PreparedImage }
  | { status: "invalid"; reason: string };

/* ------------------------------------------------------------------ */
/* Magic-byte sniffing — never trust the file extension                */
/* ------------------------------------------------------------------ */

/** Exported for deterministic verification of the type gate. */
export async function detectMimeType(file: File): Promise<string | null> {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const hex = Array.from(header)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (hex.startsWith("ffd8ff")) return "image/jpeg";
  if (hex.startsWith("89504e47")) return "image/png";
  // RIFF....WEBP
  if (
    hex.startsWith("52494646") &&
    hex.slice(16, 24) === "57454250"
  ) {
    return "image/webp";
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Dimension probe                                                     */
/* ------------------------------------------------------------------ */

function readDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("unreadable"));
    img.src = url;
  });
}

/* ------------------------------------------------------------------ */
/* Optional downscale (long edge ≤ 1568px keeps symptoms visible)      */
/* ------------------------------------------------------------------ */

const MAX_LONG_EDGE = 1568;

async function downscale(
  file: File,
  mime: string
): Promise<{ base64: string; mimeType: string; previewUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const { width, height } = await readDimensions(objectUrl);

    if (Math.max(width, height) <= MAX_LONG_EDGE) {
      // Small enough — send the original bytes untouched.
      const buf = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buf);
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      return {
        base64: btoa(binary),
        mimeType: mime,
        previewUrl: objectUrl, // transferred to caller
      };
    }

    const scale = MAX_LONG_EDGE / Math.max(width, height);
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    const img = new Image();
    img.src = objectUrl;
    await new Promise((res) => (img.onload = res));
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    return {
      base64: dataUrl.replace(/^data:image\/jpeg;base64,/, ""),
      mimeType: "image/jpeg",
      previewUrl: dataUrl,
    };
  } finally {
    // Only clean up immediately when NOT returning the objectUrl.
    // The caller owns the returned previewUrl; object URL created above is
    // revoked on reset in the page. (No double-revoking here.)
  }
}

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export async function prepareImage(file: File): Promise<ImagePreparationResult> {
  // 1. Type check — real MIME via magic bytes.
  const mime = await detectMimeType(file);
  if (!mime || !(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(mime)) {
    return {
      status: "invalid",
      reason: "Unsupported file type. Please upload a JPEG, PNG or WEBP image.",
    };
  }

  // 2. Size check.
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      status: "invalid",
      reason:
        "Image is too large. Please upload an image under 5 MB (your camera app can usually export a smaller size).",
    };
  }

  // 3. Dimension probe — catch obviously unusable images.
  const objectUrl = URL.createObjectURL(file);
  let width = 0;
  let height = 0;
  try {
    ({ width, height } = await readDimensions(objectUrl));
  } catch {
    URL.revokeObjectURL(objectUrl);
    return {
      status: "invalid",
      reason: "This file could not be read as an image. Please upload a clearer leaf or crop image.",
    };
  }
  URL.revokeObjectURL(objectUrl);

  if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
    return {
      status: "invalid",
      reason:
        "Image resolution is too low for a reliable visual assessment. Please upload a clearer leaf or crop image.",
    };
  }

  // 4. Optional downscale for large photos.
  const prepared = await downscale(file, mime);
  const previewUrl =
    prepared.previewUrl || URL.createObjectURL(file);

  return {
    status: "ready",
    image: {
      base64: prepared.base64,
      mimeType: prepared.mimeType,
      previewUrl,
      fileName: file.name,
      fileSizeBytes: file.size,
      width,
      height,
    },
  };
}
