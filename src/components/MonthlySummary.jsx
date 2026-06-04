import { formatCurrency } from "../utils/formatCurrency";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

// Format "2026-05" → "May 2026"
const formatMonthLabel = (monthStr) => {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  return new Date(year, month - 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

const MonthlySummary = ({ data, loading }) => {
  if (loading)
    return <LoadingSpinner size="sm" text="Loading monthly data..." />;

  const income = data?.income?.total || 0;
  const expense = data?.expense?.total || 0;
  const profit = income - expense;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Summary</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {formatMonthLabel(data?.month)}
        </span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Total Income
            </span>
          </div>
          <span className="font-bold text-green-700">
            {formatCurrency(income)}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              Total Expense
            </span>
          </div>
          <span className="font-bold text-red-700">
            {formatCurrency(expense)}
          </span>
        </div>
        <div
          className={`flex items-center justify-between p-3 rounded-xl ${profit >= 0 ? "bg-blue-50" : "bg-orange-50"}`}
        >
          <div className="flex items-center gap-2">
            <DollarSign
              className={`w-4 h-4 ${profit >= 0 ? "text-blue-600" : "text-orange-600"}`}
            />
            <span
              className={`text-sm font-medium ${profit >= 0 ? "text-blue-700" : "text-orange-700"}`}
            >
              Monthly Profit
            </span>
          </div>
          <span
            className={`font-bold text-lg ${profit >= 0 ? "text-blue-700" : "text-orange-700"}`}
          >
            {formatCurrency(profit)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;
