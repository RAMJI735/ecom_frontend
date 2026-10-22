"use client";

import Pagination from "@/components/Pagination";

export default function ServiceTable({
  services = [],
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
  // Helper to resolve category name from ID or populated object
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

  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Service Info</th>
                <th>Category</th>
                <th>Price</th>
                <th>Duration & Warranty</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="animate-pulse">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-base-300 rounded-xl"></div>
                      <div>
                        <div className="h-4 bg-base-300 rounded w-40 mb-2"></div>
                        <div className="h-3 bg-base-300/60 rounded w-24"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="h-5 bg-base-300 rounded-full w-24"></div>
                  </td>
                  <td>
                    <div className="h-4 bg-base-300 rounded w-16"></div>
                  </td>
                  <td>
                    <div className="h-4 bg-base-300 rounded w-28"></div>
                  </td>
                  <td>
                    <div className="h-6 bg-base-300 rounded-full w-20"></div>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 bg-base-300 rounded-lg"></div>
                      <div className="w-8 h-8 bg-base-300 rounded-lg"></div>
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

  if (total === 0 && services.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mb-4">
            🔧
          </div>
          <h3 className="text-lg font-bold text-base-content">No Services Found</h3>
          <p className="text-sm text-base-content/60 mt-1 mb-6">
            Get started by adding electrical and appliance services to your offerings.
          </p>
          <button onClick={onAddNew} className="btn btn-primary btn-sm gap-2">
            <span>+</span> Add First Service
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
              <th>Service Info</th>
              <th>Category</th>
              <th>Price</th>
              <th>Duration / Warranty</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-base-content/60">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <span className="text-2xl mb-1">🔍</span>
                    <span className="font-semibold text-sm text-base-content">No Services On This Page</span>
                    <span className="text-xs text-base-content/60 mt-0.5">Try navigating to previous pages or resetting filters.</span>
                  </div>
                </td>
              </tr>
            ) : (
              services.map((item) => {
                const id = item._id || item.id;
                const title = item.serviceName || item.name || "Untitled Service";
                const catName = getCategoryName(item.category);
                const catIcon = getCategoryIcon(item.category);
                const isActive = item.status === "active";
                const duration = item.estimated_time || item.estimatedTime;

              return (
                <tr key={id} className="hover:bg-base-200/30 transition">
                  {/* Service Info */}
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
                        <span className={item.image ? "absolute inset-0 flex items-center justify-center bg-black/30 text-white text-base opacity-0 hover:opacity-100 transition" : ""}>
                          🔧
                        </span>
                      </div>

                      <div>
                        <div
                          className="font-semibold text-base-content hover:text-primary transition cursor-pointer"
                          onClick={() => onEdit(item)}
                        >
                          {title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-base-content/60">
                          {item.brand && (
                            <span className="font-medium text-base-content/80">
                              {item.brand}
                            </span>
                          )}
                          {item.model && (
                            <span className="badge badge-xs badge-ghost">
                              {item.model}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-200 text-xs font-medium text-base-content/80 border border-base-300">
                      <span>{catIcon}</span>
                      <span>{catName}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td>
                    <div className="font-bold text-base text-base-content font-mono">
                      ₹{item.price !== undefined ? item.price : 0}
                    </div>
                  </td>

                  {/* Duration & Warranty */}
                  <td>
                    <div className="space-y-1">
                      {duration && (
                        <div className="flex items-center gap-1 text-xs text-base-content/70">
                          <span>⏱️</span>
                          <span>{duration}</span>
                        </div>
                      )}
                      {item.warranty && (
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          <span>🛡️</span>
                          <span>{item.warranty}</span>
                        </div>
                      )}
                      {!duration && !item.warranty && (
                        <span className="text-xs text-base-content/40 italic">Standard</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <button
                      onClick={() => onToggleStatus && onToggleStatus(item)}
                      title="Click to toggle status"
                      className={`badge badge-sm gap-1.5 py-2.5 px-3 cursor-pointer font-medium transition hover:scale-105 ${
                        isActive
                          ? "badge-success text-success-content"
                          : "badge-ghost text-base-content/60 border-base-300"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white animate-pulse" : "bg-base-content/40"}`}></span>
                      {isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <button
                        onClick={() => onEdit(item)}
                        className="btn btn-sm btn-square btn-ghost text-base-content/70 hover:text-primary hover:bg-primary/10 transition"
                        title="Edit Service"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete(item)}
                        className="btn btn-sm btn-square btn-ghost text-base-content/70 hover:text-error hover:bg-error/10 transition"
                        title="Delete Service"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            }))}
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
        itemLabel="service packages"
        name="services-pagination"
      />
    </div>
  );
}
