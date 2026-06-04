import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export const useTransactions = (filters = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      // BE: GET /transactions?type=income|expense&from_date&to_date&limit&page
      const { month, year, ...rest } = filters;
      const query = { limit: 200, ...rest };
      if (month && year) {
        query.from_date = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        query.to_date = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
      }
      const { data } = await api.get("/transactions", { params: query });
      // BE returns { success, total, page, limit, transactions }
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
};
