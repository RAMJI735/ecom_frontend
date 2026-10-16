"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { productService } from "../../service/product/productService";
import { categoryService } from "../../service/category/categoryService";
import ProductTable from "./producttable";
import AddProductModal from "./addmodal";

export default function ProductsView() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Backend Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Global KPI summary stats across entire catalog
  const [overviewStats, setOverviewStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  // Debounce search query by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const data = await categoryService.read();
      if (data) {
        const list = Array.isArray(data)
          ? data
          : data.data || data.categories || [];
        setCategories(list);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  };

  // Fetch overall catalog statistics
  const fetchOverviewStats = async () => {
    try {
      const res = await productService.read({ all: true });
      const allItems = Array.isArray(res) ? res : res?.data || [];
      const totalCount = allItems.length;
      const inStock = allItems.filter((p) => (Number(p.stock) || 0) > 10).length;
      const lowStock = allItems.filter(
        (p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 10
      ).length;
      const outOfStock = allItems.filter(
        (p) => (Number(p.stock) || 0) <= 0
      ).length;
      const totalValue = allItems.reduce(
        (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
        0
      );

      setOverviewStats({
        total: totalCount,
        inStock,
        lowStock,
        outOfStock,
        totalValue,
      });
    } catch (err) {
      console.error("Failed to load catalog stats:", err);
    }
  };

  // Fetch Paginated Products from Backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        stockStatus: stockFilter !== "all" ? stockFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sortBy,
      };

      const res = await productService.read(params);

      if (res) {
        const items = Array.isArray(res) ? res : res.data || res.products || [];
        setProducts(items);
        setTotal(res.total !== undefined ? Number(res.total) : items.length);
        setTotalPages(res.totalPages !== undefined ? Number(res.totalPages) : 1);
      } else {
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch products from backend:", err);
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, categoryFilter, stockFilter, statusFilter, sortBy]);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchOverviewStats();
  }, []);

  // Fetch products whenever pagination or filter dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers that reset page to 1
  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setPage(1);
  };

  const handleStockChange = (val) => {
    setStockFilter(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Save (Create or Update)
  const handleSave = async (formData, id) => {
    setModalLoading(true);
    try {
      if (id) {
        await productService.update(id, formData);
        toast.success("Product updated successfully!");
      } else {
        await productService.create(formData);
        toast.success("Product added to catalog!");
      }

      setIsModalOpen(false);
      setProductToEdit(null);
      await Promise.all([fetchProducts(), fetchOverviewStats()]);
    } catch (err) {
      console.error("Save product error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to save product. Check backend connection.";
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Confirmation
  const confirmDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete._id || productToDelete.id;

    try {
      await productService.delete(id);
      toast.success("Product removed from catalog");
      setProductToDelete(null);

      // If we deleted the last item on the current page, step back one page
      if (products.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await Promise.all([fetchProducts(), fetchOverviewStats()]);
      }
    } catch (err) {
      console.error("Delete product error:", err);
      const msg = err.response?.data?.message || "Failed to delete product";
      toast.error(msg);
      setProductToDelete(null);
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (item) => {
    const id = item._id || item.id;
    const newStatus = item.status === "active" ? "inactive" : "active";

    try {
      await productService.toggleStatus(id, newStatus);
      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, status: newStatus } : p))
      );
      toast.success(`Product marked as ${newStatus}`);
    } catch (err) {
      console.error("Toggle status error:", err);
      toast.error("Failed to update status");
    }
  };


  // Export full catalog matching filters to CSV (using all=true)
  const handleExportCSV = async () => {
    try {
      const res = await productService.read({
        all: true,
        search: debouncedSearch.trim() || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        stockStatus: stockFilter !== "all" ? stockFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sortBy,
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      if (list.length === 0) {
        toast.error("No products matching filters to export");
        return;
      }

      const headers = [
        "Product Name",
        "SKU",
        "Brand",
        "Model",
        "Price (INR)",
        "Stock",
        "Warranty",
        "Status",
      ];
      const rows = list.map((p) => [
        `"${(p.serviceName || p.name || "").replace(/"/g, '""')}"`,
        `"${p.sku || ""}"`,
        `"${p.brand || ""}"`,
        `"${p.model || ""}"`,
        p.price || 0,
        p.stock || 0,
        `"${p.warranty || ""}"`,
        p.status || "active",
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `products_catalog_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${list.length} products to CSV!`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export products to CSV");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
            <span>⚡ Electrical Product Catalog</span>
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Manage electrical components, tools, replacement hardware, inventory, and SKU codes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={handleExportCSV}
            className="btn btn-outline btn-sm gap-1.5"
            title="Export all matching products across pages to CSV"
          >
            <span>📥</span> Export CSV
          </button>

          <button
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary btn-sm gap-1.5 shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold shrink-0">
            📦
          </div>
          <div>
            <div className="text-xl font-extrabold text-base-content">
              {overviewStats.total}
            </div>
            <div className="text-xs text-base-content/60">Total Products</div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center text-lg font-bold shrink-0">
            ✓
          </div>
          <div>
            <div className="text-xl font-extrabold text-success">
              {overviewStats.inStock}
            </div>
            <div className="text-xs text-base-content/60">In Stock (&gt; 10)</div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center text-lg font-bold shrink-0">
            ⚠️
          </div>
          <div>
            <div className="text-xl font-extrabold text-warning">
              {overviewStats.lowStock}
            </div>
            <div className="text-xs text-base-content/60">Low Stock (&le; 10)</div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5 flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center text-lg font-bold shrink-0">
            ✕
          </div>
          <div>
            <div className="text-xl font-extrabold text-error">
              {overviewStats.outOfStock}
            </div>
            <div className="text-xs text-base-content/60">Out of Stock</div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xs p-3.5 flex flex-row items-center gap-3 col-span-2 lg:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-lg font-bold shrink-0">
            ₹
          </div>
          <div>
            <div className="text-xl font-extrabold text-base-content font-mono truncate">
              ₹{overviewStats.totalValue.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-base-content/60">Inventory Value</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card bg-base-100 border border-base-300 shadow-xs p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-base-content/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by product name, SKU, brand, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm w-full pl-9 focus:input-primary"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.icon || "📂"} {c.categoryName || c.name}
                </option>
              ))}
            </select>

            {/* Stock Level Filter */}
            <select
              value={stockFilter}
              onChange={(e) => handleStockChange(e.target.value)}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="all">All Inventory</option>
              <option value="in_stock">In Stock (&gt; 10)</option>
              <option value="low_stock">Low Stock (1-10)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
            </select>

            {/* Refresh */}
            <button
              onClick={() => {
                fetchCategories();
                fetchOverviewStats();
                fetchProducts();
              }}
              title="Refresh product list"
              className="btn btn-square btn-ghost btn-sm border border-base-300"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(searchQuery || categoryFilter !== "all" || stockFilter !== "all" || statusFilter !== "all") && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-base-200 text-xs flex-wrap">
            <span className="text-base-content/60">Active Filters:</span>
            {searchQuery && (
              <span className="badge badge-sm badge-outline gap-1">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-error">✕</button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="badge badge-sm badge-outline gap-1">
                Category
                <button onClick={() => handleCategoryChange("all")} className="hover:text-error">✕</button>
              </span>
            )}
            {stockFilter !== "all" && (
              <span className="badge badge-sm badge-outline gap-1">
                Stock: {stockFilter.replace("_", " ")}
                <button onClick={() => handleStockChange("all")} className="hover:text-error">✕</button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="badge badge-sm badge-outline gap-1">
                Status: {statusFilter}
                <button onClick={() => handleStatusChange("all")} className="hover:text-error">✕</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
                setStockFilter("all");
                setStatusFilter("all");
                setPage(1);
              }}
              className="text-primary hover:underline font-semibold ml-auto"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Paginated Product Table */}
      <ProductTable
        products={products}
        categories={categories}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
        onEdit={(item) => {
          setProductToEdit(item);
          setIsModalOpen(true);
        }}
        onDelete={(item) => setProductToDelete(item)}
        onToggleStatus={handleToggleStatus}
        onAddNew={() => {
          setProductToEdit(null);
          setIsModalOpen(true);
        }}
      />

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSave}
        productToEdit={productToEdit}
        categories={categories}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal modal-open z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="modal-box max-w-md bg-base-100 border border-base-300 shadow-2xl p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-error mb-4">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-2xl font-bold">
                🗑️
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">Delete Product?</h3>
                <p className="text-xs text-base-content/60">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-base-content/80 mb-6">
              Are you sure you want to permanently delete{" "}
              <strong className="text-base-content">
                "{productToDelete.serviceName || productToDelete.name || "this product"}"
              </strong>{" "}
              {productToDelete.sku ? `(SKU: ${productToDelete.sku})` : ""} from your catalog?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-error btn-sm min-w-24 text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
