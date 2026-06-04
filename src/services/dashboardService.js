import api from "./api";

export const dashboardService = {
  // GET /dashboard/today
  getSummary: async () => {
    const { data } = await api.get("/dashboard/today");
    return data;
  },

  // GET /dashboard/month?month=YYYY-MM
  getMonthlySummary: async (month, year) => {
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    const { data } = await api.get("/dashboard/month", {
      params: { month: monthStr },
    });
    return data;
  },

  // GET /dashboard/pending
  getPending: async () => {
    const { data } = await api.get("/dashboard/pending");
    return data;
  },
};
