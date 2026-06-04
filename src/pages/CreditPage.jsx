import { useState, useEffect, useCallback } from "react";
import { creditService } from "../services/creditService";
import { formatCurrency, formatDate } from "../utils/formatCurrency";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  PlusCircle,
  Edit2,
  Check,
  X,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

// Group credits array by customer_name
const groupByCustomer = (credits) => {
  const map = {};
  for (const c of credits) {
    const key = c.customer_name;
    if (!map[key]) {
      map[key] = {
        customer_name: key,
        credits: [],
        total_amount: 0,
        total_pending: 0,
      };
    }
    map[key].credits.push(c);
    map[key].total_amount += parseFloat(c.amount) || 0;
    map[key].total_pending += parseFloat(c.pending_amount) || 0;
  }
  return Object.values(map).sort((a, b) => b.total_pending - a.total_pending);
};

// ── Add Credit Form ───────────────────────────────────────────────
const CreditForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    customer_name: "",
    service_name: "",
    amount: "",
    paid_amount: "",
  });
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  useEffect(() => {
    const total = Number(form.amount) || 0;
    const paid = Number(form.paid_amount) || 0;
    setPending(Math.max(total - paid, 0));
  }, [form.amount, form.paid_amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.customer_name.trim() ||
      !form.service_name.trim() ||
      !form.amount
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    if (Number(form.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    const paid = Number(form.paid_amount) || 0;
    if (paid > Number(form.amount)) {
      toast.error("Paid cannot exceed total amount");
      return;
    }

    setLoading(true);
    try {
      await creditService.create({
        customer_name: form.customer_name,
        service_name: form.service_name,
        amount: Number(form.amount),
        paid_amount: paid,
      });
      toast.success("Credit added successfully!");
      setForm({
        customer_name: "",
        service_name: "",
        amount: "",
        paid_amount: "",
      });
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add credit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <span className="w-2 h-6 bg-purple-500 rounded-full inline-block" />
        Add Customer Credit
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="e.g. Rahul Kumar"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="service_name"
              value={form.service_name}
              onChange={handleChange}
              placeholder="e.g. Screen Replacement"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Amount (₹)
            </label>
            <input
              type="number"
              name="paid_amount"
              value={form.paid_amount}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Pending preview */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-purple-700">
            Pending from Customer
          </span>
          <span className="text-lg font-bold text-purple-600">
            ₹{pending.toLocaleString("en-IN")}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PlusCircle className="w-5 h-5" />
          )}
          {loading ? "Saving..." : "Add Credit"}
        </button>
      </form>
    </div>
  );
};

// ── Inline Pay Edit ───────────────────────────────────────────────
const PayEdit = ({ credit, onSave, onCancel }) => {
  const [additional, setAdditional] = useState("");
  const existingPaid = parseFloat(credit.paid_amount) || 0;
  const total = parseFloat(credit.amount);
  const newPaid = Math.min(existingPaid + (parseFloat(additional) || 0), total);
  const newPending = Math.max(total - newPaid, 0);

  const handleSave = () => {
    const val = parseFloat(additional);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid additional amount");
      return;
    }
    if (existingPaid + val > total) {
      toast.error(
        `Maximum additional allowed: ₹${(total - existingPaid).toFixed(2)}`,
      );
      return;
    }
    onSave(credit.id, newPaid);
  };

  return (
    <tr className="bg-purple-50">
      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
        {formatDate(credit.created_at)}
      </td>
      <td className="px-4 py-3 text-gray-600">{credit.service_name}</td>
      <td className="px-4 py-3 text-gray-600">
        {formatCurrency(credit.amount)}
      </td>
      <td className="px-4 py-3">
        <div className="space-y-1">
          <input
            type="number"
            value={additional}
            onChange={(e) => setAdditional(e.target.value)}
            min={0}
            max={total - existingPaid}
            placeholder={`+₹ amount`}
            className="w-28 border border-purple-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            autoFocus
          />
          <p className="text-xs text-gray-400">
            Paid: {formatCurrency(existingPaid)} → {formatCurrency(newPaid)}
          </p>
        </div>
      </td>
      <td className="px-4 py-3 font-semibold text-purple-600">
        {formatCurrency(newPending)}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── Customer Accordion Section ────────────────────────────────────
const CustomerSection = ({ group, onRefetch }) => {
  const [open, setOpen] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handlePay = async (id, paid_amount) => {
    try {
      await creditService.updatePayment(id, paid_amount);
      toast.success("Payment updated!");
      setEditingId(null);
      onRefetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this credit entry?")) return;
    setDeletingId(id);
    try {
      await creditService.remove(id);
      toast.success("Credit deleted");
      onRefetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Accordion header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-xl">
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">{group.customer_name}</p>
            <p className="text-xs text-gray-400">
              {group.credits.length} service
              {group.credits.length !== 1 ? "s" : ""}
              {" · "}Total {formatCurrency(group.total_amount)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {group.total_pending > 0 ? (
            <span className="text-base font-bold text-purple-600">
              {formatCurrency(group.total_pending)} pending
            </span>
          ) : (
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
              Fully Paid
            </span>
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Table */}
      {open && (
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Pending</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {group.credits.map((c) =>
                editingId === c.id ? (
                  <PayEdit
                    key={c.id}
                    credit={c}
                    onSave={handlePay}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {c.service_name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      {formatCurrency(c.paid_amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {parseFloat(c.pending_amount) > 0 ? (
                        <span className="font-semibold text-purple-600">
                          {formatCurrency(c.pending_amount)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {parseFloat(c.pending_amount) > 0 && (
                          <button
                            onClick={() => setEditingId(c.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
const CreditPage = () => {
  const [credits, setCredits] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterPending, setFilterPending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await creditService.getAll();
      setCredits(data.credits || []);
      setTotalPending(data.total_pending || 0);
    } catch (err) {
      toast.error("Failed to load credits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const displayed = filterPending
    ? credits.filter((c) => parseFloat(c.pending_amount) > 0)
    : credits;

  const groups = groupByCustomer(displayed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Credit to Customer
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track services given on credit, grouped by customer
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalPending > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 text-right">
              <p className="text-xs text-purple-500 font-medium">
                Total to Collect
              </p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(totalPending)}
              </p>
            </div>
          )}
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Credit
          </button>
        </div>
      </div>

      {/* Add form (collapsible) */}
      {showForm && (
        <CreditForm
          onSuccess={() => {
            fetchCredits();
            setShowForm(false);
          }}
        />
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {groups.length} customer{groups.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={() => setFilterPending((v) => !v)}
          className={`text-xs font-medium px-3 py-1.5 rounded-xl transition-colors ${
            filterPending
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {filterPending ? "Show All" : "Pending Only"}
        </button>
      </div>

      {/* Grouped customer sections */}
      {loading ? (
        <LoadingSpinner text="Loading credits..." />
      ) : groups.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-base font-medium text-gray-500">
            No credit entries yet
          </p>
          <p className="text-sm mt-1">
            Tap "Add Credit" to record a customer credit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <CustomerSection
              key={group.customer_name}
              group={group}
              onRefetch={fetchCredits}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreditPage;
