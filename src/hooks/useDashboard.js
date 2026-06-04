import { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";

export const useDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const [todayData, pendingRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getPending(),
      ]);
      setSummary(todayData.summary);
      setPendingData(pendingRes);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async (month, year) => {
    try {
      const data = await dashboardService.getMonthlySummary(month, year);
      setMonthlySummary(data.summary);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load monthly summary");
    }
  };

  useEffect(() => {
    fetchSummary();
    const now = new Date();
    fetchMonthlySummary(now.getMonth() + 1, now.getFullYear());
  }, []);

  return { summary, monthlySummary, pendingData, loading, error, refetch: fetchSummary };
};
