import api from "../api";

export const technicianService = {
  // Get all technicians (with optional params: search, status, specialization, page, limit)
  getAll: async (params = {}) => {
    const response = await api.get("/api/technicians", { params });
    return response.data;
  },

  // Get active technicians for quick assignment
  getAvailable: async (specialization) => {
    const response = await api.get("/api/technicians/available", {
      params: specialization ? { specialization } : {},
    });
    return response.data;
  },

  // Get technician by ID (includes active tasks)
  getById: async (id) => {
    const response = await api.get(`/api/technicians/${id}`);
    return response.data;
  },

  // Create technician
  create: async (technicianData) => {
    const response = await api.post("/api/technicians", technicianData);
    return response.data;
  },

  // Update technician
  update: async (id, technicianData) => {
    const response = await api.put(`/api/technicians/${id}`, technicianData);
    return response.data;
  },

  // Delete technician
  delete: async (id) => {
    const response = await api.delete(`/api/technicians/${id}`);
    return response.data;
  },
};

export default technicianService;
