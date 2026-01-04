// lib/utils/cloudinary-client.utils.ts
// CLIENT-SIDE ONLY - No Cloudinary SDK imports

/**
 * Upload folder structure (duplicated for client use)
 */
export const CLOUDINARY_FOLDERS = {
  BUSINESS_LOGOS: "businesses/logos",
  BUSINESS_COVERS: "businesses/covers",
  BUSINESS_GALLERY: "businesses/gallery",
} as const;

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload file to Cloudinary (Client-side)
 */
export async function uploadToCloudinary(
  file: File | Blob,
  folder?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<CloudinaryUploadResponse> {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }

    // Upload to our API route
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            onProgress({
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
            });
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error("Failed to parse upload response"));
          }
        } else {
          reject(new Error(xhr.responseText || "Upload failed"));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  } catch (error) {
    console.error("[Cloudinary] Upload error:", error);
    throw error;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Validate file before upload
 */
export function validateFile(file: File | Blob): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPG, PNG, WEBP, and PDF files are allowed",
    };
  }

  return { valid: true };
}

/**
 * Validate image file (stricter - images only)
 */
export function validateImageFile(file: File | Blob): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file size (max 5MB for images)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "Image size must be less than 5MB" };
  }

  // Check file type (images only)
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPG, PNG, and WEBP images are allowed",
    };
  }

  return { valid: true };
}

/**
 * Create image preview URL from file
 */
export function createImagePreview(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to create preview"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Failed to extract public ID:", error);
    return null;
  }
}
