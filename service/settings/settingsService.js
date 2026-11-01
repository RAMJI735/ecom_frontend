import api from "../api";

export const settingsService = {
  async get() {
    const res = await api.get("/api/settings");
    return res.data?.data || res.data;
  },

  async update(payload) {
    const res = await api.put("/api/settings", payload);
    return res.data?.data || res.data;
  },

  async addBanner(banner) {
    const res = await api.post("/api/settings/banners", banner);
    return res.data?.data || res.data;
  },

  async updateBanner(id, banner) {
    const res = await api.put(`/api/settings/banners/${id}`, banner);
    return res.data?.data || res.data;
  },

  async deleteBanner(id) {
    const res = await api.delete(`/api/settings/banners/${id}`);
    return res.data?.data || res.data;
  },
};

export default settingsService;

