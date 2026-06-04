import { formatCurrency } from "../utils/formatCurrency";
import { Store } from "lucide-react";

const PendingBySupplier = ({ bySupplier = [], totalPending = 0 }) => {
  if (!bySupplier.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-800">Spare pending</h3>
        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
          {formatCurrency(totalPending)} total
        </span>
      </div>

      <div className="space-y-3">
        {bySupplier.map((s) => {
          const pct =
            totalPending > 0 ? (s.total_pending / totalPending) * 100 : 0;
          return (
            <div key={s.supplier_name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Store className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {s.supplier_name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    ({s.count} txn{s.count !== 1 ? "s" : ""})
                  </span>
                </div>
                <span className="text-sm font-semibold text-orange-600 shrink-0 ml-3">
                  {formatCurrency(s.total_pending)}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct.toFixed(1)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingBySupplier;
