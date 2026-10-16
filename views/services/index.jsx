"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { serviceApi } from "../../service/serviceApi/serviceApi";
import { categoryService } from "../../service/category/categoryService";
import AddServiceModal from "./addmodal";
import ServiceTable from "./servicetable";

export default function ServicesView() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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

  // Fetch Services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await serviceApi.read();
      if (data) {
        const list = Array.isArray(data)
          ? data
          : data.data || data.services || [];
        setServices(list);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Failed to fetch services from server:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  // Save (Create or Update)
  const handleSave = async (formData, id) => {
    setModalLoading(true);
    try {
      if (id) {
        // Update existing service
        const res = await serviceApi.update(id, formData);
        const updated = res?.data || res;
        if (updated) {
          setServices((prev) =>
            prev.map((s) => ((s._id || s.id) === id ? { ...s, ...formData } : s))
          );
        } else {
          await fetchServices();
        }
        toast.success("Service package updated successfully!");
      } else {
        // Create new service
        const res = await serviceApi.create(formData);
        const created = res?.data || res;

        if (created && typeof created === "object" && (created._id || created.id)) {
          setServices((prev) => [created, ...prev]);
        } else {
          await fetchServices();
        }
        toast.success("Service package created successfully!");
      }

      setIsModalOpen(false);
      setServiceToEdit(null);
    } catch (err) {
      console.error("Save service error:", err);
      const msg = err.response?.data?.message || "Failed to save service. Check backend connection.";
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Service
  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    const id = serviceToDelete._id || serviceToDelete.id;

    try {
      await serviceApi.delete(id);
      setServices((prev) => prev.filter((s) => (s._id || s.id) !== id));
      toast.success("Service removed from catalog");
    } catch (err) {
      console.error("Delete service error:", err);
      const msg = err.response?.data?.message || "Failed to delete service";
      toast.error(msg);
    } finally {
      setServiceToDelete(null);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (item) => {
    const id = item._id || item.id;
    const newStatus = item.status === "active" ? "inactive" : "active";

    try {
      await serviceApi.toggleStatus(id, newStatus);
      setServices((prev) =>
        prev.map((s) => ((s._id || s.id) === id ? { ...s, status: newStatus } : s))
      );
      toast.success(`Service marked as ${newStatus}`);
    } catch (err) {
      console.error("Toggle status error:", err);
      toast.error("Failed to update status");
    }
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      const title = (item.serviceName || item.name || "").toLowerCase();
      const brand = (item.brand || "").toLowerCase();
      const model = (item.model || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        brand.includes(query) ||
        model.includes(query) ||
        desc.includes(query);

      const catId = typeof item.category === "object" ? item.category?._id || item.category?.id : item.category;
      const matchesCategory =
        categoryFilter === "all" || catId === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, searchQuery, categoryFilter, statusFilter]);

  const total = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paginatedServices = useMemo(() => {
    return filteredServices.slice((page - 1) * limit, page * limit);
  }, [filteredServices, page, limit]);

  // Statistics
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.status === "active").length;
    const avgPrice =
      total > 0
        ? Math.round(
            services.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) /
              total
          )
        : 0;
    return { total, active, avgPrice };
  }, [services]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
            <span>🔧 Services Catalog</span>
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Manage technical repair offerings, diagnostic packages, pricing and warranties.
          </p>
        </div>

        <button
          onClick={() => {
            setServiceToEdit(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary gap-2 shadow-sm shrink-0"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add Service</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
            🛠️
          </div>
          <div>
            <div className="text-2xl font-extrabold text-base-content">{stats.total}</div>
            <div className="text-xs text-base-content/60">Total Service Packages</div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center text-xl font-bold">
            ✅
          </div>
          <div>
            <div className="text-2xl font-extrabold text-success">{stats.active}</div>
            <div className="text-xs text-base-content/60">Active & Bookable</div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl font-bold">
            💰
          </div>
          <div>
            <div className="text-2xl font-extrabold text-base-content font-mono">
              ₹{stats.avgPrice}
            </div>
            <div className="text-xs text-base-content/60">Avg. Package Price</div>
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
              placeholder="Search by service name, brand, model or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="input input-bordered input-sm w-full pl-9 focus:input-primary"
            />
          </div>

          {/* Filters: Category & Status */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.icon || "📂"} {c.categoryName || c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              onClick={() => {
                fetchCategories();
                fetchServices();
              }}
              title="Refresh services"
              className="btn btn-sm btn-square btn-ghost border border-base-300"
            >
              🔄
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <ServiceTable
        services={paginatedServices}
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
        onEdit={(item) => {
          setServiceToEdit(item);
          setIsModalOpen(true);
        }}
        onDelete={(item) => setServiceToDelete(item)}
        onToggleStatus={handleToggleStatus}
        onAddNew={() => {
          setServiceToEdit(null);
          setIsModalOpen(true);
        }}
      />

      {/* Add / Edit Modal */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setServiceToEdit(null);
        }}
        onSave={handleSave}
        serviceToEdit={serviceToEdit}
        categories={categories}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="modal modal-open z-50">
          <div className="modal-box p-6 bg-base-100 border border-base-300 max-w-sm text-center">
            <div className="w-14 h-14 rounded-full bg-error/10 text-error flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h3 className="font-bold text-lg text-base-content">Delete Service?</h3>
            <p className="text-sm text-base-content/60 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-base-content">
                "{serviceToDelete.serviceName || serviceToDelete.name}"
              </span>
              ? Customers will no longer be able to book this package.
            </p>
            <div className="modal-action justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
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
            onClick={() => setServiceToDelete(null)}
          ></div>
        </div>
      )}
    </div>
  );
}
