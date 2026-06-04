import api from "./api";

export const incomeService = {
  // POST /transactions  { type: "income", title, amount }
  create: async ({ title, amount }) => {
    const { data } = await api.post("/transactions", {
      type: "income",
      title,
      amount,
    });
    return data;
  },

  // GET /transactions?type=income[&from_date&to_date&limit&page]
  getAll: async (params = {}) => {
    const { month, year, ...rest } = params;
    const query = { type: "income", ...rest };
    if (month && year) {
      query.from_date = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      query.to_date = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
    }
    const { data } = await api.get("/transactions", { params: query });
    return data;
  },
};
