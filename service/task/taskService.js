import api from "../api";

export const taskService = {
  // Get all tasks / service requests
  getAll: async (params = {}) => {
    const response = await api.get("/api/tasks", {
      params: {
        ...params,
        _t: Date.now(),
      },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    return response.data;
  },

  // Get task by ID
  getById: async (id) => {
    const response = await api.get(`/api/tasks/${id}`, {
      params: { _t: Date.now() },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    return response.data;
  },

  // Create task / service request
  create: async (taskData) => {
    const response = await api.post("/api/tasks", taskData);
    return response.data;
  },

  // Assign or reassign technician to task
  assignTechnician: async (id, { technicianId, notes }) => {
    const response = await api.patch(`/api/tasks/${id}/assign`, { technicianId, notes });
    return response.data;
  },

  // Update task status (Pending -> Assigned -> In Progress -> Completed -> Cancelled)
  updateStatus: async (id, { status, completionNotes, finalCost }) => {
    const response = await api.patch(`/api/tasks/${id}/status`, {
      status,
      completionNotes,
      finalCost,
    });
    return response.data;
  },

  // Update task details
  update: async (id, taskData) => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete task
  delete: async (id) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },
};

export default taskService;
