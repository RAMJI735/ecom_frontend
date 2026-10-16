"use client";

import { useState, useEffect } from "react";
import { technicianService } from "@service/technician/technicianService";

export default function AssignTaskModal({
  isOpen,
  onClose,
  task,
  onAssignSuccess,
}) {
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTechnicians();
      if (task) {
        setSelectedTechId(
          task.technician?._id || task.technician || ""
        );
        setNotes(task.notes || "");
      }
    }
  }, [isOpen, task]);

  const fetchTechnicians = async () => {
    setLoadingTechs(true);
    try {
      const res = await technicianService.getAvailable();
      const list = res.data || [];
      setTechnicians(list);
    } catch (err) {
      console.error("Failed to fetch available technicians:", err);
      setTechnicians([]);
    } finally {
      setLoadingTechs(false);
    }
  };

  if (!isOpen || !task) return null;

  const filteredTechs = technicians.filter((t) => {
    const q = searchFilter.toLowerCase();
    const nameMatch = t.name?.toLowerCase().includes(q);
    const specMatch = Array.isArray(t.specialization) && t.specialization.some((s) => s.toLowerCase().includes(q));
    const phoneMatch = t.phone?.includes(q);
    return nameMatch || specMatch || phoneMatch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTechId) return;
    setSubmitting(true);
    try {
      await onAssignSuccess(task._id || task.id, {
        technicianId: selectedTechId,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error("Assignment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-lg p-0 overflow-hidden bg-base-100 shadow-2xl border border-base-300">
        {/* Header */}
        <div className="p-5 border-b border-base-200 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-lg text-base-content leading-tight">
                Assign Technician
              </h3>
              <p className="text-xs text-base-content/60">
                Dispatch an active certified technician to this service ticket
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto [scrollbar-width:thin]">
            {/* Task Info Summary Banner */}
            <div className="p-3.5 rounded-xl bg-base-200/60 border border-base-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">
                  {task.ticketId || `TICKET-${task._id?.slice(-4)}`}
                </span>
                <span
                  className={`badge badge-xs font-semibold ${
                    task.priority === "Critical"
                      ? "badge-error"
                      : task.priority === "High"
                      ? "badge-warning"
                      : "badge-ghost"
                  }`}
                >
                  {task.priority || "Normal"} Priority
                </span>
              </div>
              <h4 className="font-bold text-sm text-base-content">
                {task.serviceName || task.taskName || "General Electrical Service"}
              </h4>
              <div className="text-xs text-base-content/70 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <span>👤 {task.customer?.name || task.customerName || "Customer"}</span>
                <span>📞 {task.customer?.phone || task.customerPhone || "N/A"}</span>
                {task.customer?.city && <span>📍 {task.customer.city}</span>}
              </div>
            </div>

            {/* Technician Selection */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs text-base-content">
                  Select Active Technician <span className="text-error">*</span>
                </span>
                <span className="label-text-alt text-xs text-base-content/60">
                  {technicians.length} available
                </span>
              </label>

              {/* Quick Search in list if more than 3 */}
              {technicians.length > 3 && (
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search by name, phone, skill..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="input input-bordered input-xs w-full focus:input-primary"
                  />
                </div>
              )}

              {loadingTechs ? (
                <div className="flex items-center justify-center p-6 bg-base-200/40 rounded-xl">
                  <span className="loading loading-spinner loading-sm text-primary" />
                  <span className="text-xs ml-2 text-base-content/70">Loading technicians...</span>
                </div>
              ) : technicians.length === 0 ? (
                <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 text-center">
                  <p className="text-xs font-medium text-warning">
                    No active technicians currently found.
                  </p>
                  <p className="text-[11px] text-base-content/60 mt-0.5">
                    Please create or activate a technician in the Technicians menu first.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto [scrollbar-width:thin] pr-1">
                  {filteredTechs.map((tech) => {
                    const isSelected = selectedTechId === tech._id;
                    return (
                      <div
                        key={tech._id}
                        onClick={() => setSelectedTechId(tech._id)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-xs"
                            : "border-base-200 hover:border-base-300 hover:bg-base-200/30"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="avatar placeholder shrink-0">
                            <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 text-xs font-bold uppercase">
                              {tech.avatar ? (
                                <img src={tech.avatar} alt={tech.name} />
                              ) : (
                                tech.name.slice(0, 2)
                              )}
                            </div>
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-xs text-base-content truncate">
                              {tech.name}
                            </div>
                            <div className="text-[11px] text-base-content/60 truncate">
                              {Array.isArray(tech.specialization)
                                ? tech.specialization.join(", ")
                                : tech.specialization || "General"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-base-content/60">
                            {tech.phone}
                          </span>
                          <input
                            type="radio"
                            name="technician"
                            checked={isSelected}
                            onChange={() => setSelectedTechId(tech._id)}
                            className="radio radio-primary radio-xs"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dispatch Notes / Instructions */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs text-base-content">
                  Dispatch Instructions & Notes (Optional)
                </span>
              </label>
              <textarea
                maxLength={1000}
                placeholder="e.g. Customer reported burning smell near main panel. Carry 63A MCB replacement."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="textarea textarea-bordered textarea-sm w-full focus:textarea-primary"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-base-200 flex items-center justify-end gap-2 bg-base-200/30">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedTechId || technicians.length === 0}
              className="btn btn-primary btn-sm min-w-32"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Assigning...
                </>
              ) : (
                "Confirm Assignment"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
