"use client";

import { useState, useEffect } from "react";

const COMMON_SPECIALIZATIONS = [
  "General Electrical",
  "Residential Wiring",
  "HVAC & AC Repair",
  "Circuit Breakers & Panels",
  "Solar & Inverters",
  "Appliance Repair",
  "Commercial / Industrial",
  "Emergency Short Circuit",
];

export default function AddTechnicianModal({
  isOpen,
  onClose,
  onSubmit,
  technicianToEdit = null,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: ["General Electrical"],
    status: "active",
    avatar: "",
  });

  const [customSpec, setCustomSpec] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (technicianToEdit) {
      setFormData({
        name: technicianToEdit.name || "",
        email: technicianToEdit.email || "",
        phone: technicianToEdit.phone || "",
        specialization: Array.isArray(technicianToEdit.specialization) && technicianToEdit.specialization.length > 0
          ? technicianToEdit.specialization
          : ["General Electrical"],
        status: technicianToEdit.status || "active",
        avatar: technicianToEdit.avatar || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: ["General Electrical"],
        status: "active",
        avatar: "",
      });
    }
    setErrors({});
    setCustomSpec("");
  }, [technicianToEdit, isOpen]);

  if (!isOpen) return null;

  const handleToggleSpec = (spec) => {
    setFormData((prev) => {
      const exists = prev.specialization.includes(spec);
      if (exists) {
        // Keep at least one specialization
        if (prev.specialization.length === 1) return prev;
        return { ...prev, specialization: prev.specialization.filter((s) => s !== spec) };
      } else {
        return { ...prev, specialization: [...prev.specialization, spec] };
      }
    });
  };

  const handleAddCustomSpec = (e) => {
    e.preventDefault();
    const trimmed = customSpec.trim();
    if (!trimmed) return;
    if (!formData.specialization.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        specialization: [...prev.specialization, trimmed],
      }));
    }
    setCustomSpec("");
  };

  const handleRemoveSpec = (spec) => {
    if (formData.specialization.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.filter((s) => s !== spec),
    }));
  };

  const validate = () => {
    const errs = {};
    const name = formData.name.trim();
    if (!name) {
      errs.name = "Full name is required";
    } else if (name.length < 2) {
      errs.name = "Full name must be at least 2 characters long";
    } else if (name.length > 100) {
      errs.name = "Full name cannot exceed 100 characters";
    }

    const email = formData.email.trim();
    if (!email) {
      errs.email = "Email is required";
    } else if (email.length < 5) {
      errs.email = "Email must be at least 5 characters long";
    } else if (email.length > 100) {
      errs.email = "Email cannot exceed 100 characters";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Invalid email format";
    }

    const phone = formData.phone.trim();
    if (!phone) {
      errs.phone = "Phone number is required";
    } else if (phone.length < 7) {
      errs.phone = "Phone number must be at least 7 digits";
    } else if (phone.length > 15) {
      errs.phone = "Phone number cannot exceed 15 digits";
    }

    if (formData.avatar && formData.avatar.trim().length > 500) {
      errs.avatar = "Avatar URL cannot exceed 500 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-xl p-0 overflow-hidden bg-base-100 shadow-2xl border border-base-300">
        {/* Header */}
        <div className="p-5 border-b border-base-200 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
              👷
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content leading-tight">
                {technicianToEdit ? "Edit Technician" : "Add New Technician"}
              </h3>
              <p className="text-xs text-base-content/60">
                {technicianToEdit
                  ? "Update technician information, specialty and status"
                  : "Register a certified field electrician or technician"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto [scrollbar-width:thin]">
            {/* Avatar & Basic Preview */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-base-200/40 border border-base-200">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-14 h-14 text-lg font-bold uppercase shadow-sm">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="rounded-full object-cover" />
                  ) : (
                    formData.name ? formData.name.slice(0, 2) : "TC"
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-base-content/70 block mb-1">
                  Avatar Image URL (Optional)
                </label>
                <input
                  type="url"
                  maxLength={500}
                  placeholder="https://images.unsplash.com/..."
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="input input-bordered input-sm w-full focus:input-primary"
                />
              </div>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content">
                    Full Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  minLength={2}
                  maxLength={100}
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`input input-bordered input-sm w-full focus:input-primary ${
                    errors.name ? "input-error" : ""
                  }`}
                />
                {errors.name && (
                  <span className="text-error text-xs mt-1">{errors.name}</span>
                )}
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content">
                    Phone Number <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="tel"
                  minLength={7}
                  maxLength={15}
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`input input-bordered input-sm w-full focus:input-primary ${
                    errors.phone ? "input-error" : ""
                  }`}
                />
                {errors.phone && (
                  <span className="text-error text-xs mt-1">{errors.phone}</span>
                )}
              </div>
            </div>

            {/* Email & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content">
                    Email Address <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="email"
                  minLength={5}
                  maxLength={100}
                  placeholder="e.g. ramesh@electrocare.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`input input-bordered input-sm w-full focus:input-primary ${
                    errors.email ? "input-error" : ""
                  }`}
                />
                {errors.email && (
                  <span className="text-error text-xs mt-1">{errors.email}</span>
                )}
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content">
                    Active Availability
                  </span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="select select-bordered select-sm w-full focus:select-primary"
                >
                  <option value="active">Active (Available for Dispatch)</option>
                  <option value="inactive">Inactive / On Leave</option>
                </select>
              </div>
            </div>

            {/* Specializations */}
            <div className="form-control pt-1">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs text-base-content">
                  Specializations / Skills
                </span>
                <span className="label-text-alt text-base-content/60 text-xs">
                  Select one or more
                </span>
              </label>

              {/* Quick Preset Badges */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {COMMON_SPECIALIZATIONS.map((spec) => {
                  const isSelected = formData.specialization.includes(spec);
                  return (
                    <button
                      type="button"
                      key={spec}
                      onClick={() => handleToggleSpec(spec)}
                      className={`badge badge-sm py-2 px-2.5 cursor-pointer transition-colors ${
                        isSelected
                          ? "badge-primary font-medium"
                          : "badge-outline opacity-75 hover:opacity-100"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {spec}
                    </button>
                  );
                })}
              </div>

              {/* Custom Specialization Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom specialty (e.g. CCTV & Security)"
                  value={customSpec}
                  onChange={(e) => setCustomSpec(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSpec(e);
                    }
                  }}
                  className="input input-bordered input-sm flex-1 focus:input-primary"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSpec}
                  className="btn btn-outline btn-sm"
                >
                  Add
                </button>
              </div>

              {/* Selected List */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {formData.specialization.map((spec) => (
                  <span
                    key={spec}
                    className="badge badge-primary badge-sm gap-1 py-2 px-2.5 shadow-xs"
                  >
                    {spec}
                    {formData.specialization.length > 1 && (
                      <span
                        onClick={() => handleRemoveSpec(spec)}
                        className="cursor-pointer hover:font-bold ml-1 text-xs"
                      >
                        ×
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-base-200 flex items-center justify-end gap-2 bg-base-200/30">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm min-w-28"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Saving...
                </>
              ) : technicianToEdit ? (
                "Update Technician"
              ) : (
                "Create Technician"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
