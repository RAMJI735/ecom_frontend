"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { taskService } from "@service/task/taskService";
import AssignTaskModal from "@views/technicians/assignmodal";
import CreateTaskModal from "@views/technicians/createtaskmodal";
import UpdateStatusModal from "@views/technicians/updatestatusmodal";
import Pagination from "@/components/Pagination";

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [taskToAssign, setTaskToAssign] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [taskToUpdateStatus, setTaskToUpdateStatus] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      };
      const res = await taskService.getAll(params);
      const list = res?.data || (Array.isArray(res) ? res : []);
      if (res && (res.success || Array.isArray(res) || res.data)) {
        if (res.total !== undefined && res.totalPages !== undefined) {
          setRequests(list);
          setTotal(Number(res.total));
          setTotalPages(Number(res.totalPages));
        } else {
          // Fallback client-side pagination
          const totalCount = list.length;
          const computedTotalPages = Math.max(1, Math.ceil(totalCount / limit));
          const paginated = list.slice((page - 1) * limit, page * limit);
          setRequests(paginated);
          setTotal(totalCount);
          setTotalPages(computedTotalPages);
        }
      } else {
        setRequests([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching service requests:", err);
      toast.error("Failed to load service requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAssignTechnician = async (taskId, { technicianId, notes }) => {
    try {
      await taskService.assignTechnician(taskId, { technicianId, notes });
      toast.success("Technician assigned successfully");
      fetchRequests();
    } catch (err) {
      console.error("Failed to assign technician:", err);
      toast.error(err.response?.data?.message || "Failed to assign technician");
      throw err;
    }
  };

  const handleCreateTask = async (taskPayload) => {
    setCreateLoading(true);
    try {
      await taskService.create(taskPayload);
      toast.success("Service request created successfully");
      setIsCreateModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error(err.response?.data?.message || "Failed to create service request");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, payload) => {
    try {
      await taskService.updateStatus(taskId, payload);
      toast.success(`Status updated to ${payload.status}`);
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
      throw err;
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    const id = taskToDelete._id || taskToDelete.id;
    try {
      setRequests((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      setTaskToDelete(null);

      await taskService.delete(id);
      toast.success("Service request deleted successfully");

      if (requests.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchRequests();
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error(err.response?.data?.message || "Failed to delete request");
      fetchRequests();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
            <span>🎫 Service Requests & Bookings</span>
            <span className="badge badge-neutral text-xs font-mono">{total}</span>
          </h1>
          <p className="text-sm text-base-content/70">
            Incoming repair tickets, booking dispatch, and customer service requests.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/technicians/assignments" className="btn btn-outline btn-sm">
            Dispatch Board
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm gap-1.5 shadow-sm"
          >
            <span>+</span>
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
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
              placeholder="Search by ticket ID, customer name, phone, or service..."
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
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card bg-base-100 shadow-xs border border-base-300 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16">
            <span className="loading loading-spinner loading-md text-primary" />
            <span className="text-xs text-base-content/60 mt-2 font-medium">
              Loading service requests...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-xs">
              <thead>
                <tr className="border-b border-base-300 uppercase text-base-content/60 bg-base-200/50">
                  <th>Ticket ID</th>
                  <th>Customer</th>
                  <th>Service Requested</th>
                  <th>Date</th>
                  <th>Priority</th>
                  <th>Assigned Technician</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-base-content/60">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-2xl mb-3 shadow-inner">
                          🎫
                        </div>
                        <h4 className="font-semibold text-base text-base-content">
                          No Service Requests Found
                        </h4>
                        <p className="text-xs text-base-content/60 mt-1 mb-4">
                          When customer repair requests or emergency bookings are created, they will appear here.
                        </p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="btn btn-primary btn-sm"
                        >
                          + Create First Request
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id} className="hover:bg-base-200/40">
                      <td className="font-mono font-bold text-xs text-primary">
                        {req.ticketId || `TICKET-${req._id.slice(-4)}`}
                      </td>
                      <td>
                        <div className="font-semibold text-sm text-base-content">
                          {req.customer?.name}
                        </div>
                        <div className="text-[11px] text-base-content/60 font-mono">
                          {req.customer?.phone}
                        </div>
                      </td>
                      <td className="text-sm font-medium">
                        {req.serviceName || req.taskName}
                      </td>
                      <td className="text-xs text-base-content/70 font-mono">
                        {req.scheduledDate
                          ? new Date(req.scheduledDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge badge-xs font-semibold ${
                            req.priority === "Critical"
                              ? "badge-error"
                              : req.priority === "High"
                              ? "badge-warning"
                              : "badge-ghost"
                          }`}
                        >
                          {req.priority || "Normal"}
                        </span>
                      </td>
                      <td>
                        {req.technician ? (
                          <div className="flex items-center gap-2">
                            <div className="avatar placeholder">
                              <div className="bg-primary text-primary-content rounded-full w-6 h-6 text-[10px] font-bold uppercase">
                                {req.technician.name?.slice(0, 2) || "TC"}
                              </div>
                            </div>
                            <span className="font-medium text-xs text-base-content">
                              {req.technician.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-warning font-medium">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold ${
                            req.status === "Completed"
                              ? "badge-success"
                              : req.status === "In Progress"
                              ? "badge-primary"
                              : req.status === "Assigned"
                              ? "badge-info"
                              : req.status === "Cancelled"
                              ? "badge-error"
                              : "badge-warning"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setTaskToAssign(req);
                              setIsAssignModalOpen(true);
                            }}
                            className="btn btn-ghost btn-xs text-primary"
                          >
                            {req.technician ? "Reassign" : "Assign"}
                          </button>
                          <button
                            onClick={() => {
                              setTaskToUpdateStatus(req);
                              setIsStatusModalOpen(true);
                            }}
                            className="btn btn-ghost btn-xs"
                          >
                            Status
                          </button>
                          <button
                            onClick={() => setTaskToDelete(req)}
                            className="btn btn-ghost btn-xs text-error"
                            title="Delete Request"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && requests.length > 0 && (
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
            itemLabel="requests"
            name="requests-pagination"
          />
        )}
      </div>

      {/* Modals */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setTaskToAssign(null);
        }}
        task={taskToAssign}
        onAssignSuccess={handleAssignTechnician}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        loading={createLoading}
      />

      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setTaskToUpdateStatus(null);
        }}
        task={taskToUpdateStatus}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-sm p-5 bg-base-100 border border-base-300 shadow-2xl">
            <h3 className="font-bold text-base text-base-content flex items-center gap-2">
              <span className="text-error">⚠️</span> Delete Service Request
            </h3>
            <p className="text-xs text-base-content/70 mt-2">
              Are you sure you want to delete ticket{" "}
              <strong className="text-base-content">
                {taskToDelete.ticketId || taskToDelete.serviceName}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="modal-action mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="btn btn-error btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/40"
            onClick={() => setTaskToDelete(null)}
          />
        </div>
      )}
    </div>
  );
}
