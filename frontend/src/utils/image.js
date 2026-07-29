// Accepted image types and max size for hospital photos.
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/bmp"];
export const MAX_IMAGE_MB = 2;

// Reads an image File and resolves to a base64 data URL, or rejects with a readable message.
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file selected."));
    const isImage = file.type.startsWith("image/") && ACCEPTED_IMAGE_TYPES.includes(file.type);
    if (!isImage) return reject(new Error("Only image files are allowed (PNG, JPG, GIF, WEBP, BMP)."));
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return reject(new Error(`Image must be under ${MAX_IMAGE_MB} MB.`));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // "data:image/...;base64,...."
    reader.onerror = () => reject(new Error("Could not read the image. Please try another file."));
    reader.readAsDataURL(file);
  });
}
