import api from "./api";

export const creditService = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/credits", { params });
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/credits", payload);
    return data;
  },

  updatePayment: async (id, paid_amount) => {
    const { data } = await api.patch(`/credits/${id}/pay`, { paid_amount });
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/credits/${id}`);
    return data;
  },
};
