import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Transform daily_breakdown rows [{date, type, total_amount}] into
// [{label, income, expense}] keyed by date
const buildChartData = (dailyBreakdown = []) => {
  const map = {};
  for (const row of dailyBreakdown) {
    // Parse date in IST to avoid UTC midnight shifting the day back by 1
    const d = new Date(row.date).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    }); // "YYYY-MM-DD"
    if (!d) continue;
    if (!map[d]) map[d] = { date: d, income: 0, expense: 0 };
    if (row.type === "income")
      map[d].income = parseFloat(row.total_amount) || 0;
    if (row.type === "expense")
      map[d].expense = parseFloat(row.total_amount) || 0;
  }
  return Object.values(map)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      ...r,
      label: new Date(r.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        timeZone: "Asia/Kolkata",
      }),
    }));
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: ₹{Number(p.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

const IncomeExpenseChart = ({ dailyBreakdown, month }) => {
  const data = buildChartData(dailyBreakdown);

  const monthLabel = month
    ? new Date(month + "-01").toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "";

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Monthly Income
        </h3>
        <p className="text-xs text-gray-400 mb-6">{monthLabel}</p>
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          No data for this month
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Income</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {monthLabel}
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-5">Daily income this month</p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f0f0f0"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              `₹${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
            }
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "#22c55e",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#22c55e"
            strokeWidth={2.5}
            fill="url(#incomeGradient)"
            dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#16a34a", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
