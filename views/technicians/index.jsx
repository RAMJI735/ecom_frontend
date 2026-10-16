"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { technicianService } from "@service/technician/technicianService";
import AddTechnicianModal from "./addmodal";
import Pagination from "@/components/Pagination";

export default function TechniciansView() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [technicianToEdit, setTechnicianToEdit] = useState(null);
  const [technicianToDelete, setTechnicianToDelete] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        status: statusFilter,
        search: searchQuery.trim() || undefined,
      };
      const res = await technicianService.getAll(params);
      if (res && res.success) {
        setTechnicians(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } else {
        setTechnicians([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error loading technicians:", err);
      toast.error("Failed to load technicians");
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  // Handle Create / Edit Submit
  const handleFormSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (technicianToEdit) {
        await technicianService.update(technicianToEdit._id, formData);
        toast.success("Technician updated successfully");
      } else {
        await technicianService.create(formData);
        toast.success("Technician registered successfully");
      }
      setIsModalOpen(false);
      setTechnicianToEdit(null);
      fetchTechnicians();
    } catch (err) {
      console.error("Save error:", err);
      const msg = err.response?.data?.message || "Failed to save technician";
      toast.error(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!technicianToDelete) return;
    try {
      await technicianService.delete(technicianToDelete._id);
      toast.success("Technician removed successfully");
      setTechnicianToDelete(null);
      fetchTechnicians();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete technician");
    }
  };

  // Toggle Active / Inactive
  const handleToggleStatus = async (tech) => {
    const nextStatus = tech.status === "active" ? "inactive" : "active";
    try {
      await technicianService.update(tech._id, { status: nextStatus });
      toast.success(`Marked as ${nextStatus}`);
      setTechnicians((prev) =>
        prev.map((t) => (t._id === tech._id ? { ...t, status: nextStatus } : t))
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      toast.error("Failed to update status");
    }
  };

  // Stats calculation
  const activeCount = technicians.filter((t) => t.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
            <span>👷 Certified Technicians</span>
            <span className="badge badge-neutral text-xs font-mono">{total}</span>
          </h1>
          <p className="text-sm text-base-content/70">
            Field service technicians, electricians, and dispatch management.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/technicians/assignments"
            className="btn btn-outline btn-sm gap-2"
          >
            <span>📋</span>
            <span>Assignments Board</span>
          </Link>
          <button
            onClick={() => {
              setTechnicianToEdit(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary btn-sm gap-1.5 shadow-sm"
          >
            <span>+</span>
            <span>Add Technician</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-xs p-4">
          <div className="text-xs font-medium text-base-content/60">Total Staff</div>
          <div className="text-2xl font-bold text-base-content mt-1">{total}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-xs p-4">
          <div className="text-xs font-medium text-success flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            Active on Duty
          </div>
          <div className="text-2xl font-bold text-success mt-1">{activeCount}</div>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-xs p-4">
          <div className="text-xs font-medium text-base-content/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-base-content/30 inline-block" />
            Inactive / Leave
          </div>
          <div className="text-2xl font-bold text-base-content/60 mt-1">
            {Math.max(0, total - activeCount)}
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-xs p-4 flex flex-col justify-center">
          <Link
            href="/technicians/assignments"
            className="text-xs font-semibold text-primary hover:underline flex items-center justify-between"
          >
            <span>Dispatch Tasks</span>
            <span>→</span>
          </Link>
          <div className="text-[11px] text-base-content/60 mt-0.5">
            Manage ticket assignments
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card bg-base-100 border border-base-300 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
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
              placeholder="Search by name, email, phone, or specialty..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="input input-bordered input-sm w-full pl-9 focus:input-primary"
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
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* View Mode Switcher */}
            <div className="join border border-base-300">
              <button
                onClick={() => setViewMode("grid")}
                className={`join-item btn btn-xs ${
                  viewMode === "grid" ? "btn-active btn-neutral" : "btn-ghost"
                }`}
                title="Grid View"
              >
                ▦
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`join-item btn btn-xs ${
                  viewMode === "table" ? "btn-active btn-neutral" : "btn-ghost"
                }`}
                title="Table View"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <span className="loading loading-spinner loading-md text-primary" />
          <span className="text-xs text-base-content/60 mt-2 font-medium">
            Loading technicians...
          </span>
        </div>
      ) : technicians.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 shadow-sm p-12 text-center">
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-3xl mb-3 shadow-inner">
              👷‍♂️
            </div>
            <h4 className="font-semibold text-base text-base-content">
              No Technicians Found
            </h4>
            <p className="text-xs text-base-content/60 mt-1 mb-4">
              {searchQuery || statusFilter !== "all"
                ? "No technicians match your current search filters."
                : "Register certified electricians and service technicians to dispatch tasks."}
            </p>
            <button
              onClick={() => {
                setTechnicianToEdit(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
            >
              + Add First Technician
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {technicians.map((t) => (
            <div
              key={t._id}
              className="card bg-base-100 border border-base-300 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="card-body p-4.5 space-y-3">
                {/* Status & Quick Toggle */}
                <div className="flex items-center justify-between">
                  <span
                    className={`badge badge-sm font-semibold capitalize ${
                      t.status === "active" ? "badge-success" : "badge-ghost opacity-70"
                    }`}
                  >
                    {t.status}
                  </span>
                  <div className="dropdown dropdown-end">
                    <label
                      tabIndex={0}
                      className="btn btn-ghost btn-circle btn-xs text-base-content/60"
                    >
                      •••
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-1 shadow-lg bg-base-100 rounded-box w-36 text-xs border border-base-200 z-10"
                    >
                      <li>
                        <button
                          onClick={() => {
                            setTechnicianToEdit(t);
                            setIsModalOpen(true);
                          }}
                        >
                          ✏️ Edit
                        </button>
                      </li>
                      <li>
                        <button onClick={() => handleToggleStatus(t)}>
                          {t.status === "active" ? "⏸ Set Inactive" : "▶ Set Active"}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => setTechnicianToDelete(t)}
                          className="text-error"
                        >
                          🗑 Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div
                    className={`avatar ${
                      t.status === "active" ? "online" : "offline"
                    } placeholder shrink-0`}
                  >
                    <div className="bg-primary text-primary-content rounded-full w-12 h-12 text-sm font-bold uppercase shadow-xs">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.name} />
                      ) : (
                        t.name.slice(0, 2)
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-base-content truncate">
                      {t.name}
                    </h3>
                    <p className="text-[11px] text-base-content/60 truncate">
                      {t.email}
                    </p>
                    <a
                      href={`tel:${t.phone}`}
                      className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>📞</span>
                      <span>{t.phone}</span>
                    </a>
                  </div>
                </div>

                {/* Specializations Badges */}
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider">
                    Specialty
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-14 overflow-hidden">
                    {Array.isArray(t.specialization) && t.specialization.length > 0 ? (
                      t.specialization.map((spec, i) => (
                        <span
                          key={i}
                          className="badge badge-neutral badge-xs py-1.5 px-2 text-[10px]"
                        >
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-base-content/50">
                        General Electrical
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-3 border-t border-base-200 bg-base-200/20 flex items-center justify-between text-xs">
                <Link
                  href={`/technicians/assignments?technicianId=${t._id}`}
                  className="text-primary hover:underline font-medium text-[11px] flex items-center gap-1"
                >
                  <span>View Tasks</span>
                  <span>→</span>
                </Link>
                <button
                  onClick={() => {
                    setTechnicianToEdit(t);
                    setIsModalOpen(true);
                  }}
                  className="btn btn-ghost btn-xs text-base-content/70 hover:text-base-content"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card bg-base-100 shadow-xs border border-base-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="border-b border-base-300 uppercase text-base-content/60 bg-base-200/50">
                  <th>Technician</th>
                  <th>Contact Info</th>
                  <th>Specializations</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((t) => (
                  <tr key={t._id} className="hover:bg-base-200/40">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`avatar ${
                            t.status === "active" ? "online" : "offline"
                          } placeholder shrink-0`}
                        >
                          <div className="bg-primary text-primary-content rounded-full w-8 h-8 text-xs font-bold uppercase">
                            {t.avatar ? (
                              <img src={t.avatar} alt={t.name} />
                            ) : (
                              t.name.slice(0, 2)
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-base-content">
                            {t.name}
                          </div>
                          <div className="text-[11px] text-base-content/60">
                            {t.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-mono text-xs">{t.phone}</div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.isArray(t.specialization) &&
                          t.specialization.map((spec, i) => (
                            <span
                              key={i}
                              className="badge badge-neutral badge-xs py-1 px-1.5 text-[10px]"
                            >
                              {spec}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(t)}
                        className={`badge badge-sm font-semibold capitalize cursor-pointer hover:opacity-80 ${
                          t.status === "active"
                            ? "badge-success"
                            : "badge-ghost opacity-70"
                        }`}
                        title="Click to toggle status"
                      >
                        {t.status}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/technicians/assignments?technicianId=${t._id}`}
                          className="btn btn-ghost btn-xs text-primary"
                          title="View Assigned Tasks"
                        >
                          📋 Tasks
                        </Link>
                        <button
                          onClick={() => {
                            setTechnicianToEdit(t);
                            setIsModalOpen(true);
                          }}
                          className="btn btn-ghost btn-xs"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setTechnicianToDelete(t)}
                          className="btn btn-ghost btn-xs text-error"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && technicians.length > 0 && (
        <div className="card bg-base-100 border border-base-300 shadow-xs overflow-hidden">
          <Pagination
            page={page}
            total={total}
            limit={limit}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            itemLabel="technicians"
            name="technicians-pagination"
          />
        </div>
      )}

      {/* Add / Edit Technician Modal */}
      <AddTechnicianModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTechnicianToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        technicianToEdit={technicianToEdit}
        loading={modalLoading}
      />

      {/* Delete Confirmation Modal */}
      {technicianToDelete && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-sm p-5 bg-base-100 border border-base-300 shadow-2xl">
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <span className="text-error">⚠️</span> Delete Technician
            </h3>
            <p className="text-xs text-base-content/70 mt-2">
              Are you sure you want to remove{" "}
              <strong className="text-base-content">
                {technicianToDelete.name}
              </strong>
              ? Any pending or assigned tasks will be unassigned back to pending.
            </p>
            <div className="modal-action mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setTechnicianToDelete(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-error btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/40"
            onClick={() => setTechnicianToDelete(null)}
          />
        </div>
      )}
    </div>
  );
}
