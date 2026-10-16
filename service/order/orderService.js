import api from "../api";

export const orderService = {
  // Create a new order (from cart or direct payload)
  create: async (orderData) => {
    try {
      const response = await api.post("/api/orders", orderData);
      return response.data;
    } catch (error) {
      console.error("orderService.create error:", error);
      throw error;
    }
  },

  // Read orders with optional filtering & pagination
  read: async (params = {}) => {
    try {
      const queryParams = { all: true, ...params };
      const response = await api.get("/api/orders", { params: queryParams });
      return response.data;
    } catch (error) {
      console.error("orderService.read error:", error);
      throw error;
    }
  },

  // Alias for read()
  getAll: async (params = {}) => {
    return orderService.read(params);
  },

  // Get single order by Mongo _id or friendly orderNumber (e.g. VOLT-20261015-8491)
  getById: async (id) => {
    try {
      const response = await api.get(`/api/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`orderService.getById(${id}) error:`, error);
      throw error;
    }
  },

  // Get orders by customer userId
  getByUserId: async (userId, params = {}) => {
    try {
      const response = await api.get(`/api/orders/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error(`orderService.getByUserId(${userId}) error:`, error);
      throw error;
    }
  },

  // Update order status (Placed, Confirmed, Processing, Out for Delivery, Delivered, Cancelled)
  updateStatus: async (id, { status, note }) => {
    try {
      const response = await api.patch(`/api/orders/${id}/status`, {
        status,
        note: note || `Status updated to ${status}`,
      });
      return response.data;
    } catch (error) {
      console.error(`orderService.updateStatus(${id}) error:`, error);
      throw error;
    }
  },

  // Cancel order with optional reason
  cancel: async (id, reason = "Cancelled by user") => {
    try {
      const response = await api.patch(`/api/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        const retry = await api.put(`/api/orders/${id}/cancel`, { reason });
        return retry.data;
      }
      console.error(`orderService.cancel(${id}) error:`, error);
      throw error;
    }
  },

  // Helper to calculate statistics from current orders
  getStats: async () => {
    try {
      const res = await orderService.read({ all: true });
      const orders = Array.isArray(res?.data) ? res.data : [];

      const stats = {
        totalOrders: orders.length,
        pending: orders.filter((o) =>
          ["Pending", "Placed", "Confirmed"].includes(o.orderStatus)
        ).length,
        processing: orders.filter((o) =>
          ["Processing", "Out for Delivery"].includes(o.orderStatus)
        ).length,
        completed: orders.filter((o) => o.orderStatus === "Delivered").length,
        cancelled: orders.filter((o) => o.orderStatus === "Cancelled").length,
        totalRevenue: orders
          .filter((o) => o.orderStatus !== "Cancelled")
          .reduce((sum, o) => sum + (o.summary?.grandTotal || 0), 0),
      };

      return stats;
    } catch (error) {
      console.error("orderService.getStats error:", error);
      return {
        totalOrders: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0,
      };
    }
  },
};

export default orderService;
