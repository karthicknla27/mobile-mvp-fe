import { useState, useEffect, useCallback } from "react";
import api, { transactionApi } from "../services/api";
import { formatCurrency, formatDate } from "../utils/formatCurrency";
import LoadingSpinner from "../components/LoadingSpinner";
import { Store, ChevronDown, ChevronUp, Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

// Group pending transactions by supplier_name
const groupBySupplier = (transactions) => {
  const map = {};
  for (const txn of transactions) {
    const key = txn.supplier_name || "Unknown";
    if (!map[key])
      map[key] = { supplier_name: key, transactions: [], total_pending: 0 };
    map[key].transactions.push(txn);
    map[key].total_pending += parseFloat(txn.pending_amount) || 0;
  }
  return Object.values(map).sort((a, b) => b.total_pending - a.total_pending);
};

// Inline edit row
const EditRow = ({ txn, onSave, onCancel }) => {
  const [additional, setAdditional] = useState("");
  const existingPaid = parseFloat(txn.paid_amount) || 0;
  const total = parseFloat(txn.amount);
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
    onSave(txn.id, newPaid);
  };

  return (
    <tr className="bg-blue-50">
      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
        {formatDate(txn.created_at)}
      </td>
      <td className="px-4 py-3 font-medium text-gray-800">{txn.title}</td>
      <td className="px-4 py-3 text-gray-600">{formatCurrency(txn.amount)}</td>
      <td className="px-4 py-3">
        <div className="space-y-1">
          <input
            type="number"
            value={additional}
            onChange={(e) => setAdditional(e.target.value)}
            min={0}
            max={total - existingPaid}
            placeholder={`+₹ amount`}
            className="w-28 border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoFocus
          />
          <p className="text-xs text-gray-400">
            Paid: {formatCurrency(existingPaid)} → {formatCurrency(newPaid)}
          </p>
        </div>
      </td>
      <td className="px-4 py-3 text-orange-600 font-semibold">
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

// Supplier accordion section
const SupplierSection = ({ group, onPaymentUpdated }) => {
  const [open, setOpen] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (id, paid_amount) => {
    setSaving(true);
    try {
      await transactionApi.updatePayment(id, paid_amount);
      toast.success("Payment updated!");
      setEditingId(null);
      onPaymentUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-xl">
            <Store className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">{group.supplier_name}</p>
            <p className="text-xs text-gray-400">
              {group.transactions.length} pending transaction
              {group.transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-orange-600">
            {formatCurrency(group.total_pending)}
          </span>
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
                <th className="px-4 py-3 text-left">Spare</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Paid</th>
                <th className="px-4 py-3 text-left">Pending</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {group.transactions.map((txn) =>
                editingId === txn.id ? (
                  <EditRow
                    key={txn.id}
                    txn={txn}
                    onSave={handleSave}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <tr
                    key={txn.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(txn.created_at)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {txn.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      {formatCurrency(txn.paid_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(txn.pending_amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingId(txn.id)}
                        disabled={saving}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3 h-3" /> Pay
                      </button>
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

const PendingPage = () => {
  const [groups, setGroups] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/transactions", {
        params: { limit: 200 },
      });
      const pending = (data.transactions || []).filter(
        (t) => parseFloat(t.pending_amount) > 0,
      );
      const grouped = groupBySupplier(pending);
      setGroups(grouped);
      setTotalPending(
        pending.reduce((s, t) => s + parseFloat(t.pending_amount), 0),
      );
    } catch {
      toast.error("Failed to load pending transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pending Payments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track and update outstanding payments by supplier
          </p>
        </div>
        {totalPending > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-right">
            <p className="text-xs text-orange-500 font-medium">Total Pending</p>
            <p className="text-xl font-bold text-orange-600">
              {formatCurrency(totalPending)}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading pending transactions..." />
      ) : groups.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🎉</p>
          <p className="text-base font-medium text-gray-500">
            No pending payments!
          </p>
          <p className="text-sm mt-1">All transactions are fully paid.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <SupplierSection
              key={group.supplier_name}
              group={group}
              onPaymentUpdated={fetchPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingPage;
