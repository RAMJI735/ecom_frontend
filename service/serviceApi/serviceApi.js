import api from "../api";

export const serviceApi = {
    // Create new service
    create: async (serviceData) => {
        try {
            const response = await api.post("/api/services", serviceData);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                const retry = await api.post("/api/service", serviceData);
                return retry.data;
            }
            throw error;
        }
    },

    // Read all services
    read: async (params = {}) => {
        try { 
            const response = await api.get("/api/services", { params });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                const retry = await api.get("/api/service", { params });
                return retry.data;
            }
            throw error;
        }
    },

    // Get single service by ID
    getById: async (id) => {
        try {
            const response = await api.get(`/api/services/${id}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                const retry = await api.get(`/api/service/${id}`);
                return retry.data;
            }
            throw error;
        }
    },

    // Update service by ID
    update: async (id, serviceData) => {
        try {
            const response = await api.put(`/api/services/${id}`, serviceData);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                const retry = await api.put(`/api/service/${id}`, serviceData);
                return retry.data;
            }
            throw error;
        }
    },

    // Delete service by ID
    delete: async (id) => {
        try {
            const response = await api.delete(`/api/services/${id}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                const retry = await api.delete(`/api/service/${id}`);
                return retry.data;
            }
            throw error;
        }
    },

    // Toggle service status (active / inactive)
    toggleStatus: async (id, status) => {
        try {
            const response = await api.patch(`/api/services/${id}`, { status });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                try {
                    const retry = await api.patch(`/api/service/${id}`, { status });
                    return retry.data;
                } catch {
                    const putRetry = await api.put(`/api/services/${id}`, { status });
                    return putRetry.data;
                }
            }
            throw error;
        }
    }
};

export default serviceApi;
