"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { settingsService } from "../../../../../service/settings/settingsService";

export default function StoreProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [store, setStore] = useState({
    storeName: "VOLTLINE STORE",
    tagline: "Certified Electrical Supplies & Parts",
    supportEmail: "support@voltline.in",
    supportPhone: "+91 98765 43210",
    whatsappNumber: "+91 98765 43210",
    officeAddress: "Sector V, Salt Lake",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700091",
    gstin: "19AAACV1234F1Z5",
  });

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true);
        const data = await settingsService.get();
        if (data) {
          setStore({
            storeName: data.storeName || "VOLTLINE STORE",
            tagline: data.tagline || "Certified Electrical Supplies & Parts",
            supportEmail: data.supportEmail || "support@voltline.in",
            supportPhone: data.supportPhone || "+91 98765 43210",
            whatsappNumber: data.whatsappNumber || "+91 98765 43210",
            officeAddress: data.officeAddress || "Sector V, Salt Lake",
            city: data.city || "Kolkata",
            state: data.state || "West Bengal",
            pincode: data.pincode || "700091",
            gstin: data.gstin || "19AAACV1234F1Z5",
          });
        }
      } catch (err) {
        console.error("Failed to load store settings:", err);
        toast.error("Could not load current store profile");
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.update({
        storeName: store.storeName,
        tagline: store.tagline,
        supportEmail: store.supportEmail,
        supportPhone: store.supportPhone,
        whatsappNumber: store.whatsappNumber,
        officeAddress: store.officeAddress,
        city: store.city,
        state: store.state,
        pincode: store.pincode,
        gstin: store.gstin,
      });
      toast.success("Store profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update store profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">Store Profile</h1>
        <p className="text-sm text-base-content/70">
          Public business details, contact information, warehouse address, and official GSTIN shown across customer invoices and mobile app.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Store / Company Name</span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={store.storeName}
                onChange={(e) => setStore({ ...store, storeName: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Store Tagline</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={store.tagline}
                onChange={(e) => setStore({ ...store, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Support Email</span>
              </label>
              <input
                type="email"
                required
                className="input input-bordered w-full"
                value={store.supportEmail}
                onChange={(e) => setStore({ ...store, supportEmail: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Support Phone</span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={store.supportPhone}
                onChange={(e) => setStore({ ...store, supportPhone: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">WhatsApp Number</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={store.whatsappNumber}
                onChange={(e) => setStore({ ...store, whatsappNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Warehouse / Office Address</span>
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full"
              value={store.officeAddress}
              onChange={(e) => setStore({ ...store, officeAddress: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">City</span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={store.city}
                onChange={(e) => setStore({ ...store, city: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">State</span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={store.state}
                onChange={(e) => setStore({ ...store, state: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Zip / Postal Code</span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={store.pincode}
                onChange={(e) => setStore({ ...store, pincode: e.target.value })}
              />
            </div>
          </div>

          <div className="form-control max-w-sm">
            <label className="label">
              <span className="label-text font-semibold">Official GSTIN (Tax Identification)</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full font-mono uppercase"
              value={store.gstin}
              onChange={(e) => setStore({ ...store, gstin: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="card-actions justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-sm px-6"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
