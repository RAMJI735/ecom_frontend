import api from "../api";

export const categoryService = {
    create: async (categoryData) => {
        try {
            const response = await api.post("/api/service-categories", categoryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    read: async () => {
        try {
            const response = await api.get("/api/service-categories");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    update: async (id, categoryData) => {
        try {
            const response = await api.put(`/api/service-categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    delete: async (id) => {
        try {
            const response = await api.delete(`/api/service-categories/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default categoryService;

