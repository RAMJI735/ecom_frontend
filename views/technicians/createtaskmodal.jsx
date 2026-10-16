"use client";

import { useState, useEffect } from "react";
import { technicianService } from "@service/technician/technicianService";
import { serviceApi } from "@service/serviceApi/serviceApi";

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    serviceName: "",
    serviceId: "",
    customer: {
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
    },
    priority: "Normal",
    scheduledDate: new Date().toISOString().slice(0, 10),
    estimatedCost: "",
    technicianId: "",
    notes: "",
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setFormData({
        serviceName: "",
        serviceId: "",
        customer: {
          name: "",
          phone: "",
          email: "",
          address: "",
          city: "",
        },
        priority: "Normal",
        scheduledDate: new Date().toISOString().slice(0, 10),
        estimatedCost: "",
        technicianId: "",
        notes: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [techRes, servRes] = await Promise.allSettled([
        technicianService.getAvailable(),
        serviceApi.read({ limit: 100 }),
      ]);

      if (techRes.status === "fulfilled" && techRes.value?.data) {
        setAvailableTechnicians(techRes.value.data);
      }
      if (servRes.status === "fulfilled" && servRes.value) {
        const sList = Array.isArray(servRes.value)
          ? servRes.value
          : servRes.value.data || servRes.value.services || [];
        setAvailableServices(sList);
      }
    } catch (e) {
      console.error("Failed to load options for task modal:", e);
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    const name = formData.customer.name.trim();
    if (!name) {
      errs.name = "Customer name is required";
    } else if (name.length < 2) {
      errs.name = "Customer name must be at least 2 characters";
    } else if (name.length > 100) {
      errs.name = "Customer name cannot exceed 100 characters";
    }

    const phone = formData.customer.phone.trim();
    if (!phone) {
      errs.phone = "Phone number is required";
    } else if (phone.length < 7) {
      errs.phone = "Phone number must be at least 7 digits";
    } else if (phone.length > 15) {
      errs.phone = "Phone number cannot exceed 15 digits";
    }

    const email = formData.customer.email.trim();
    if (email) {
      if (email.length > 100) {
        errs.email = "Email cannot exceed 100 characters";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errs.email = "Invalid email format";
      }
    }

    const sName = formData.serviceName.trim();
    if (!sName && !formData.serviceId) {
      errs.service = "Service name is required";
    } else if (sName && sName.length < 2) {
      errs.service = "Service name must be at least 2 characters";
    } else if (sName && sName.length > 150) {
      errs.service = "Service name cannot exceed 150 characters";
    }

    if (formData.customer.address.trim().length > 300) {
      errs.address = "Address cannot exceed 300 characters";
    }

    if (formData.customer.city.trim().length > 80) {
      errs.city = "City cannot exceed 80 characters";
    }

    if (formData.notes.trim().length > 1000) {
      errs.notes = "Notes cannot exceed 1000 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleServiceSelect = (e) => {
    const sId = e.target.value;
    if (!sId) {
      setFormData((prev) => ({ ...prev, serviceId: "", serviceName: "" }));
      return;
    }
    const found = availableServices.find((s) => s._id === sId);
    setFormData((prev) => ({
      ...prev,
      serviceId: sId,
      serviceName: found ? found.serviceName : prev.serviceName,
      estimatedCost: found?.price ? found.price : prev.estimatedCost,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      serviceId: formData.serviceId || undefined,
      serviceName: formData.serviceName.trim(),
      customer: {
        name: formData.customer.name.trim(),
        phone: formData.customer.phone.trim(),
        email: formData.customer.email.trim(),
        address: formData.customer.address.trim(),
        city: formData.customer.city.trim(),
      },
      priority: formData.priority,
      scheduledDate: formData.scheduledDate,
      estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : 0,
      technicianId: formData.technicianId || undefined,
      notes: formData.notes.trim(),
    };

    onSubmit(payload);
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-xl p-0 overflow-hidden bg-base-100 shadow-2xl border border-base-300">
        {/* Header */}
        <div className="p-5 border-b border-base-200 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
              📋
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content leading-tight">
                New Service Task / Ticket
              </h3>
              <p className="text-xs text-base-content/60">
                Create a service booking or dispatch request
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
            {/* Customer Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                <span>👤 Customer Information</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      Customer Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    minLength={2}
                    maxLength={100}
                    placeholder="e.g. Priya Sharma"
                    value={formData.customer.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, name: e.target.value },
                      })
                    }
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
                    value={formData.customer.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, phone: e.target.value },
                      })
                    }
                    className={`input input-bordered input-sm w-full focus:input-primary ${
                      errors.phone ? "input-error" : ""
                    }`}
                  />
                  {errors.phone && (
                    <span className="text-error text-xs mt-1">{errors.phone}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="form-control sm:col-span-1">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      City / Area
                    </span>
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="e.g. Indiranagar, Bangalore"
                    value={formData.customer.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, city: e.target.value },
                      })
                    }
                    className={`input input-bordered input-sm w-full focus:input-primary ${
                      errors.city ? "input-error" : ""
                    }`}
                  />
                  {errors.city && (
                    <span className="text-error text-xs mt-1">{errors.city}</span>
                  )}
                </div>

                <div className="form-control sm:col-span-2">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      Address Details
                    </span>
                  </label>
                  <input
                    type="text"
                    maxLength={300}
                    placeholder="Flat 304, Palm Heights, Main Road"
                    value={formData.customer.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer: { ...formData.customer, address: e.target.value },
                      })
                    }
                    className={`input input-bordered input-sm w-full focus:input-primary ${
                      errors.address ? "input-error" : ""
                    }`}
                  />
                  {errors.address && (
                    <span className="text-error text-xs mt-1">{errors.address}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="divider my-1" />

            {/* Service & Scheduling */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                <span>🔧 Service & Schedule</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      Catalog Service (Optional)
                    </span>
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={handleServiceSelect}
                    className="select select-bordered select-sm w-full focus:select-primary"
                  >
                    <option value="">-- Custom Service Name --</option>
                    {availableServices.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.serviceName} {s.price ? `(₹${s.price})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      Service / Task Title <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    minLength={2}
                    maxLength={150}
                    placeholder="e.g. AC Gas Refill & Compressor Check"
                    value={formData.serviceName}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceName: e.target.value })
                    }
                    className={`input input-bordered input-sm w-full focus:input-primary ${
                      errors.service ? "input-error" : ""
                    }`}
                  />
                  {errors.service && (
                    <span className="text-error text-xs mt-1">{errors.service}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      Priority Level
                    </span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="select select-bordered select-sm w-full focus:select-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Emergency)</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      Scheduled Date
                    </span>
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledDate: e.target.value })
                    }
                    className="input input-bordered input-sm w-full focus:input-primary"
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      Estimated Cost (₹)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedCost: e.target.value })
                    }
                    className="input input-bordered input-sm w-full focus:input-primary"
                  />
                </div>
              </div>
            </div>

            <div className="divider my-1" />

            {/* Direct Technician Dispatch */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-2">
                <span>⚡ Technician Assignment (Optional)</span>
              </h4>

              <div className="form-control">
                <select
                  value={formData.technicianId}
                  onChange={(e) =>
                    setFormData({ ...formData, technicianId: e.target.value })
                  }
                  className="select select-bordered select-sm w-full focus:select-primary"
                >
                  <option value="">-- Assign Later (Mark as Pending) --</option>
                  {availableTechnicians.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({Array.isArray(t.specialization) ? t.specialization.join(", ") : t.specialization}) - {t.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content">
                    Problem Description & Special Notes
                  </span>
                </label>
                <textarea
                  maxLength={1000}
                  placeholder="Detail the issue reported by the customer or special access requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className={`textarea textarea-bordered textarea-sm w-full focus:textarea-primary ${
                    errors.notes ? "textarea-error" : ""
                  }`}
                />
                {errors.notes && (
                  <span className="text-error text-xs mt-1">{errors.notes}</span>
                )}
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
                  Creating...
                </>
              ) : (
                "Create Ticket"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
