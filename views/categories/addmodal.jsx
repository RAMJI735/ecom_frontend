"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Popular icons/emojis for electrical & appliance services
const POPULAR_ICONS = ["⚡", "❄️", "🔧", "🧺", "🍳", "📺", "💡", "🔌", "🛠️", "🌪️", "🎛️", "🚿"];

export default function AddModal({ isOpen, onClose, onSave, categoryToEdit = null, loading = false }) {
  const initialFormState = {
    categoryName: "",
    description: "",
    icon: "⚡",
    image: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        categoryName: categoryToEdit.categoryName || categoryToEdit.name || "",
        description: categoryToEdit.description || "",
        icon: categoryToEdit.icon || "⚡",
        image: categoryToEdit.image || "",
        status: categoryToEdit.status || "active",
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const trimmedName = formData.categoryName.trim();

    if (!trimmedName) {
      newErrors.categoryName = "Category name is required";
    } else if (trimmedName.length < 2) {
      newErrors.categoryName = "Category name must be at least 2 characters long";
    } else if (trimmedName.length > 100) {
      newErrors.categoryName = "Category name cannot exceed 100 characters";
    }

    if (formData.status && !["active", "inactive"].includes(formData.status)) {
      newErrors.status = "Status must be either 'active' or 'inactive'";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleIconSelect = (icon) => {
    setFormData((prev) => ({ ...prev, icon }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in the required fields correctly");
      return;
    }

    const payload = {
      categoryName: formData.categoryName.trim(),
      description: formData.description.trim(),
      icon: formData.icon.trim(),
      image: formData.image.trim(),
      status: formData.status,
    };

    try {
      await onSave(payload, categoryToEdit?._id || categoryToEdit?.id);
    } catch (err) {
      // error handling is managed in onSave callback
    }
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-xl p-6 bg-base-100 border border-base-300 shadow-2xl relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="font-bold text-xl text-base-content flex items-center gap-2">
            <span>{categoryToEdit ? "✏️ Edit Category" : "✨ Add New Service Category"}</span>
          </h3>
          <p className="text-sm text-base-content/60 mt-1">
            {categoryToEdit
              ? "Update category details and availability status."
              : "Create a new classification category for electrical & appliance services."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Name */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">
                Category Name <span className="text-error">*</span>
              </span>
              <span className="label-text-alt text-base-content/50">
                {formData.categoryName.length}/100
              </span>
            </label>
            <input
              type="text"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              placeholder="e.g. Air Conditioning & Cooling"
              className={`input input-bordered w-full transition ${
                errors.categoryName ? "input-error" : "focus:input-primary"
              }`}
              disabled={loading}
              maxLength={100}
              autoFocus
            />
            {errors.categoryName && (
              <span className="text-error text-xs mt-1">{errors.categoryName}</span>
            )}
          </div>

          {/* Icon Selection */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">Select Icon / Emoji</span>
              <span className="label-text-alt text-base-content/50">Pick or type custom</span>
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="⚡"
                className="input input-bordered w-24 text-center text-xl"
                disabled={loading}
              />
              <div className="flex-1 flex flex-wrap gap-1.5 p-2 bg-base-200/60 rounded-lg border border-base-300">
                {POPULAR_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => handleIconSelect(ic)}
                    disabled={loading}
                    className={`btn btn-xs btn-ghost text-base ${
                      formData.icon === ic ? "btn-active bg-primary/20 text-primary border border-primary/40" : ""
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">Description</span>
              <span className="label-text-alt text-base-content/50">Optional</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Provide a brief summary of what services belong to this category..."
              className="textarea textarea-bordered w-full focus:textarea-primary transition"
              disabled={loading}
            ></textarea>
          </div>

          {/* Image URL & Preview */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">Cover Image URL</span>
              <span className="label-text-alt text-base-content/50">Optional URL</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="input input-bordered flex-1 focus:input-primary"
                disabled={loading}
              />
              {formData.image && (
                <div className="avatar">
                  <div className="w-12 h-12 rounded-lg ring ring-primary ring-offset-base-100 ring-offset-1">
                    <img
                      src={formData.image}
                      alt="Category Preview"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Selection */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">Status</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  formData.status === "active"
                    ? "border-success bg-success/10 text-success font-medium"
                    : "border-base-300 hover:bg-base-200/50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === "active"}
                  onChange={handleChange}
                  className="radio radio-success radio-sm"
                  disabled={loading}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Active</span>
                  <span className="text-xs opacity-70">Visible to customers</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  formData.status === "inactive"
                    ? "border-error bg-error/10 text-error font-medium"
                    : "border-base-300 hover:bg-base-200/50"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === "inactive"}
                  onChange={handleChange}
                  className="radio radio-error radio-sm"
                  disabled={loading}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Inactive</span>
                  <span className="text-xs opacity-70">Hidden from catalog</span>
                </div>
              </label>
            </div>
            {errors.status && (
              <span className="text-error text-xs mt-1">{errors.status}</span>
            )}
          </div>

          {/* Modal Actions */}
          <div className="modal-action pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary min-w-32 shadow-sm"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : categoryToEdit ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={loading ? undefined : onClose}></div>
    </div>
  );
}
