// Browser-only helper. Turns a picked file into a web-safe JPEG data URL:
// iPhone HEIC photos are decoded via heic2any, everything is downscaled to
// keep uploads small, and the result is JPEG so it displays in every
// browser (Chrome can't render HEIC, which is why raw iPhone uploads were
// invisible before).

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  // iOS sometimes sends an empty MIME type, so fall back to the extension.
  return /\.(heic|heif)$/i.test(file.name);
}

async function toBitmapSource(file: File): Promise<Blob> {
  if (!isHeic(file)) return file;
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: JPEG_QUALITY,
  });
  return Array.isArray(converted) ? converted[0] : converted;
}

export async function fileToJpegDataUrl(file: File): Promise<string> {
  const source = await toBitmapSource(file);
  const bitmap = await createImageBitmap(source);

  let { width, height } = bitmap;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process this image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
