import { useState } from "react";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/StatCard";
import MonthlySummary from "../components/MonthlySummary";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import PendingBySupplier from "../components/PendingBySupplier";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCurrency } from "../utils/formatCurrency";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  BarChart2,
  AlertCircle,
  CreditCard,
} from "lucide-react";

const STORAGE_KEY = "inHandCashOverride";

const DashboardPage = () => {
  const { summary, monthlySummary, pendingData, loading } = useDashboard();

  const calculatedCash =
    (summary?.income?.paid || 0) - (summary?.expense?.paid || 0);

  const [cashOverride, setCashOverride] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? Number(stored) : null;
  });
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const displayCash = cashOverride !== null ? cashOverride : calculatedCash;

  const startEdit = () => {
    setEditValue(String(displayCash));
    setEditing(true);
  };

  const saveEdit = () => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      setCashOverride(val);
      localStorage.setItem(STORAGE_KEY, String(val));
    }
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  const resetToCalculated = () => {
    setCashOverride(null);
    localStorage.removeItem(STORAGE_KEY);
    setEditing(false);
  };

  const cards = [
    {
      title: "Today Income",
      value: formatCurrency(summary?.income?.total || 0),
      icon: TrendingUp,
      textColor: "text-green-600",
      bgLight: "bg-green-50",
    },
    {
      title: "Today Expense",
      value: formatCurrency(summary?.expense?.total || 0),
      icon: TrendingDown,
      textColor: "text-red-600",
      bgLight: "bg-red-50",
    },
    {
      title: "Today Profit",
      value: formatCurrency(summary?.profit || 0),
      icon: DollarSign,
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      title: "Monthly Profit",
      value: formatCurrency(monthlySummary?.profit || 0),
      icon: BarChart2,
      textColor: "text-indigo-600",
      bgLight: "bg-indigo-50",
    },
    {
      title: "Total Pending",
      value: formatCurrency(summary?.total_pending_all_time || 0),
      icon: AlertCircle,
      textColor: "text-orange-600",
      bgLight: "bg-orange-50",
    },
    {
      title: "Credit to Customer",
      value: formatCurrency(summary?.total_credit_pending || 0),
      icon: CreditCard,
      textColor: "text-purple-600",
      bgLight: "bg-purple-50",
    },
  ];

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Overview of your shop's financial performance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.slice(0, 3).map((card) => (
          <StatCard key={card.title} {...card} />
        ))}

        {/* In-Hand Cash — editable */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-purple-50 p-3 rounded-xl">
            <Wallet className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">
              In-Hand Cash
              {cashOverride !== null && (
                <span className="ml-1 text-purple-400 normal-case">
                  (manual)
                </span>
              )}
            </p>
            {editing ? (
              <div className="mt-1 space-y-2">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                    className="w-32 text-lg font-bold text-gray-800 border-b-2 border-purple-400 outline-none bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveEdit}
                    className="px-3 py-1 text-xs font-semibold bg-purple-600 text-white rounded-lg active:bg-purple-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg active:bg-gray-200"
                  >
                    Cancel
                  </button>
                  {cashOverride !== null && (
                    <button
                      onClick={resetToCalculated}
                      className="px-3 py-1 text-xs font-semibold bg-orange-50 text-orange-600 rounded-lg active:bg-orange-100"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-0.5 gap-2">
                <p className="text-xl font-bold text-gray-800 truncate">
                  {formatCurrency(displayCash)}
                </p>
                <button
                  onClick={startEdit}
                  className="shrink-0 px-3 py-1 text-xs font-semibold bg-purple-50 text-purple-600 rounded-lg active:bg-purple-100"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {cards.slice(3).map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Chart + Monthly summary side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <IncomeExpenseChart
            dailyBreakdown={monthlySummary?.daily_breakdown}
            month={monthlySummary?.month}
          />
        </div>
        <div>
          <MonthlySummary data={monthlySummary} loading={false} />
        </div>
      </div>

      {/* Pending by supplier */}
      {pendingData?.by_supplier?.length > 0 && (
        <PendingBySupplier
          bySupplier={pendingData.by_supplier}
          totalPending={pendingData.total_pending}
        />
      )}
    </div>
  );
};

export default DashboardPage;
