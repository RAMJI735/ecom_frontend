"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { categoryService } from "../../service/category/categoryService";

const BRAND_SUGGESTIONS = [
  "Havells",
  "Polycab",
  "Schneider Electric",
  "Philips",
  "Anchor by Panasonic",
  "Legrand",
  "Finolex",
  "Crompton",
  "Syska",
  "L&T",
];

const WARRANTY_PRESETS = [
  "No Warranty",
  "30 Days Replacement",
  "6 Months",
  "1 Year Manufacturer",
  "2 Years Warranty",
  "5 Years Warranty",
];

const SAMPLE_IMAGES = [
  {
    name: "Switch / Socket",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Cables / Wires",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Circuit Breaker",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80",
  },
  {
    name: "Digital Meter",
    url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80",
  },
];

export default function AddProductModal({
  isOpen,
  onClose,
  onSave,
  productToEdit = null,
  categories = [],
  loading = false,
}) {
  const initialFormState = {
    serviceName: "",
    category: "",
    brand: "",
    model: "",
    sku: "",
    price: "",
    stock: "0",
    warranty: "1 Year Manufacturer",
    description: "",
    image: "",
    status: "active",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [categoryList, setCategoryList] = useState(categories);

  // Sync / fetch category list
  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoryList(categories);
    } else if (isOpen) {
      categoryService
        .read()
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || res?.categories || [];
          setCategoryList(list);
        })
        .catch((err) => {
          console.error("Failed to load categories in product modal:", err);
        });
    }
  }, [categories, isOpen]);

  // Sync form data on edit or new
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        serviceName: productToEdit.serviceName || productToEdit.name || productToEdit.productName || "",
        category:
          typeof productToEdit.category === "object"
            ? productToEdit.category?._id || productToEdit.category?.id || ""
            : productToEdit.category || "",
        brand: productToEdit.brand || "",
        model: productToEdit.model || "",
        sku: productToEdit.sku || "",
        price: productToEdit.price !== undefined ? productToEdit.price : "",
        stock: productToEdit.stock !== undefined ? productToEdit.stock : "0",
        warranty: productToEdit.warranty || "1 Year Manufacturer",
        description: productToEdit.description || "",
        image: productToEdit.image || "",
        status: productToEdit.status || "active",
      });
    } else {
      const defaultCat = categoryList[0] || categories[0];
      setFormData({
        ...initialFormState,
        category: defaultCat ? defaultCat._id || defaultCat.id : "",
      });
    }
    setErrors({});
  }, [productToEdit, isOpen, categoryList, categories]);

  if (!isOpen) return null;

  // Auto-generate SKU based on product name, brand, and a random number
  const handleGenerateSKU = () => {
    const brandPrefix = (formData.brand || "PRD").slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
    const namePrefix = (formData.serviceName || "ELE").slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "E");
    const randomCode = Math.floor(100 + Math.random() * 900);
    const generated = `${brandPrefix}-${namePrefix}-${randomCode}`;
    setFormData((prev) => ({ ...prev, sku: generated }));
    if (errors.sku) {
      setErrors((prev) => ({ ...prev, sku: "" }));
    }
    toast.success(`Generated SKU: ${generated}`, { duration: 2000 });
  };

  const validate = () => {
    const newErrors = {};
    const trimmedName = formData.serviceName.trim();

    if (!trimmedName) {
      newErrors.serviceName = "Product name is required";
    } else if (trimmedName.length < 2) {
      newErrors.serviceName = "Product name must be at least 2 characters";
    } else if (trimmedName.length > 150) {
      newErrors.serviceName = "Product name cannot exceed 150 characters";
    }

    if (!formData.category) {
      newErrors.category = "Please select a product category";
    }

    if (formData.price === "" || formData.price === null || isNaN(formData.price)) {
      newErrors.price = "Valid price is required";
    } else if (Number(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (formData.stock === "" || formData.stock === null || isNaN(formData.stock)) {
      newErrors.stock = "Valid stock quantity is required";
    } else if (Number(formData.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
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
      name: formData.serviceName.trim(),
      productName: formData.serviceName.trim(),
      category: formData.category,
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      sku: formData.sku.trim() || undefined,
      price: Number(formData.price),
      stock: Number(formData.stock),
      warranty: formData.warranty.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
      status: formData.status,
      type: "product",
    };

    const id = productToEdit?._id || productToEdit?.id;
    await onSave(payload, id);
  };

  const isEditing = Boolean(productToEdit);

  return (
    <div className="modal modal-open z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="modal-box w-full max-w-3xl max-h-[90vh] flex flex-col bg-base-100 text-base-content border border-base-300 shadow-2xl p-0 rounded-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-base-200 bg-base-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold">
              {isEditing ? "✏️" : "📦"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-base-content">
                {isEditing ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-xs text-base-content/60">
                {isEditing
                  ? "Update product specifications, inventory, and pricing details"
                  : "Add an electrical component, device, or hardware part to the catalog"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-6 [scrollbar-width:thin] [scrollbar-color:color-mix(in_srgb,currentColor_15%,transparent)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-base-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-base-content/30">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-base-200">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                1. General Information
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="label py-1">
                  <span className="label-text font-medium text-xs">
                    Product Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleChange}
                  placeholder="e.g. 1.5 Ton Dual Inverter AC Compressor / Copper Wire 90m"
                  className={`input input-bordered w-full input-sm md:input-md ${
                    errors.serviceName ? "input-error" : ""
                  }`}
                />
                {errors.serviceName && (
                  <span className="text-xs text-error mt-1 block">
                    {errors.serviceName}
                  </span>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="label py-1">
                  <span className="label-text font-medium text-xs">
                    Category <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`select select-bordered w-full select-sm md:select-md ${
                    errors.category ? "select-error" : ""
                  }`}
                >
                  <option value="" disabled>
                    Select product category
                  </option>
                  {categoryList.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.icon || "⚡"} {cat.categoryName || cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="text-xs text-error mt-1 block">
                    {errors.category}
                  </span>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className="label py-1">
                  <span className="label-text font-medium text-xs">
                    Brand / Manufacturer
                  </span>
                </label>
                <input
                  type="text"
                  name="brand"
                  list="brand-suggestions"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Havells, Polycab, Philips"
                  className="input input-bordered w-full input-sm md:input-md"
                />
                <datalist id="brand-suggestions">
                  {BRAND_SUGGESTIONS.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>

              {/* Model / Specifications Code */}
              <div className="md:col-span-2">
                <label className="label py-1">
                  <span className="label-text font-medium text-xs">
                    Model / Technical Variant
                  </span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. 90m Coil, 4.0 sq mm, Flame Retardant (FR)"
                  className="input input-bordered w-full input-sm md:input-md"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-base-200">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                2. Pricing & Inventory
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <label className="label py-1">
                  <span className="label-text font-medium text-xs">
                    Unit Price (₹) <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-base-content/60 font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`input input-bordered w-full pl-8 input-sm md:input-md ${
                      errors.price ? "input-error" : ""
                    }`}
                  />
                </div>
                {errors.price && (
                  <span className="text-xs text-error mt-1 block">
                    {errors.price}
                  </span>
                )}
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="label py-1">
                  <span className="label-text font-medium text-xs">
                    Stock Quantity <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className={`input input-bordered w-full input-sm md:input-md ${
                    errors.stock ? "input-error" : ""
                  }`}
                />
                {errors.stock && (
                  <span className="text-xs text-error mt-1 block">
                    {errors.stock}
                  </span>
                )}
              </div>

              {/* SKU */}
              <div>
                <div className="flex items-center justify-between label py-1">
                  <span className="label-text font-medium text-xs">SKU / Item Code</span>
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="text-primary hover:underline text-xs font-semibold cursor-pointer"
                  >
                    ⚡ Auto-Gen
                  </button>
                </div>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sku: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. HAV-WIR-090"
                  className="input input-bordered w-full font-mono uppercase text-xs md:text-sm input-sm md:input-md"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Warranty & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-base-200">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                3. Warranty & Details
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Warranty */}
              <div className="md:col-span-2">
                <label className="label py-1">
                  <span className="label-text font-medium text-xs">
                    Warranty Term
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {WARRANTY_PRESETS.map((wp) => (
                    <button
                      key={wp}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, warranty: wp }))}
                      className={`btn btn-xs rounded-lg ${
                        formData.warranty === wp
                          ? "btn-primary"
                          : "btn-outline border-base-300"
                      }`}
                    >
                      {wp}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleChange}
                  placeholder="Custom warranty e.g. 1 Year Onsite Support"
                  className="input input-bordered w-full input-sm md:input-md"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="label py-1">
                  <span className="label-text font-medium text-xs">
                    Technical Specifications / Description
                  </span>
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Key features, current rating, voltage, certifications (ISI, CE, RoHS)..."
                  className="textarea textarea-bordered w-full text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Image & Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-base-200">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                4. Media & Visibility
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Image URL & Presets */}
              <div className="md:col-span-2 space-y-2">
                <label className="label py-1">
                  <span className="label-text font-medium text-xs">
                    Product Image URL
                  </span>
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/product-image.jpg"
                  className="input input-bordered w-full input-sm md:input-md text-xs"
                />

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-xs text-base-content/60">Sample images:</span>
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: sample.url }))
                      }
                      className="badge badge-sm badge-ghost hover:badge-primary cursor-pointer transition"
                    >
                      {sample.name}
                    </button>
                  ))}
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                      className="badge badge-sm badge-error cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Image Preview & Status */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs">Preview</span>
                  </label>
                  <div className="w-full h-24 rounded-xl border border-base-300 bg-base-200/50 flex items-center justify-center overflow-hidden">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-base-content/40 text-xs">
                        <span className="text-xl">🔌</span>
                        <span>No image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs">Catalog Status</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="select select-bordered w-full select-sm focus:select-primary"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          </div>

          {/* Modal Actions Footer */}
          <div className="px-6 py-4 border-t border-base-200 bg-base-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-ghost btn-sm md:btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm md:btn-md min-w-32 gap-2 shadow-sm"
            >
              {loading && <span className="loading loading-spinner loading-xs" />}
              <span>{isEditing ? "Save Changes" : "Create Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
