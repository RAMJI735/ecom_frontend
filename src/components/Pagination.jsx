"use client";

import { useMemo } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

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
  className = "",
}) {
  const computedTotalPages = useMemo(() => {
    if (totalPages !== undefined && totalPages !== null && !isNaN(totalPages)) {
      return Math.max(1, Number(totalPages));
    }
    return Math.max(1, Math.ceil(total / Math.max(1, limit)));
  }, [totalPages, total, limit]);

  const currentPage = Math.min(Math.max(1, page), computedTotalPages);

  const startRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, total);

  // Generate page items with smart ellipsis
  const pageItems = useMemo(() => {
    if (computedTotalPages <= 7) {
      return Array.from({ length: computedTotalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", computedTotalPages];
    }

    if (currentPage >= computedTotalPages - 3) {
      return [
        1,
        "...",
        computedTotalPages - 4,
        computedTotalPages - 3,
        computedTotalPages - 2,
        computedTotalPages - 1,
        computedTotalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      computedTotalPages,
    ];
  }, [computedTotalPages, currentPage]);

  const handlePageClick = (p) => {
    if (p === "..." || p === currentPage || !onPageChange) return;
    onPageChange(p);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-3.5 border-t border-base-200 bg-base-100 text-xs text-base-content/70 select-none ${className}`}
    >
      {/* Record info & page size dropdown */}
      {showInfo && (
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <span>
            Showing <strong className="text-base-content font-semibold">{startRecord}</strong> to{" "}
            <strong className="text-base-content font-semibold">{endRecord}</strong> of{" "}
            <strong className="text-base-content font-semibold">{total}</strong> {itemLabel}
          </span>

          {showPageSize && onLimitChange && (
            <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-base-300">
              <span className="text-base-content/60">Rows:</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="select select-bordered select-xs text-xs font-semibold focus:select-primary bg-base-100"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        <div className="join shadow-xs">
          {/* First page button */}
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(1)}
            disabled={currentPage <= 1}
            title="First page"
            aria-label="First page"
            className="join-item btn btn-sm btn-square btn-ghost border border-base-300 disabled:opacity-30 disabled:border-base-300 hover:bg-base-200"
          >
            <FiChevronsLeft className="w-4 h-4" />
          </button>

          {/* Prev button */}
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous page"
            aria-label="Previous page"
            className="join-item btn btn-sm btn-square btn-ghost border border-base-300 disabled:opacity-30 disabled:border-base-300 hover:bg-base-200"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {pageItems.map((item, idx) => {
            if (item === "...") {
              return (
                <button
                  key={`ellipsis-${idx}`}
                  type="button"
                  disabled
                  className="join-item btn btn-sm btn-square btn-ghost border border-base-300 opacity-60 cursor-default"
                >
                  …
                </button>
              );
            }

            const isCurrent = currentPage === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => handlePageClick(item)}
                className={`join-item btn btn-sm min-w-8 font-semibold transition ${
                  isCurrent
                    ? "btn-primary shadow-xs z-10"
                    : "btn-ghost border border-base-300 hover:bg-base-200 text-base-content/80"
                }`}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            );
          })}

          {/* Next button */}
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage >= computedTotalPages}
            title="Next page"
            aria-label="Next page"
            className="join-item btn btn-sm btn-square btn-ghost border border-base-300 disabled:opacity-30 disabled:border-base-300 hover:bg-base-200"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>

          {/* Last page button */}
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(computedTotalPages)}
            disabled={currentPage >= computedTotalPages}
            title="Last page"
            aria-label="Last page"
            className="join-item btn btn-sm btn-square btn-ghost border border-base-300 disabled:opacity-30 disabled:border-base-300 hover:bg-base-200"
          >
            <FiChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
