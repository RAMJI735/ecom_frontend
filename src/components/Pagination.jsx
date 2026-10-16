"use client";

import { useId } from "react";

export default function Pagination({
  page = 1,
  total = 0,
  limit = 10,
  totalPages,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [5, 10, 20, 50],
  itemLabel = "items",
  showInfo = true,
  showPageSize = true,
  maxVisiblePages = 5,
  name,
}) {
  const generatedId = useId();
  const radioName = name || `pagination-${generatedId}`;

  const computedTotalPages =
    totalPages !== undefined
      ? Math.max(1, totalPages)
      : Math.max(1, Math.ceil(total / limit));

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  // Calculate visible page range
  const getVisiblePages = () => {
    if (computedTotalPages <= maxVisiblePages) {
      return Array.from({ length: computedTotalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let end = start + maxVisiblePages - 1;

    if (end > computedTotalPages) {
      end = computedTotalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-base-200 bg-base-100 text-xs text-base-content/70">
      {/* Record info & page size dropdown */}
      {showInfo && (
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Showing <strong className="text-base-content">{startRecord}</strong> to{" "}
            <strong className="text-base-content">{endRecord}</strong> of{" "}
            <strong className="text-base-content">{total}</strong> {itemLabel}
          </span>

          {showPageSize && onLimitChange && (
            <div className="flex items-center gap-1.5 ml-2">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="select select-bordered select-xs text-xs font-semibold focus:select-primary"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>per page</span>
            </div>
          )}
        </div>
      )}

      {/* DaisyUI Join Radio Button Pagination */}
      <div className="join">
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(page - 1)}
          disabled={page <= 1}
          title="Previous page"
          className="join-item btn btn-sm btn-square disabled:opacity-30"
        >
          «
        </button>

        {visiblePages.map((p) => (
          <input
            key={p}
            className="join-item btn btn-sm btn-square"
            type="radio"
            name={radioName}
            aria-label={String(p)}
            checked={page === p}
            onChange={() => onPageChange && onPageChange(p)}
          />
        ))}

        <button
          type="button"
          onClick={() => onPageChange && onPageChange(page + 1)}
          disabled={page >= computedTotalPages}
          title="Next page"
          className="join-item btn btn-sm btn-square disabled:opacity-30"
        >
          »
        </button>
      </div>
    </div>
  );
}
