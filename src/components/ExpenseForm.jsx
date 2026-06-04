import { useState, useEffect } from "react";
import { expenseService } from "../services/expenseService";
import toast from "react-hot-toast";
import { MinusCircle } from "lucide-react";

const ExpenseForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    spareName: "",
    supplierName: "",
    totalAmount: "",
    paidAmount: "",
  });
  const [pendingAmount, setPendingAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const total = Number(form.totalAmount) || 0;
    const paid = Number(form.paidAmount) || 0;
    setPendingAmount(Math.max(total - paid, 0));
  }, [form.totalAmount, form.paidAmount]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.spareName.trim() || !form.totalAmount) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (Number(form.totalAmount) <= 0) {
      toast.error("Total amount must be greater than 0");
      return;
    }
    const paid = Number(form.paidAmount) || 0;
    if (paid > Number(form.totalAmount)) {
      toast.error("Paid amount cannot exceed total amount");
      return;
    }

    setLoading(true);
    try {
      await expenseService.create({
        spareName: form.spareName,
        supplierName: form.supplierName,
        totalAmount: Number(form.totalAmount),
        paidAmount: paid,
        pendingAmount,
      });
      toast.success("Expense recorded successfully!");
      setForm({
        spareName: "",
        supplierName: "",
        totalAmount: "",
        paidAmount: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
      onSuccess?.();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <span className="w-2 h-6 bg-red-500 rounded-full inline-block" />
        Add Expense
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spare Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="spareName"
            value={form.spareName}
            onChange={handleChange}
            placeholder="e.g. Screen, Battery"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier Shop Name
          </label>
          <input
            type="text"
            name="supplierName"
            value={form.supplierName}
            onChange={handleChange}
            placeholder="e.g. Ram Mobiles, Star Electronics"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalAmount"
              value={form.totalAmount}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Amount (₹)
            </label>
            <input
              type="number"
              name="paidAmount"
              value={form.paidAmount}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Auto-calculated pending */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-orange-700">
            Pending Amount
          </span>
          <span className="text-lg font-bold text-orange-600">
            ₹{pendingAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <MinusCircle className="w-5 h-5" />
          )}
          {loading ? "Saving..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
