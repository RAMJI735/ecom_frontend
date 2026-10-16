"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";

export default function ProductTable({
  products = [],
  categories = [],
  loading = false,
  total = 0,
  page = 1,
  limit = 10,
  totalPages = 1,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
}) {
  const [copiedSku, setCopiedSku] = useState(null);

  const getCategoryName = (catRef) => {
    if (!catRef) return "Uncategorized";
    if (typeof catRef === "object") {
      return catRef.categoryName || catRef.name || "Category";
    }
    const found = categories.find((c) => (c._id || c.id) === catRef);
    return found ? found.categoryName || found.name : "Category";
  };

  const getCategoryIcon = (catRef) => {
    if (typeof catRef === "object" && catRef.icon) return catRef.icon;
    const found = categories.find((c) => (c._id || c.id) === catRef);
    return found?.icon || "⚡";
  };

  const handleCopySku = (e, sku) => {
    e.stopPropagation();
    if (!sku) return;
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    toast.success(`Copied SKU: ${sku}`, { duration: 1500 });
    setTimeout(() => {
      setCopiedSku(null);
    }, 2000);
  };



  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Product Details</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock & Status</th>
                <th>Visibility</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="animate-pulse">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-base-300 rounded-xl" />
                      <div>
                        <div className="h-4 bg-base-300 rounded w-44 mb-2" />
                        <div className="h-3 bg-base-300/60 rounded w-24" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="h-5 bg-base-300 rounded w-24" />
                  </td>
                  <td>
                    <div className="h-5 bg-base-300 rounded-full w-28" />
                  </td>
                  <td>
                    <div className="h-4 bg-base-300 rounded w-16" />
                  </td>
                  <td>
                    <div className="h-5 bg-base-300 rounded-full w-24" />
                  </td>
                  <td>
                    <div className="h-5 bg-base-300 rounded-full w-16" />
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 bg-base-300 rounded-lg" />
                      <div className="w-8 h-8 bg-base-300 rounded-lg" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mb-4">
            🔌
          </div>
          <h3 className="text-lg font-bold text-base-content">No Products Found</h3>
          <p className="text-sm text-base-content/60 mt-1 mb-6">
            No matching products found in the catalog for your search or filter criteria.
          </p>
          <button onClick={onAddNew} className="btn btn-primary btn-sm gap-2">
            <span>+</span> Add Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr className="bg-base-200/50 text-base-content/80 text-xs uppercase tracking-wider font-semibold">
              <th>Product Details</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {products.map((item) => {
              const id = item._id || item.id;
              const title = item.serviceName || item.name || item.productName || "Untitled Product";
              const catName = getCategoryName(item.category);
              const catIcon = getCategoryIcon(item.category);
              const isActive = item.status === "active";
              const stock = item.stock !== undefined ? Number(item.stock) : 0;
              const isOutOfStock = stock <= 0;
              const isLowStock = stock > 0 && stock <= 10;

              return (
                <tr key={id} className="hover:bg-base-200/30 transition group">
                  {/* Product Details (Image, Title, Brand, Model) */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center text-xl shrink-0 border border-base-300 shadow-xs relative overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <span className={item.image ? "absolute inset-0 flex items-center justify-center bg-black/30 text-white text-base opacity-0 group-hover:opacity-100 transition" : ""}>
                          ⚡
                        </span>
                      </div>

                      <div className="max-w-xs sm:max-w-sm md:max-w-md">
                        <div
                          className="font-semibold text-base-content hover:text-primary transition cursor-pointer truncate"
                          title={title}
                          onClick={() => onEdit(item)}
                        >
                          {title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-base-content/60">
                          {item.brand && (
                            <span className="font-medium text-base-content/80">
                              {item.brand}
                            </span>
                          )}
                          {item.model && (
                            <span className="badge badge-xs badge-ghost truncate max-w-44">
                              {item.model}
                            </span>
                          )}
                          {item.warranty && (
                            <span className="text-primary text-[11px] font-medium">
                              🛡️ {item.warranty}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td>
                    {item.sku ? (
                      <button
                        onClick={(e) => handleCopySku(e, item.sku)}
                        title="Click to copy SKU"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-base-200 hover:bg-base-300 font-mono text-xs font-semibold text-base-content border border-base-300 transition cursor-pointer"
                      >
                        <span>{item.sku}</span>
                        <span className="text-[10px] text-base-content/50">
                          {copiedSku === item.sku ? "✓" : "📋"}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-base-content/40 italic">None</span>
                    )}
                  </td>

                  {/* Category */}
                  <td>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-xs font-medium text-base-content/80 border border-base-300">
                      <span>{catIcon}</span>
                      <span className="truncate max-w-28">{catName}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td>
                    <div className="font-bold text-base text-base-content font-mono">
                      ₹{item.price !== undefined ? Number(item.price).toLocaleString("en-IN") : "0"}
                    </div>
                  </td>

                  {/* Stock Level & Status */}
                  <td>
                    <div className="space-y-1">
                      {isOutOfStock ? (
                        <span className="badge badge-sm badge-error gap-1 font-medium">
                          <span>⚠️</span> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="badge badge-sm badge-warning gap-1 font-medium">
                          <span>⚡</span> {stock} left (Low)
                        </span>
                      ) : (
                        <span className="badge badge-sm badge-success gap-1 font-medium">
                          <span>✓</span> {stock} in stock
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Visibility Status */}
                  <td>
                    <button
                      onClick={() => onToggleStatus && onToggleStatus(item)}
                      title="Click to toggle visibility"
                      className={`badge badge-sm gap-1.5 py-2.5 px-3 cursor-pointer font-medium transition hover:scale-105 ${
                        isActive
                          ? "badge-success/20 text-success border-success/30"
                          : "badge-ghost text-base-content/60 border-base-300"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? "bg-success" : "bg-base-content/40"
                        }`}
                      />
                      <span>{isActive ? "Active" : "Inactive"}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-primary hover:bg-primary/10"
                        title="Edit product"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => onDelete(item)}
                        className="btn btn-ghost btn-xs btn-square text-base-content/70 hover:text-error hover:bg-error/10"
                        title="Delete product"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Backend Pagination Bar */}
      <Pagination
        page={page}
        total={total}
        limit={limit}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        itemLabel="products"
        name="products-pagination"
      />
    </div>
  );
}
