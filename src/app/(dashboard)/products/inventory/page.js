"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { productService } from "@service/product/productService";
import Pagination from "@/components/Pagination";

export default function InventoryPage() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, filter & backend pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Overview stats across entire inventory
  const [overviewStats, setOverviewStats] = useState({
    totalSKUs: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch full inventory overview statistics
  const fetchOverviewStats = async () => {
    try {
      const res = await productService.read({ all: true });
      const allItems = Array.isArray(res) ? res : res?.data || [];
      const totalCount = allItems.length;
      const lowCount = allItems.filter(
        (item) => Number(item.stock) > 0 && Number(item.stock) <= 10
      ).length;
      const outCount = allItems.filter(
        (item) => Number(item.stock) <= 0
      ).length;

      setOverviewStats({
        totalSKUs: totalCount,
        lowStockCount: lowCount,
        outOfStockCount: outCount,
      });
    } catch (err) {
      console.error("Failed to load inventory stats:", err);
    }
  };

  // Fetch paginated inventory from backend
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        stockStatus: statusFilter !== "all" ? statusFilter : undefined,
      };

      const res = await productService.read(params);

      if (res && res.success) {
        setStockItems(res.data || []);
        setTotal(res.total !== undefined ? Number(res.total) : (res.data || []).length);
        setTotalPages(res.totalPages !== undefined ? Number(res.totalPages) : 1);
      } else if (res) {
        const items = Array.isArray(res) ? res : res.data || res.products || [];
        if (res.total !== undefined && res.totalPages !== undefined) {
          setStockItems(items);
          setTotal(Number(res.total));
          setTotalPages(Number(res.totalPages));
        } else {
          // Fallback client-side slicing
          const count = items.length;
          const pages = Math.max(1, Math.ceil(count / limit));
          const sliced = items.slice((page - 1) * limit, page * limit);
          setStockItems(sliced);
          setTotal(count);
          setTotalPages(pages);
        }
      } else {
        setStockItems([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setStockItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">Inventory & Stock</h1>
          <p className="text-sm text-base-content/70">Real-time warehouse inventory and stock monitoring.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products" className="btn btn-outline btn-sm">Catalog</Link>
          <Link href="/products" className="btn btn-primary btn-sm">+ Add Stock</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
          <div className="text-xs text-base-content/60 font-semibold uppercase">Total SKUs</div>
          <div className="text-2xl font-bold mt-1">{overviewStats.totalSKUs}</div>
        </div>
        <div className="card bg-base-100 border border-warning/30 bg-warning/5 shadow-sm p-4">
          <div className="text-xs text-warning font-semibold uppercase">Low Stock Alerts (&le; 10)</div>
          <div className="text-2xl font-bold text-warning mt-1">{overviewStats.lowStockCount}</div>
        </div>
        <div className="card bg-base-100 border border-error/30 bg-error/5 shadow-sm p-4">
          <div className="text-xs text-error font-semibold uppercase">Out of Stock</div>
          <div className="text-2xl font-bold text-error mt-1">{overviewStats.outOfStockCount}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card bg-base-100 border border-base-300 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by SKU or item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm w-full focus:input-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="all">All Inventory</option>
              <option value="in_stock">In Stock (&gt; 10)</option>
              <option value="low_stock">Low Stock (1-10)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            <button
              onClick={() => {
                fetchOverviewStats();
                fetchInventory();
              }}
              title="Refresh inventory"
              className="btn btn-sm btn-square btn-ghost border border-base-300"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="border-b border-base-300 text-xs uppercase text-base-content/60 bg-base-200/50">
                <th>SKU</th>
                <th>Item Name</th>
                <th>Current Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </td>
                </tr>
              ) : stockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-base-content/60">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-2xl mb-3">
                        📦
                      </div>
                      <h4 className="font-semibold text-base text-base-content">No Inventory Items Found</h4>
                      <p className="text-xs text-base-content/60 mt-1">
                        {searchQuery
                          ? `No items match "${searchQuery}".`
                          : "Products added to the catalog will reflect here with live inventory levels."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                stockItems.map((item) => {
                  const stock = Number(item.stock) || 0;
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= 10;

                  return (
                    <tr key={item._id || item.id} className="hover:bg-base-200/30 transition">
                      <td className="font-mono text-xs font-semibold">{item.sku || "N/A"}</td>
                      <td className="font-semibold text-base-content">
                        {item.serviceName || item.name || item.productName}
                      </td>
                      <td className="font-mono font-medium">{stock} units</td>
                      <td className="font-mono text-sm">₹{Number(item.price || 0).toLocaleString("en-IN")}</td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold ${
                            isOutOfStock
                              ? "badge-error"
                              : isLowStock
                              ? "badge-warning"
                              : "badge-success"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link href="/products" className="btn btn-ghost btn-xs text-primary font-medium">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Backend Pagination */}
        {!loading && total > 0 && (
          <Pagination
            page={page}
            total={total}
            limit={limit}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="inventory items"
            name="inventory-pagination"
          />
        )}
      </div>
    </div>
  );
}
