import { formatDate, formatCurrency } from "../utils/formatCurrency";
import LoadingSpinner from "./LoadingSpinner";
import { TrendingUp, TrendingDown } from "lucide-react";

const TransactionTable = ({ transactions, loading }) => {
  if (loading) return <LoadingSpinner />;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm font-medium">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <th className="px-4 py-3 text-left rounded-l-xl">Date</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Title / Spare</th>
            <th className="px-4 py-3 text-left">Shop</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right rounded-r-xl">Pending</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((txn) => (
            <tr
              key={`${txn.type}-${txn.id}`}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {formatDate(txn.created_at)}
              </td>
              <td className="px-4 py-3">
                {txn.type === "income" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <TrendingUp className="w-3 h-3" /> Income
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <TrendingDown className="w-3 h-3" /> Expense
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">
                {txn.title || "-"}
              </td>
              <td className="px-4 py-3 text-gray-500 text-sm">
                {txn.supplier_name || <span className="text-gray-300">—</span>}
              </td>
              <td
                className={`px-4 py-3 text-right font-semibold ${txn.type === "income" ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(txn.amount)}
              </td>
              <td className="px-4 py-3 text-right">
                {txn.pending_amount > 0 ? (
                  <span className="font-semibold text-orange-600">
                    {formatCurrency(txn.pending_amount)}
                  </span>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
