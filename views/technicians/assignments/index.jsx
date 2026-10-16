"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { taskService } from "@service/task/taskService";
import { technicianService } from "@service/technician/technicianService";
import AssignTaskModal from "../assignmodal";
import CreateTaskModal from "../createtaskmodal";
import UpdateStatusModal from "../updatestatusmodal";
import Pagination from "@/components/Pagination";

export default function TechnicianAssignmentsView() {
  const searchParams = useSearchParams();
  const initialTechId = searchParams.get("technicianId") || "all";

  const [tasks, setTasks] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTechFilter, setSelectedTechFilter] = useState(initialTechId);
  const [viewMode, setViewMode] = useState("table"); // Default to Table view

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [taskToUpdateStatus, setTaskToUpdateStatus] = useState(null);

  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch Technicians for filter dropdown
  const loadTechnicians = async () => {
    try {
      const res = await technicianService.getAll({ all: "true" });
      if (res && res.data) {
        setTechnicians(res.data);
      }
    } catch (e) {
      console.error("Failed to load technicians:", e);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        technicianId: selectedTechFilter !== "all" ? selectedTechFilter : undefined,
        search: searchQuery.trim() || undefined,
      };

      const res = await taskService.getAll(params);
      if (res && res.success) {
        setTasks(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } else {
        setTasks([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
      toast.error("Failed to load task assignments");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, priorityFilter, selectedTechFilter, searchQuery]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle Assign Technician
  const handleAssignTechnician = async (taskId, { technicianId, notes }) => {
    try {
      await taskService.assignTechnician(taskId, { technicianId, notes });
      toast.success("Technician assigned successfully");
      fetchTasks();
    } catch (err) {
      console.error("Failed to assign technician:", err);
      toast.error(err.response?.data?.message || "Failed to assign technician");
      throw err;
    }
  };

  // Handle Create Task
  const handleCreateTask = async (taskPayload) => {
    setCreateLoading(true);
    try {
      await taskService.create(taskPayload);
      toast.success("Service ticket created successfully");
      setIsCreateModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error(err.response?.data?.message || "Failed to create service task");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (taskId, payload) => {
    try {
      await taskService.updateStatus(taskId, payload);
      toast.success(`Task status updated to ${payload.status}`);
      fetchTasks();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
      throw err;
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    const id = taskToDelete._id || taskToDelete.id;

    try {
      // Optimistically remove from UI state
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      setTaskToDelete(null);

      await taskService.delete(id);
      toast.success("Task deleted successfully");

      if (tasks.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchTasks();
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error(err.response?.data?.message || "Failed to delete task");
      fetchTasks();
    }
  };

  // Pipeline columns for Kanban view
  const columns = [
    {
      id: "Pending",
      title: "Pending Dispatch",
      badgeColor: "badge-warning",
      borderColor: "border-warning/30",
      accentBg: "bg-warning/5",
      icon: "⏳",
      tasks: tasks.filter((t) => t.status === "Pending"),
    },
    {
      id: "Assigned",
      title: "Assigned / Dispatched",
      badgeColor: "badge-info",
      borderColor: "border-info/30",
      accentBg: "bg-info/5",
      icon: "👷",
      tasks: tasks.filter((t) => t.status === "Assigned"),
    },
    {
      id: "In Progress",
      title: "In Progress",
      badgeColor: "badge-primary",
      borderColor: "border-primary/30",
      accentBg: "bg-primary/5",
      icon: "🔧",
      tasks: tasks.filter((t) => t.status === "In Progress"),
    },
    {
      id: "Completed",
      title: "Completed",
      badgeColor: "badge-success",
      borderColor: "border-success/30",
      accentBg: "bg-success/5",
      icon: "✅",
      tasks: tasks.filter((t) => t.status === "Completed"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-base-content/60">
        <Link href="/technicians" className="hover:text-primary transition-colors">
          Technicians
        </Link>
        <span>/</span>
        <span className="text-base-content font-semibold">Task Assignments</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content flex items-center gap-2">
            <span>⚡ Task Assignments & Dispatch</span>
            <span className="badge badge-neutral text-xs font-mono">{total}</span>
          </h1>
          <p className="text-sm text-base-content/70">
            Real-time technician workload, service ticket dispatching, and resolution tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/technicians" className="btn btn-outline btn-sm">
            Manage Staff
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm gap-1.5 shadow-sm"
          >
            <span>+</span>
            <span>Assign New Task</span>
          </button>
        </div>
      </div>

      {/* Quick Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          className={`card bg-base-100 border p-4 shadow-xs cursor-pointer transition-all hover:border-primary ${
            statusFilter === "all" ? "border-primary ring-1 ring-primary/30" : "border-base-300"
          }`}
        >
          <div className="text-xs font-medium text-base-content/60">Total Tickets</div>
          <div className="text-2xl font-bold text-base-content mt-1">{total}</div>
        </div>

        <div
          onClick={() => {
            setStatusFilter("Pending");
            setPage(1);
          }}
          className={`card bg-base-100 border p-4 shadow-xs cursor-pointer transition-all hover:border-warning ${
            statusFilter === "Pending" ? "border-warning ring-1 ring-warning/30" : "border-base-300"
          }`}
        >
          <div className="text-xs font-medium text-warning flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning inline-block" />
            Pending Dispatch
          </div>
          <div className="text-2xl font-bold text-warning mt-1">
            {tasks.filter((t) => t.status === "Pending").length}
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter("In Progress");
            setPage(1);
          }}
          className={`card bg-base-100 border p-4 shadow-xs cursor-pointer transition-all hover:border-primary ${
            statusFilter === "In Progress" ? "border-primary ring-1 ring-primary/30" : "border-base-300"
          }`}
        >
          <div className="text-xs font-medium text-primary flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            In Progress
          </div>
          <div className="text-2xl font-bold text-primary mt-1">
            {tasks.filter((t) => t.status === "In Progress").length}
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter("Completed");
            setPage(1);
          }}
          className={`card bg-base-100 border p-4 shadow-xs cursor-pointer transition-all hover:border-success ${
            statusFilter === "Completed" ? "border-success ring-1 ring-success/30" : "border-base-300"
          }`}
        >
          <div className="text-xs font-medium text-success flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            Completed
          </div>
          <div className="text-2xl font-bold text-success mt-1">
            {tasks.filter((t) => t.status === "Completed").length}
          </div>
        </div>
      </div>

      {/* Filter / Search Toolbar */}
      <div className="card bg-base-100 border border-base-300 shadow-xs p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
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
              placeholder="Search by ticket ID, customer, service, city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="input input-bordered input-sm w-full pl-9 focus:input-primary"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Technician Filter */}
            <select
              value={selectedTechFilter}
              onChange={(e) => {
                setSelectedTechFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm focus:select-primary max-w-[180px]"
            >
              <option value="all">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech._id} value={tech._id}>
                  {tech.name}
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
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>

            {/* View Mode Switcher */}
            <div className="join border border-base-300">
              <button
                onClick={() => setViewMode("table")}
                className={`join-item btn btn-xs ${
                  viewMode === "table" ? "btn-active btn-neutral" : "btn-ghost"
                }`}
                title="Table View"
              >
                ☰ Table
              </button>
              <button
                onClick={() => setViewMode("board")}
                className={`join-item btn btn-xs ${
                  viewMode === "board" ? "btn-active btn-neutral" : "btn-ghost"
                }`}
                title="Board View"
              >
                ▦ Board
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
            Loading tasks & assignments...
          </span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 shadow-sm p-12 text-center">
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-3xl mb-3 shadow-inner">
              📋
            </div>
            <h4 className="font-semibold text-base text-base-content">
              No Task Assignments Found
            </h4>
            <p className="text-xs text-base-content/60 mt-1 mb-4">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                ? "No service tasks match your current filter settings."
                : "Create customer service requests and assign technicians to begin dispatching."}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              + Create First Task
            </button>
          </div>
        </div>
      ) : viewMode === "board" ? (
        /* Board / Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map((col) => (
            <div
              key={col.id}
              className={`card bg-base-100 border ${col.borderColor} shadow-xs flex flex-col`}
            >
              {/* Column Header */}
              <div
                className={`p-3.5 border-b border-base-200 flex items-center justify-between ${col.accentBg} rounded-t-2xl`}
              >
                <div className="flex items-center gap-2">
                  <span>{col.icon}</span>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-base-content">
                    {col.title}
                  </h3>
                </div>
                <span className={`badge badge-sm font-mono ${col.badgeColor}`}>
                  {col.tasks.length}
                </span>
              </div>

              {/* Column Body / Tasks List */}
              <div className="p-3 space-y-3 min-h-[160px] max-h-[calc(100vh-280px)] overflow-y-auto [scrollbar-width:thin]">
                {col.tasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-base-content/40 italic">
                    No tickets in this stage
                  </div>
                ) : (
                  col.tasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-3.5 rounded-xl bg-base-200/50 border border-base-200 hover:border-base-300 hover:shadow-xs transition-all space-y-2.5"
                    >
                      {/* Top Bar: Ticket ID & Priority */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-primary">
                          {task.ticketId || `TICKET-${task._id.slice(-4)}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`badge badge-xs font-semibold ${
                              task.priority === "Critical"
                                ? "badge-error"
                                : task.priority === "High"
                                ? "badge-warning"
                                : "badge-ghost"
                            }`}
                          >
                            {task.priority || "Normal"}
                          </span>
                        </div>
                      </div>

                      {/* Service / Task Name */}
                      <div className="font-semibold text-sm text-base-content leading-snug">
                        {task.serviceName || task.taskName}
                      </div>

                      {/* Customer Info */}
                      <div className="text-xs text-base-content/70 space-y-0.5 pt-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span>👤</span>
                          <span className="font-medium text-base-content truncate">
                            {task.customer?.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-base-content/60 font-mono">
                          <span>📞 {task.customer?.phone}</span>
                          {task.customer?.city && <span>📍 {task.customer.city}</span>}
                        </div>
                      </div>

                      {/* Assigned Technician or Unassigned Alert */}
                      <div className="p-2 rounded-lg bg-base-100 border border-base-200/80 flex items-center justify-between gap-2">
                        {task.technician ? (
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="avatar placeholder shrink-0">
                              <div className="bg-primary text-primary-content rounded-full w-6 h-6 text-[10px] font-bold uppercase">
                                {task.technician.avatar ? (
                                  <img
                                    src={task.technician.avatar}
                                    alt={task.technician.name}
                                  />
                                ) : (
                                  task.technician.name?.slice(0, 2) || "TC"
                                )}
                              </div>
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-semibold text-base-content truncate">
                                {task.technician.name}
                              </div>
                              <div className="text-[10px] text-base-content/50 truncate">
                                {task.technician.phone}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-warning font-medium flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Unassigned</span>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setTaskToAssign(task);
                            setIsAssignModalOpen(true);
                          }}
                          className="btn btn-ghost btn-xs text-primary shrink-0 hover:bg-primary/10"
                          title={task.technician ? "Reassign Technician" : "Assign Technician"}
                        >
                          {task.technician ? "Reassign" : "Assign"}
                        </button>
                      </div>

                      {/* Date & Quick Action Row */}
                      <div className="pt-1 flex items-center justify-between border-t border-base-200/60 text-[11px]">
                        <span className="text-base-content/50">
                          📅 {task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : "Today"}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setTaskToUpdateStatus(task);
                              setIsStatusModalOpen(true);
                            }}
                            className="btn btn-ghost btn-xs text-base-content/70 hover:text-base-content"
                            title="Update Status"
                          >
                            Status ▾
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                            title="Delete Ticket"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                  <th>Ticket</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Priority</th>
                  <th>Assigned Technician</th>
                  <th>Status</th>
                  <th>Scheduled</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-base-200/40 transition-colors">
                    {/* Ticket ID */}
                    <td className="font-mono font-bold text-xs text-primary whitespace-nowrap">
                      {task.ticketId || `TICKET-${task._id.slice(-4)}`}
                    </td>

                    {/* Service & Cost */}
                    <td>
                      <div className="font-semibold text-sm text-base-content leading-tight">
                        {task.serviceName || task.taskName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {(task.finalCost || task.estimatedCost) ? (
                          <span className="badge badge-neutral badge-xs font-mono text-[10px]">
                            ₹{task.finalCost || task.estimatedCost}
                            {task.finalCost ? " (Final)" : " (Est.)"}
                          </span>
                        ) : null}
                        {task.notes && (
                          <span
                            className="text-[10px] text-base-content/50 truncate max-w-[150px] inline-block"
                            title={task.notes}
                          >
                            📝 {task.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td>
                      <div className="font-medium text-xs text-base-content">
                        {task.customer?.name}
                      </div>
                      <div className="text-[11px] text-base-content/60 font-mono">
                        {task.customer?.phone}
                      </div>
                      {task.customer?.city && (
                        <div className="text-[10px] text-base-content/50 truncate max-w-[140px]">
                          📍 {task.customer.city}
                        </div>
                      )}
                    </td>

                    {/* Priority */}
                    <td>
                      <span
                        className={`badge badge-xs font-semibold ${
                          task.priority === "Critical"
                            ? "badge-error"
                            : task.priority === "High"
                            ? "badge-warning"
                            : task.priority === "Low"
                            ? "badge-neutral"
                            : "badge-ghost"
                        }`}
                      >
                        {task.priority || "Normal"}
                      </span>
                    </td>

                    {/* Assigned Technician */}
                    <td>
                      {task.technician ? (
                        <div className="flex items-center gap-2">
                          <div className="avatar online placeholder shrink-0">
                            <div className="bg-primary text-primary-content rounded-full w-7 h-7 text-[10px] font-bold uppercase">
                              {task.technician.avatar ? (
                                <img
                                  src={task.technician.avatar}
                                  alt={task.technician.name}
                                />
                              ) : (
                                task.technician.name?.slice(0, 2) || "TC"
                              )}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-base-content truncate">
                              {task.technician.name}
                            </div>
                            <div className="text-[10px] text-base-content/50 truncate">
                              {Array.isArray(task.technician.specialization)
                                ? task.technician.specialization[0]
                                : task.technician.specialization || task.technician.phone}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setTaskToAssign(task);
                            setIsAssignModalOpen(true);
                          }}
                          className="btn btn-warning btn-outline btn-xs gap-1"
                        >
                          <span>+</span>
                          <span>Dispatch</span>
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`badge badge-sm font-semibold gap-1.5 ${
                          task.status === "Completed"
                            ? "badge-success text-success-content"
                            : task.status === "In Progress"
                            ? "badge-primary text-primary-content"
                            : task.status === "Assigned"
                            ? "badge-info text-info-content"
                            : task.status === "Cancelled"
                            ? "badge-error text-error-content"
                            : "badge-warning text-warning-content"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                        {task.status}
                      </span>
                    </td>

                    {/* Scheduled Date */}
                    <td className="text-base-content/60 font-mono text-[11px] whitespace-nowrap">
                      {task.scheduledDate
                        ? new Date(task.scheduledDate).toLocaleDateString()
                        : "Today"}
                    </td>

                    {/* Actions */}
                    <td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setTaskToAssign(task);
                            setIsAssignModalOpen(true);
                          }}
                          className="btn btn-ghost btn-xs text-primary hover:bg-primary/10"
                          title="Assign or Reassign Technician"
                        >
                          {task.technician ? "Reassign" : "Dispatch"}
                        </button>
                        <button
                          onClick={() => {
                            setTaskToUpdateStatus(task);
                            setIsStatusModalOpen(true);
                          }}
                          className="btn btn-ghost btn-xs text-base-content/70 hover:text-base-content"
                          title="Update Status"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                          title="Delete Ticket"
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
      {!loading && tasks.length > 0 && (
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
            itemLabel="tasks"
            name="tasks-pagination"
          />
        </div>
      )}

      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setTaskToAssign(null);
        }}
        task={taskToAssign}
        onAssignSuccess={handleAssignTechnician}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        loading={createLoading}
      />

      {/* Update Status Modal */}
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
              <span className="text-error">⚠️</span> Delete Service Task
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
