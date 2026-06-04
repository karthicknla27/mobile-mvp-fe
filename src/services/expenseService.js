import api from "./api";

export const expenseService = {
  // POST /transactions  { type: "expense", title, amount, paid_amount? }
  create: async ({ spareName, totalAmount, paidAmount, supplierName }) => {
    const { data } = await api.post("/transactions", {
      type: "expense",
      title: spareName,
      amount: totalAmount,
      paid_amount: paidAmount,
      supplier_name: supplierName || undefined,
    });
    return data;
  },

  // GET /transactions?type=expense[&from_date&to_date&limit&page]
  getAll: async (params = {}) => {
    const { month, year, ...rest } = params;
    const query = { type: "expense", ...rest };
    if (month && year) {
      query.from_date = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      query.to_date = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
    }
    const { data } = await api.get("/transactions", { params: query });
    return data;
  },
};
