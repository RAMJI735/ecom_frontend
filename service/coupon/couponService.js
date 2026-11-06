import api from "../api";

export const couponService = {
  async get(params = {}) {
    const res = await api.get("/api/coupons", { params });
    return res.data?.data || res.data || [];
  },

  async create(payload) {
    const res = await api.post("/api/coupons", payload);
    return res.data?.data || res.data;
  },

  async update(id, payload) {
    const res = await api.put(`/api/coupons/${id}`, payload);
    return res.data?.data || res.data;
  },

  async delete(id) {
    const res = await api.delete(`/api/coupons/${id}`);
    return res.data?.data || res.data;
  },

  async validate(code, subtotal) {
    const res = await api.post("/api/coupons/validate", { code, subtotal });
    return res.data;
  },
};

export default couponService;

