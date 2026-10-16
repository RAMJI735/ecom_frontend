"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { categoryService } from "../../service/category/categoryService";

const DURATION_PRESETS = ["30 Mins", "1 Hour", "1-2 Hours", "2-3 Hours", "3-5 Hours", "Same Day"];
const WARRANTY_PRESETS = ["No Warranty", "30 Days", "90 Days", "6 Months", "1 Year"];

export default function AddServiceModal({
  isOpen,
  onClose,
  onSave,
  serviceToEdit = null,
  categories = [],
  loading = false,
}) {
  const initialFormState = {
    serviceName: "",
    category: "",
    brand: "",
    model: "",
    description: "",
    price: "",
    estimated_time: "1-2 Hours",
    warranty: "90 Days",
    image: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [categoryList, setCategoryList] = useState(categories);

  // Fetch categories to ensure _id is always available
  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoryList(categories);
    } else {
      categoryService.read().then((res) => {
        const list = Array.isArray(res) ? res : res?.data || res?.categories || [];
        setCategoryList(list);
      }).catch((err) => {
        console.error("Failed to load categories in modal:", err);
      });
    }
  }, [categories, isOpen]);

  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        serviceName: serviceToEdit.serviceName || serviceToEdit.name || "",
        category:
          typeof serviceToEdit.category === "object"
            ? serviceToEdit.category?._id || serviceToEdit.category?.id || ""
            : serviceToEdit.category || "",
        brand: serviceToEdit.brand || "",
        model: serviceToEdit.model || "",
        description: serviceToEdit.description || "",
        price: serviceToEdit.price !== undefined ? serviceToEdit.price : "",
        estimated_time:
          serviceToEdit.estimated_time || serviceToEdit.estimatedTime || "1-2 Hours",
        warranty: serviceToEdit.warranty || "90 Days",
        image: serviceToEdit.image || "",
        status: serviceToEdit.status || "active",
      });
    } else {
      const firstCat = categoryList[0] || categories[0];
      setFormData({
        ...initialFormState,
        category: firstCat ? (firstCat._id || firstCat.id) : "",
      });
    }
    setErrors({});
  }, [serviceToEdit, isOpen, categoryList, categories]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const trimmedName = formData.serviceName.trim();

    if (!trimmedName) {
      newErrors.serviceName = "Service name is required";
    } else if (trimmedName.length < 2) {
      newErrors.serviceName = "Service name must be at least 2 characters long";
    } else if (trimmedName.length > 150) {
      newErrors.serviceName = "Service name cannot exceed 150 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a service category";
    }

    if (formData.price === "" || formData.price === null || isNaN(formData.price)) {
      newErrors.price = "Valid service price is required";
    } else if (Number(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in all required fields properly");
      return;
    }

    const payload = {
      serviceName: formData.serviceName.trim(),
      category: formData.category,
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      estimated_time: formData.estimated_time.trim(),
      warranty: formData.warranty.trim(),
      image: formData.image.trim(),
      status: formData.status,
    };

    try {
      await onSave(payload, serviceToEdit?._id || serviceToEdit?.id);
    } catch (err) {
      // error handling is in onSave
    }
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-2xl p-6 bg-base-100 border border-base-300 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
            <span>{serviceToEdit ? "🔧 Edit Service" : "✨ Add New Service"}</span>
          </h3>
          <p className="text-sm text-base-content/60 mt-1">
            {serviceToEdit
              ? "Update service package details, pricing, warranty and specifications."
              : "Register a new technical repair or maintenance offering to the service catalog."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Name */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">
                Service Name <span className="text-error">*</span>
              </span>
              <span className="label-text-alt text-base-content/50">
                {formData.serviceName.length}/150
              </span>
            </label>
            <input
              type="text"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              placeholder="e.g. Split AC Deep Cleaning & Servicing"
              className={`input input-bordered w-full transition ${
                errors.serviceName ? "input-error" : "focus:input-primary"
              }`}
              disabled={loading}
              maxLength={150}
              autoFocus
            />
            {errors.serviceName && (
              <span className="text-error text-xs mt-1">{errors.serviceName}</span>
            )}
          </div>

          {/* Category & Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-base-content">
                  Category <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`select select-bordered w-full ${
                  errors.category ? "select-error" : "focus:select-primary"
                }`}
                disabled={loading}
              >
                <option value="">-- Select Category --</option>
                {categoryList.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.icon ? `${cat.icon} ` : ""}{cat.categoryName || cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="text-error text-xs mt-1">{errors.category}</span>
              )}
            </div>

            {/* Price */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-base-content">
                  Service Price (₹/$) <span className="text-error">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 499"
                  className={`input input-bordered w-full pl-8 font-mono ${
                    errors.price ? "input-error" : "focus:input-primary"
                  }`}
                  disabled={loading}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 font-bold">
                  ₹
                </span>
              </div>
              {errors.price && (
                <span className="text-error text-xs mt-1">{errors.price}</span>
              )}
            </div>
          </div>

          {/* Brand & Model Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-base-content">Applicable Brand</span>
                <span className="label-text-alt text-base-content/50">Optional</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Daikin, LG, Samsung, or All Brands"
                className="input input-bordered w-full focus:input-primary"
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-base-content">Device Model / Spec</span>
                <span className="label-text-alt text-base-content/50">Optional</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. 1.5 Ton Inverter / Front Load"
                className="input input-bordered w-full focus:input-primary"
                disabled={loading}
              />
            </div>
          </div>

          {/* Estimated Time & Quick Selector */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">Estimated Duration</span>
              <span className="label-text-alt text-base-content/50">e.g. 1-2 Hours</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                name="estimated_time"
                value={formData.estimated_time}
                onChange={handleChange}
                placeholder="e.g. 1-2 Hours"
                className="input input-bordered flex-1 focus:input-primary"
                disabled={loading}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, estimated_time: preset }))}
                  disabled={loading}
                  className={`btn btn-xs ${
                    formData.estimated_time === preset ? "btn-primary" : "btn-ghost border border-base-300"
                  }`}
                >
                  ⏱️ {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Warranty & Quick Selector */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">Warranty / Guarantee</span>
              <span className="label-text-alt text-base-content/50">e.g. 90 Days Service Warranty</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                placeholder="e.g. 90 Days"
                className="input input-bordered flex-1 focus:input-primary"
                disabled={loading}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {WARRANTY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, warranty: preset }))}
                  disabled={loading}
                  className={`btn btn-xs ${
                    formData.warranty === preset ? "btn-secondary" : "btn-ghost border border-base-300"
                  }`}
                >
                  🛡️ {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">Service Description</span>
              <span className="label-text-alt text-base-content/50">Optional</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="What does this service include? (e.g. Filter cleaning, coil wash, electrical checkup...)"
              className="textarea textarea-bordered w-full focus:textarea-primary transition"
              disabled={loading}
            ></textarea>
          </div>

          {/* Image URL & Preview */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold text-base-content">Service Image URL</span>
              <span className="label-text-alt text-base-content/50">Optional image link</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="input input-bordered flex-1 focus:input-primary"
                disabled={loading}
              />
              {formData.image && (
                <div className="avatar">
                  <div className="w-12 h-12 rounded-lg ring ring-primary ring-offset-base-100 ring-offset-1">
                    <img
                      src={formData.image}
                      alt="Preview"
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
                  <span className="text-xs opacity-70">Bookable by customers</span>
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
                  <span className="text-xs opacity-70">Temporarily unavailable</span>
                </div>
              </label>
            </div>
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
              ) : serviceToEdit ? (
                "Update Service"
              ) : (
                "Create Service"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop */}
      <div
        className="modal-backdrop bg-black/40 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      ></div>
    </div>
  );
}
