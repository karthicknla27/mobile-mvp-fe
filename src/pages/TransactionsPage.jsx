import { useState } from "react";
import TransactionTable from "../components/TransactionTable";
import { useTransactions } from "../hooks/useTransactions";
import { Search } from "lucide-react";

const TransactionsPage = () => {
  const { transactions, loading } = useTransactions();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = transactions.filter((t) => {
    const matchesType = filter === "all" || t.type === filter;
    const term = search.toLowerCase();
    const matchesSearch = !term || (t.title || "").toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">All Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          View and filter all income & expense records
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        <div className="flex gap-2">
          {["all", "income", "expense"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                filter === type
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">
            Transactions
          </h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {filtered.length} records
          </span>
        </div>
        <TransactionTable transactions={filtered} loading={loading} />
      </div>
    </div>
  );
};

export default TransactionsPage;
