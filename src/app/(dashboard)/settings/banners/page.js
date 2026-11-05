"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { settingsService } from "../../../../../service/settings/settingsService";
import { couponService } from "../../../../../service/coupon/couponService";
import { uploadService } from "../../../../../service/uploadService";
import ImageUpload from "@/components/ImageUpload";

export default function BannersAndOffersPage() {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Banner Modal
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    tag: "HIGH VOLTAGE DEALS",
    buttonText: "SHOP NOW  →",
    targetCategory: "all",
    image: "",
    discountText: "Up to 30% OFF",
    active: true,
  });

  // Coupon Modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 500,
    maxDiscount: "",
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsResult, couponsResult] = await Promise.allSettled([
        settingsService.get(),
        couponService.get(),
      ]);

      if (settingsResult.status === "fulfilled" && settingsResult.value?.heroBanners) {
        setBanners(settingsResult.value.heroBanners);
      } else if (settingsResult.status === "rejected") {
        console.warn("Failed to load banners:", settingsResult.reason?.message);
      }

      if (couponsResult.status === "fulfilled" && Array.isArray(couponsResult.value)) {
        setCoupons(couponsResult.value);
      } else if (couponsResult.status === "rejected") {
        console.warn("Failed to load coupons:", couponsResult.reason?.message);
      }

      if (settingsResult.status === "rejected" && couponsResult.status === "rejected") {
        const isNetworkErr =
          settingsResult.reason?.message === "Network Error" ||
          couponsResult.reason?.message === "Network Error";
        toast.error(
          isNetworkErr
            ? "Cannot connect to backend server. Check NEXT_PUBLIC_BACKEND_URL or start local server."
            : "Failed to load banners or coupons"
        );
      }
    } catch (err) {
      console.error("Failed to load banners and offers:", err);
      toast.error("Failed to load banners or coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Banner Save
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) {
      toast.error("Banner title is required");
      return;
    }

    try {
      setBannerUploading(true);
      let finalImageUrl = bannerForm.image;

      // Only upload to Cloudinary on final submit if a file was selected!
      if (bannerFile) {
        toast.loading("Uploading banner image via FormData...", { id: "banner-upload" });
        const uploadRes = await uploadService.uploadImage(bannerFile);
        finalImageUrl = uploadRes.url;
        toast.success("Image uploaded successfully!", { id: "banner-upload" });

        // If editing and had a previous Cloudinary image, clean up old asset
        const prevBanner = banners.find((b) => b._id === editingBannerId);
        if (prevBanner?.image && prevBanner.image !== finalImageUrl) {
          uploadService.deleteImage(prevBanner.image).catch(() => {});
        }
      }

      const payload = {
        ...bannerForm,
        image: finalImageUrl,
      };

      if (editingBannerId) {
        await settingsService.updateBanner(editingBannerId, payload);
        toast.success("Banner updated successfully!");
      } else {
        await settingsService.addBanner(payload);
        toast.success("Banner added successfully!");
      }
      setBannerModalOpen(false);
      setEditingBannerId(null);
      setBannerFile(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save banner", { id: "banner-upload" });
    } finally {
      setBannerUploading(false);
    }
  };

  // Handle Delete Banner
  const handleDeleteBanner = async (id) => {
    if (!confirm("Are you sure you want to delete this promotional banner?")) return;
    try {
      const bannerToDelete = banners.find((b) => b._id === id);
      await settingsService.deleteBanner(id);
      if (bannerToDelete?.image) {
        uploadService.deleteImage(bannerToDelete.image).catch(() => {});
      }
      toast.success("Banner deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete banner");
    }
  };

  // Toggle Banner Active
  const handleToggleBanner = async (banner) => {
    try {
      await settingsService.updateBanner(banner._id, {
        ...banner,
        active: !banner.active,
      });
      toast.success(`Banner ${!banner.active ? "activated" : "deactivated"}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Handle Coupon Save
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    try {
      await couponService.create({
        code: couponForm.code.trim().toUpperCase(),
        description: couponForm.description.trim(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderValue: Number(couponForm.minOrderValue) || 0,
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : null,
        isActive: couponForm.isActive,
      });
      toast.success("Promo coupon created successfully!");
      setCouponModalOpen(false);
      setCouponForm({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 500,
        maxDiscount: "",
        isActive: true,
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    }
  };

  // Handle Delete Coupon
  const handleDeleteCoupon = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await couponService.delete(id);
      toast.success("Coupon removed");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete coupon");
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
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">
          Banners & Promotional Offers
        </h1>
        <p className="text-sm text-base-content/70">
          Manage dynamic home screen hero carousels and coupon codes across the mobile app in real time.
        </p>
      </div>

      {/* SECTION 1: HERO BANNERS */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-base-200">
            <div>
              <h2 className="text-lg font-bold">Mobile Hero Banners</h2>
              <p className="text-xs text-base-content/60">
                These banners appear dynamically at the top of the mobile app home screen.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBannerId(null);
                setBannerFile(null);
                setBannerForm({
                  title: "",
                  subtitle: "",
                  tag: "HIGH VOLTAGE DEALS",
                  buttonText: "SHOP NOW  →",
                  targetCategory: "all",
                  image: "",
                  discountText: "Up to 30% OFF",
                  active: true,
                });
                setBannerModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              + Add New Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {banners.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-base-content/60">
                No hero banners configured yet. Click above to add your first dynamic banner.
              </div>
            ) : (
              banners.map((b) => (
                <div
                  key={b._id}
                  className={`border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    b.active
                      ? "border-primary/40 bg-primary/5"
                      : "border-base-300 opacity-60 bg-base-200/50"
                  }`}
                >
                  <div className="space-y-2">
                    {b.image && (
                      <div className="w-full h-28 rounded-lg overflow-hidden bg-base-200 border border-base-300 mb-2 relative">
                        <img
                          src={b.image}
                          alt={b.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="badge badge-warning badge-sm font-semibold tracking-wider">
                        {b.tag || "PROMO"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">
                          {b.active ? "Active" : "Disabled"}
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary toggle-xs"
                          checked={b.active}
                          onChange={() => handleToggleBanner(b)}
                        />
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-base-content">{b.title}</h3>
                    <p className="text-xs text-base-content/70 line-clamp-2">{b.subtitle}</p>

                    <div className="flex flex-wrap gap-2 text-xs pt-1">
                      {b.discountText && (
                        <span className="badge badge-outline badge-sm font-medium">
                          🏷️ {b.discountText}
                        </span>
                      )}
                      {b.targetCategory && (
                        <span className="badge badge-outline badge-sm font-medium">
                          📁 Target: {b.targetCategory}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-base-200/60">
                    <span className="text-xs text-primary font-semibold">
                      {b.buttonText || "SHOP NOW →"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBannerId(b._id);
                          setBannerFile(null);
                          setBannerForm({
                            title: b.title || "",
                            subtitle: b.subtitle || "",
                            tag: b.tag || "HIGH VOLTAGE DEALS",
                            buttonText: b.buttonText || "SHOP NOW  →",
                            targetCategory: b.targetCategory || "all",
                            image: b.image || "",
                            discountText: b.discountText || "",
                            active: b.active ?? true,
                          });
                          setBannerModalOpen(true);
                        }}
                        className="btn btn-ghost btn-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(b._id)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: PROMOTIONAL COUPONS */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-base-200">
            <div>
              <h2 className="text-lg font-bold">Promotional Discount Coupons</h2>
              <p className="text-xs text-base-content/60">
                Coupons created here appear automatically in customer mobile carts with one-tap apply.
              </p>
            </div>
            <button
              onClick={() => setCouponModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              + Create Coupon Code
            </button>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-base-content/60">
                      No active coupon codes created yet.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c._id}>
                      <td className="font-mono font-bold text-primary">{c.code}</td>
                      <td className="text-xs max-w-xs">{c.description}</td>
                      <td className="font-semibold text-xs">
                        {c.discountType === "percentage"
                          ? `${c.discountValue}% OFF`
                          : `₹${c.discountValue} FLAT`}
                        {c.maxDiscount && (
                          <span className="block text-[10px] text-base-content/60">
                            Max: ₹{c.maxDiscount}
                          </span>
                        )}
                      </td>
                      <td className="text-xs">₹{c.minOrderValue || 0}</td>
                      <td>
                        <span
                          className={`badge badge-xs ${
                            c.isActive ? "badge-success" : "badge-ghost"
                          }`}
                        >
                          {c.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BANNER MODAL */}
      {bannerModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4">
              {editingBannerId ? "Edit Hero Banner" : "Create Hero Banner"}
            </h3>
            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Title *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Duty Cables & Modular Gear"
                  className="input input-bordered w-full"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Subtitle</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Up to 35% discount on ISI certified wires"
                  className="input input-bordered w-full"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Tag Badge</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HIGH VOLTAGE DEALS"
                    className="input input-bordered w-full"
                    value={bannerForm.tag}
                    onChange={(e) => setBannerForm({ ...bannerForm, tag: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Discount Highlight</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 35% OFF"
                    className="input input-bordered w-full"
                    value={bannerForm.discountText}
                    onChange={(e) => setBannerForm({ ...bannerForm, discountText: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Button Label</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EXPLORE NOW →"
                    className="input input-bordered w-full"
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Target Category</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. wires or all"
                    className="input input-bordered w-full"
                    value={bannerForm.targetCategory}
                    onChange={(e) => setBannerForm({ ...bannerForm, targetCategory: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-1">
                <ImageUpload
                  label="Banner Promotional Image"
                  aspectRatio="banner"
                  value={bannerForm.image}
                  file={bannerFile}
                  onFileSelect={setBannerFile}
                  onChange={(url, file) => {
                    setBannerForm({ ...bannerForm, image: url });
                    setBannerFile(file || null);
                  }}
                  isUploading={bannerUploading}
                  placeholder="Choose hero banner image (Uploads on Save)"
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setBannerModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COUPON MODAL */}
      {couponModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">Create Promo Coupon</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Coupon Code *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VOLT20"
                  className="input input-bordered w-full font-mono uppercase"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20% discount for contractor orders"
                  className="input input-bordered w-full"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Discount Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Value *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="input input-bordered w-full"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Min Order Value (₹)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered w-full"
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Max Cap Discount (₹)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    className="input input-bordered w-full"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary btn-sm">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

