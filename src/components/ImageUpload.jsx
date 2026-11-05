"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function ImageUpload({
  value = "",
  file = null,
  onChange,
  onFileSelect,
  label = "Image",
  aspectRatio = "square", // "square" | "banner" | "wide"
  placeholder = "Choose an image file or paste URL",
  disabled = false,
  required = false,
  isUploading = false,
  uploadProgress = 0,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const fileInputRef = useRef(null);

  // Sync or revoke local preview object URL whenever file changes
  useEffect(() => {
    if (file instanceof File || file instanceof Blob) {
      const objUrl = URL.createObjectURL(file);
      setLocalPreview(objUrl);
      return () => {
        URL.revokeObjectURL(objUrl);
      };
    } else {
      setLocalPreview("");
    }
  }, [file]);

  const currentDisplayImage = localPreview || value;
  const isPendingUpload = Boolean(file && !value);

  // Handle file selection (deferred: stores locally, uploads on form submit)
  const handleFileProcess = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP, GIF, SVG)");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum allowed size is 10MB");
      return;
    }

    // Pass the selected file up to parent without uploading to Cloudinary yet
    onFileSelect?.(selectedFile);
    onChange?.("", selectedFile);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e) => {
    const chosen = e.target.files?.[0];
    if (chosen) {
      handleFileProcess(chosen);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;

    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      handleFileProcess(dropped);
    }
  };

  const handleClear = (e) => {
    e?.stopPropagation?.();
    setLocalPreview("");
    onFileSelect?.(null);
    onChange?.("", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="form-control w-full space-y-2">
      {/* Label & URL Toggle */}
      <div className="flex items-center justify-between">
        <label className="label-text font-semibold text-xs text-base-content flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-error">*</span>}
          <span className="badge badge-xs badge-primary/20 text-primary font-mono ml-1">
            FormData
          </span>
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput((prev) => !prev)}
          className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1"
        >
          {showUrlInput ? "📁 Select File Instead" : "🔗 Enter URL Instead"}
        </button>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Mode A: Drag & Drop / File Upload Card */}
      {!showUrlInput && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : currentDisplayImage
              ? "border-success/40 bg-base-200/40 hover:bg-base-200/70"
              : "border-base-300 bg-base-200/30 hover:bg-base-200/60 hover:border-primary/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {/* Active Image Preview Container */}
          {currentDisplayImage ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div
                className={`relative rounded-lg overflow-hidden border border-base-300 shadow-xs bg-base-100 flex items-center justify-center ${
                  aspectRatio === "banner"
                    ? "w-full max-h-48 aspect-[3/1]"
                    : aspectRatio === "wide"
                    ? "w-full max-h-48 aspect-[16/9]"
                    : "w-36 h-36"
                }`}
              >
                <img
                  src={currentDisplayImage}
                  alt="Selected preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                {/* Uploading Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2">
                    <span className="loading loading-spinner loading-md text-primary mb-1"></span>
                    <span className="text-xs font-semibold">
                      Uploading to Cloudinary {uploadProgress > 0 ? `(${uploadProgress}%)` : ""}...
                    </span>
                  </div>
                )}
              </div>

              {/* Status & File Details */}
              <div className="flex flex-col items-center gap-1">
                {file && (
                  <div className="flex items-center gap-1.5 text-xs text-base-content/70">
                    <span className="font-medium truncate max-w-xs">{file.name}</span>
                    <span>({formatFileSize(file.size)})</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {isPendingUpload ? (
                    <span className="badge badge-xs badge-info gap-1 text-[11px]">
                      ⏳ Pending Save (Will upload when you click Save)
                    </span>
                  ) : value ? (
                    <span className="badge badge-xs badge-success gap-1 text-[11px]">
                      ✓ Active Image
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons below preview */}
              <div className="flex items-center gap-2 flex-wrap justify-center pt-1">
                <button
                  type="button"
                  disabled={isUploading || disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="btn btn-xs btn-outline btn-primary"
                >
                  🔄 Change Image
                </button>
                <button
                  type="button"
                  disabled={isUploading || disabled}
                  onClick={handleClear}
                  className="btn btn-xs btn-ghost text-error"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ) : (
            /* Empty State: Choose or Drop */
            <div className="py-4 px-2 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
                {isUploading ? (
                  <span className="loading loading-spinner loading-md"></span>
                ) : (
                  "☁️"
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-base-content">
                  {isUploading
                    ? "Uploading with FormData..."
                    : "Click to choose image or drag & drop"}
                </p>
                <p className="text-xs text-base-content/60 mt-0.5">
                  PNG, JPG, WebP, GIF or SVG (Max 10MB) • Uploads on Save
                </p>
              </div>

              <button
                type="button"
                disabled={isUploading || disabled}
                className="btn btn-xs btn-primary btn-outline mt-1 gap-1"
              >
                <span>📤</span> Browse Image
              </button>
            </div>
          )}

          {/* Upload Progress Bar if active */}
          {isUploading && (
            <div className="w-full mt-3">
              <progress
                className="progress progress-primary w-full h-1.5"
                value={uploadProgress}
                max="100"
              ></progress>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Direct URL Input */}
      {showUrlInput && (
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <input
              type="url"
              value={value || ""}
              onChange={(e) => {
                onFileSelect?.(null);
                onChange?.(e.target.value, null);
              }}
              placeholder="https://images.unsplash.com/photo-..."
              disabled={disabled || isUploading}
              className="input input-bordered input-sm w-full font-mono text-xs focus:input-primary"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-xs btn-ghost text-error"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {value && (
            <div className="flex items-center gap-3 p-2 bg-base-200/50 rounded-lg border border-base-300">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-base-300 shrink-0">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="text-xs text-base-content/70 truncate flex-1 font-mono">
                {value}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
