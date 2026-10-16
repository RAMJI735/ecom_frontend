import api from "../api";

export const productService = {
  // Create new product
  create: async (productData) => {
    const payload = {
      ...productData,
      type: "product",
    };
    try {
      const response = await api.post("/api/products", payload);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        const retry = await api.post("/api/services", payload);
        return retry.data;
      }
      throw error;
    }
  },

  // Read all products
  read: async (params = {}) => {
    try {
      const queryParams = { ...params, type: "product" };
      const response = await api.get("/api/products", { params: queryParams });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        const retry = await api.get("/api/services", {
          params: { ...params, type: "product" },
        });
        return retry.data;
      }
      throw error;
    }
  },

  // Get single product by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        const retry = await api.get(`/api/services/${id}`);
        return retry.data;
      }
      throw error;
    }
  },

  // Update product by ID
  update: async (id, productData) => {
    const payload = {
      ...productData,
      type: "product",
    };
    try {
      const response = await api.put(`/api/products/${id}`, payload);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        const retry = await api.put(`/api/services/${id}`, payload);
        return retry.data;
      }
      throw error;
    }
  },

  // Delete product by ID
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        const retry = await api.delete(`/api/services/${id}`);
        return retry.data;
      }
      throw error;
    }
  },

  // Toggle product status (active / inactive)
  toggleStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/products/${id}`, { status });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const retry = await api.patch(`/api/services/${id}`, { status });
          return retry.data;
        } catch {
          const putRetry = await api.put(`/api/services/${id}`, { status });
          return putRetry.data;
        }
      }
      throw error;
    }
  },
};

export default productService;
