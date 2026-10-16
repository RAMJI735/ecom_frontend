"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { categoryService } from "../../../../../service/category/categoryService";
import { serviceApi } from "../../../../../service/serviceApi/serviceApi";

export default function NewServicePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    serviceName: "",
    category: "",
    brand: "",
    model: "",
    price: "",
    estimated_time: "1-2 Hours",
    warranty: "90 Days",
    description: "",
    status: "active",
  });

  // Call category API to get category _id
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.read();
        const list = Array.isArray(res) ? res : res?.data || res?.categories || [];
        setCategories(list);
        if (list.length > 0 && !form.category) {
          setForm((prev) => ({ ...prev, category: list[0]._id || list[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.serviceName.trim()) {
      toast.error("Service name is required");
      return;
    }
    if (!form.category) {
      toast.error("Please select a category");
      return;
    }
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setLoading(true);
    try {
      await serviceApi.create({
        serviceName: form.serviceName.trim(),
        category: form.category,
        brand: form.brand.trim(),
        model: form.model.trim(),
        price: Number(form.price),
        estimated_time: form.estimated_time.trim(),
        warranty: form.warranty.trim(),
        description: form.description.trim(),
        status: form.status,
      });

      toast.success("Service created successfully!");
      router.push("/services");
      router.refresh();
    } catch (err) {
      console.error("Create service error:", err);
      const msg = err.response?.data?.message || "Failed to create service";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-base-content/60">
        <Link href="/services" className="hover:underline">Services</Link>
        <span>/</span>
        <span className="text-base-content font-medium">Add Service</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">Add New Service</h1>
        <p className="text-sm text-base-content/70">Create a new technical service entry in your catalog.</p>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Service Name *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Inverter AC Compressor Repair"
              className="input input-bordered w-full"
              value={form.serviceName}
              onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Category *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.icon ? `${cat.icon} ` : ""}{cat.categoryName || cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Base Price (₹) *</span>
              </label>
              <input
                type="number"
                placeholder="499"
                className="input input-bordered w-full"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Brand (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Daikin, LG, Samsung"
                className="input input-bordered w-full"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Model / Specs (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1.5 Ton Split AC"
                className="input input-bordered w-full"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Estimated Duration</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1-2 Hours"
                className="input input-bordered w-full"
                value={form.estimated_time}
                onChange={(e) => setForm({ ...form, estimated_time: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Warranty</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 90 Days"
                className="input input-bordered w-full"
                value={form.warranty}
                onChange={(e) => setForm({ ...form, warranty: e.target.value })}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Service Details</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Describe what is included in this service..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="card-actions justify-end gap-2 pt-2">
            <Link href="/services" className="btn btn-ghost btn-sm">Cancel</Link>
            <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : (
                "Save Service"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

