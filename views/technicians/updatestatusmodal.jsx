"use client";

import { useState, useEffect } from "react";

export default function UpdateStatusModal({
  isOpen,
  onClose,
  task,
  onUpdateStatus,
}) {
  const [status, setStatus] = useState("In Progress");
  const [completionNotes, setCompletionNotes] = useState("");
  const [finalCost, setFinalCost] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setStatus(task.status || "In Progress");
      setCompletionNotes(task.completionNotes || "");
      setFinalCost(task.finalCost || task.estimatedCost || "");
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdateStatus(task._id, {
        status,
        completionNotes: completionNotes.trim(),
        finalCost: finalCost !== "" ? Number(finalCost) : undefined,
      });
      onClose();
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-md p-0 overflow-hidden bg-base-100 shadow-2xl border border-base-300">
        <div className="p-4 border-b border-base-200 flex items-center justify-between bg-base-200/50">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔄</span>
            <div>
              <h3 className="font-bold text-base text-base-content leading-tight">
                Update Task Status
              </h3>
              <p className="text-xs text-base-content/60 font-mono">
                {task.ticketId || task.serviceName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs text-base-content">
                  New Status
                </span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="select select-bordered select-sm w-full focus:select-primary"
              >
                <option value="Pending">Pending (Unassigned / Scheduled)</option>
                <option value="Assigned">Assigned (Dispatched)</option>
                <option value="In Progress">In Progress (Technician Working)</option>
                <option value="Completed">Completed (Work Finished)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {status === "Completed" && (
              <>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      Final Service Cost (₹)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500"
                    value={finalCost}
                    onChange={(e) => setFinalCost(e.target.value)}
                    className="input input-bordered input-sm w-full focus:input-primary"
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-xs text-base-content">
                      Completion Notes / Resolution Summary
                    </span>
                  </label>
                  <textarea
                    maxLength={1000}
                    placeholder="e.g. Replaced faulty copper coil and refilled R32 refrigerant. Tested pressure and cooling."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    rows={3}
                    className="textarea textarea-bordered textarea-sm w-full focus:textarea-primary"
                  />
                </div>
              </>
            )}
          </div>

          <div className="p-4 border-t border-base-200 flex items-center justify-end gap-2 bg-base-200/30">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm min-w-28"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Updating...
                </>
              ) : (
                "Save Status"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
