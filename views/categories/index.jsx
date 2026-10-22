"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { categoryService } from "../../service/category/categoryService";
import AddModal from "./addmodal";
import CategoryTable from "./categorytable";

export default function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Backend Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Overview stats across all categories
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch overview stats
  const fetchOverviewStats = async () => {
    try {
      const data = await categoryService.read({ all: true });
      const list = Array.isArray(data)
        ? data
        : data?.data || data?.categories || [];
      const totalCount = list.length;
      const activeCount = list.filter((c) => c.status === "active").length;
      const inactiveCount = list.filter((c) => c.status === "inactive").length;
      setStats({
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
      });
    } catch (err) {
      console.error("Failed to fetch category stats:", err);
    }
  };

  // Fetch paginated categories from backend
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      const res = await categoryService.read(params);

      if (res && res.success) {
        setCategories(res.data || []);
        setTotal(res.total !== undefined ? Number(res.total) : (res.data || []).length);
        setTotalPages(res.totalPages !== undefined ? Number(res.totalPages) : 1);
      } else if (res) {
        const items = Array.isArray(res) ? res : res.data || res.categories || [];
        if (res.total !== undefined && res.totalPages !== undefined) {
          setCategories(items);
          setTotal(Number(res.total));
          setTotalPages(Number(res.totalPages));
        } else {
          // Fallback client-side slicing
          const totalCount = items.length;
          const computedPages = Math.max(1, Math.ceil(totalCount / limit));
          const sliced = items.slice((page - 1) * limit, page * limit);
          setCategories(sliced);
          setTotal(totalCount);
          setTotalPages(computedPages);
        }
      } else {
        setCategories([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch categories from server:", err);
      setCategories([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  // Initial load
  useEffect(() => {
    fetchOverviewStats();
  }, []);

  // Fetch categories when page/limit/filters change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Save (Create or Update)
  const handleSave = async (formData, id) => {
    setModalLoading(true);
    try {
      if (id) {
        await categoryService.update(id, formData);
        toast.success("Category updated successfully!");
      } else {
        await categoryService.create(formData);
        toast.success("Category created successfully!");
      }

      setIsModalOpen(false);
      setCategoryToEdit(null);
      await Promise.all([fetchCategories(), fetchOverviewStats()]);
    } catch (err) {
      console.error("Save category error:", err);
      const msg = err.response?.data?.message || "Failed to save category. Check backend connection.";
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Category
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    const id = categoryToDelete._id || categoryToDelete.id;

    try {
      await categoryService.delete(id);
      toast.success("Category deleted successfully!");
      setCategoryToDelete(null);

      // If last item on page deleted, go back one page
      if (categories.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await Promise.all([fetchCategories(), fetchOverviewStats()]);
      }
    } catch (err) {
      console.error("Delete category error:", err);
      const msg = err.response?.data?.message || "Failed to delete category";
      toast.error(msg);
      setCategoryToDelete(null);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (cat) => {
    const id = cat._id || cat.id;
    const newStatus = cat.status === "active" ? "inactive" : "active";

    try {
      await categoryService.update(id, { ...cat, status: newStatus });
      setCategories((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Category marked as ${newStatus}`);
      fetchOverviewStats();
    } catch (err) {
      console.error("Toggle status error:", err);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
            <span>⚡ Service Categories</span>
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Manage, classify, and configure service categories for technical catalog.
          </p>
        </div>

        <button
          onClick={() => {
            setCategoryToEdit(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary gap-2 shadow-sm shrink-0"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add Category</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
            📂
          </div>
          <div>
            <div className="text-2xl font-extrabold text-base-content">{stats.total}</div>
            <div className="text-xs text-base-content/60">Total Categories</div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center text-xl font-bold">
            ✅
          </div>
          <div>
            <div className="text-2xl font-extrabold text-success">{stats.active}</div>
            <div className="text-xs text-base-content/60">Active in Catalog</div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-base-200 text-base-content/60 flex items-center justify-center text-xl font-bold">
            ⏸️
          </div>
          <div>
            <div className="text-2xl font-extrabold text-base-content/70">{stats.inactive}</div>
            <div className="text-xs text-base-content/60">Inactive / Hidden</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card bg-base-100 border border-base-300 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
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
              placeholder="Search category name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered input-sm w-full pl-9 focus:input-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-base-content/60 whitespace-nowrap font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="all">All Categories</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              onClick={() => {
                fetchOverviewStats();
                fetchCategories();
              }}
              title="Refresh list"
              className="btn btn-sm btn-square btn-ghost border border-base-300"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Category Table */}
      <CategoryTable
        categories={categories}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        onEdit={(cat) => {
          setCategoryToEdit(cat);
          setIsModalOpen(true);
        }}
        onDelete={(cat) => setCategoryToDelete(cat)}
        onToggleStatus={handleToggleStatus}
        onAddNew={() => {
          setCategoryToEdit(null);
          setIsModalOpen(true);
        }}
      />

      {/* Add / Edit Form Modal */}
      <AddModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleSave}
        categoryToEdit={categoryToEdit}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="modal modal-open z-50">
          <div className="modal-box p-6 bg-base-100 border border-base-300 max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-error/10 text-error flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h3 className="font-bold text-lg text-base-content">Delete Category?</h3>
            <p className="text-sm text-base-content/60 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-base-content">
                "{categoryToDelete.categoryName || categoryToDelete.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="modal-action justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn btn-sm btn-error shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/40 backdrop-blur-sm"
            onClick={() => setCategoryToDelete(null)}
          ></div>
        </div>
      )}
    </div>
  );
}
