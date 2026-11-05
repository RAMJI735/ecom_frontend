import api from "./api";
import axios from "axios";

export const uploadService = {
  /**
   * Helper to extract public_id from a Cloudinary URL
   * @param {string} url
   * @returns {string|null}
   */
  extractPublicId: (url) => {
    if (!url || typeof url !== "string") return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : null;
  },

  /**
   * Upload an image file using FormData.
   * Sends FormData with 'image' and 'file' keys to /api/upload.
   * Falls back to Next.js internal /api/upload if backend is unreachable.
   *
   * @param {File|Blob} file - The file to upload
   * @param {Function} [onProgress] - Optional progress callback (percent: number)
   * @returns {Promise<{ url: string, public_id?: string, data?: any }>}
   */
  uploadImage: async (file, onProgress) => {
    if (!file) {
      throw new Error("No file provided for upload");
    }

    if (!file.type || !file.type.startsWith("image/")) {
      throw new Error("Please select a valid image file (JPEG, PNG, WebP, GIF, SVG)");
    }

    // Limit to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("Image size exceeds the 10MB limit");
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("file", file);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    };

    // Try primary backend endpoint first
    try {
      const response = await api.post("/api/upload", formData, config);
      const url = response.data?.url || response.data?.data?.url;
      const public_id = response.data?.public_id || response.data?.data?.public_id;
      if (!url) {
        throw new Error("Upload response did not return an image URL");
      }
      return { url, public_id, data: response.data };
    } catch (backendError) {
      // If backend was unreachable or returned 404/500, fallback to Next.js route handler
      try {
        const nextResponse = await axios.post("/api/upload", formData, config);
        const url = nextResponse.data?.url || nextResponse.data?.data?.url;
        const public_id = nextResponse.data?.public_id || nextResponse.data?.data?.public_id;
        if (!url) {
          throw new Error("Next.js upload did not return an image URL");
        }
        return { url, public_id, data: nextResponse.data };
      } catch (fallbackError) {
        const msg =
          backendError.response?.data?.message ||
          fallbackError.response?.data?.message ||
          "Failed to upload image. Please check your network connection.";
        throw new Error(msg);
      }
    }
  },

  /**
   * Delete an image from Cloudinary by URL or public_id.
   * Useful when an image is replaced or removed to avoid orphaned storage.
   *
   * @param {string} urlOrPublicId
   * @returns {Promise<any>}
   */
  deleteImage: async (urlOrPublicId) => {
    if (!urlOrPublicId) return null;

    // Only attempt deletion if it's a Cloudinary URL or publicId
    if (urlOrPublicId.includes("http") && !urlOrPublicId.includes("cloudinary.com")) {
      return null;
    }

    const payload = {
      url: urlOrPublicId,
      public_id: urlOrPublicId,
      publicId: urlOrPublicId,
    };

    try {
      const res = await api.delete("/api/upload", { data: payload });
      return res.data;
    } catch {
      try {
        const nextRes = await axios.delete("/api/upload", { data: payload });
        return nextRes.data;
      } catch (err) {
        console.warn("Could not delete previous image from Cloudinary:", err.message);
        return null;
      }
    }
  },
};

export default uploadService;
