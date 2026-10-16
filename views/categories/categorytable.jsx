"use client";

import Pagination from "@/components/Pagination";

export default function CategoryTable({
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
  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th className="w-16">Icon</th>
                <th>Category Name</th>
                <th>Description</th>
                <th className="w-32">Status</th>
                <th className="w-36">Created</th>
                <th className="w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((idx) => (
                <tr key={idx} className="animate-pulse">
                  <td>
                    <div className="w-10 h-10 bg-base-300 rounded-lg"></div>
                  </td>
                  <td>
                    <div className="h-4 bg-base-300 rounded w-36 mb-2"></div>
                    <div className="h-3 bg-base-300/60 rounded w-20"></div>
                  </td>
                  <td>
                    <div className="h-3 bg-base-300 rounded w-48"></div>
                  </td>
                  <td>
                    <div className="h-6 bg-base-300 rounded-full w-20"></div>
                  </td>
                  <td>
                    <div className="h-3 bg-base-300 rounded w-24"></div>
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

  if (categories.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mb-4">
            ⚡
          </div>
          <h3 className="text-lg font-bold text-base-content">No Categories Found</h3>
          <p className="text-sm text-base-content/60 mt-1 mb-6">
            Get started by adding your first service category to organize your service catalog.
          </p>
          <button onClick={onAddNew} className="btn btn-primary btn-sm gap-2">
            <span>+</span> Add Service Category
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
              <th className="w-16">Icon</th>
              <th>Category Details</th>
              <th>Description</th>
              <th className="w-32">Status</th>
              <th className="w-36">Created</th>
              <th className="w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200">
            {categories.map((cat) => {
              const id = cat._id || cat.id;
              const name = cat.categoryName || cat.name || "Untitled Category";
              const isActive = cat.status === "active";
              const createdDate = cat.createdAt
                ? new Date(cat.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <tr key={id} className="hover:bg-base-200/30 transition">
                  {/* Icon & Cover Image */}
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-xl shrink-0 border border-base-300 shadow-xs relative overflow-hidden">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <span className={cat.image ? "absolute inset-0 flex items-center justify-center bg-black/30 text-white text-base opacity-0 hover:opacity-100 transition" : ""}>
                          {cat.icon || "⚡"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Name */}
                  <td>
                    <div className="font-semibold text-base-content hover:text-primary transition cursor-pointer" onClick={() => onEdit(cat)}>
                      {name}
                    </div>
                    {cat.icon && (
                      <span className="text-xs text-base-content/50">Icon: {cat.icon}</span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="max-w-xs">
                    <p className="text-xs text-base-content/70 line-clamp-2">
                      {cat.description || <span className="italic text-base-content/40">No description provided</span>}
                    </p>
                  </td>

                  {/* Status Badge & Quick Toggle */}
                  <td>
                    <button
                      onClick={() => onToggleStatus && onToggleStatus(cat)}
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

                  {/* Created Date */}
                  <td className="text-xs text-base-content/60">
                    {createdDate}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(cat)}
                        className="btn btn-sm btn-square btn-ghost text-base-content/70 hover:text-primary hover:bg-primary/10 transition"
                        title="Edit Category"
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

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(cat)}
                        className="btn btn-sm btn-square btn-ghost text-base-content/70 hover:text-error hover:bg-error/10 transition"
                        title="Delete Category"
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
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <Pagination
        page={page}
        total={total}
        limit={limit}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        itemLabel="categories"
        name="categories-pagination"
      />
    </div>
  );
}
