import { useState } from "react";
import { incomeService } from "../services/incomeService";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

const IncomeForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ title: "", amount: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) {
      toast.error("Please fill in all fields");
      return;
    }
    if (Number(form.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    setLoading(true);
    try {
      await incomeService.create({ ...form, amount: Number(form.amount) });
      toast.success("Income recorded successfully!");
      setForm({ title: "", amount: "" });
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add income");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <span className="w-2 h-6 bg-green-500 rounded-full inline-block" />
        Add Income
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Phone repair, Sale"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹)
          </label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            min="0"
            placeholder="Enter amount"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PlusCircle className="w-5 h-5" />
          )}
          {loading ? "Saving..." : "Add Income"}
        </button>
      </form>
    </div>
  );
};

export default IncomeForm;
