import { useState, useEffect } from "react";
import MonthlySummary from "../components/MonthlySummary";
import TransactionTable from "../components/TransactionTable";
import { dashboardService } from "../services/dashboardService";
import { incomeService } from "../services/incomeService";
import { expenseService } from "../services/expenseService";
import { creditService } from "../services/creditService";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MonthlyPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthlyPending, setMonthlyPending] = useState([]);
  const [monthlyCredits, setMonthlyCredits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build date range for credits
      const fromDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const toDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

      const [summaryData, incomeData, expenseData, creditData] =
        await Promise.all([
          dashboardService.getMonthlySummary(month, year),
          incomeService.getAll({ month, year }),
          expenseService.getAll({ month, year }),
          creditService.getAll({ from_date: fromDate, to_date: toDate }),
        ]);

      setSummary(summaryData.summary);

      const combined = [
        ...(incomeData.transactions || []),
        ...(expenseData.transactions || []),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTransactions(combined);

      // Spare pending = expense transactions with pending_amount > 0
      setMonthlyPending(
        (expenseData.transactions || []).filter((t) => t.pending_amount > 0),
      );

      setMonthlyCredits(creditData.credits || []);
    } catch {
      toast.error("Failed to load monthly data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const monthLabel = `${months[month - 1]} ${year}`;

    // Title
    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text("Monthly Summary Report", 14, 18);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${monthLabel}`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 32);

    // Summary box
    const income = summary?.income?.total || 0;
    const expense = summary?.expense?.total || 0;
    const profit = income - expense;
    const pending = summary?.total_pending || 0;

    const fmt = (n) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(n);

    autoTable(doc, {
      startY: 40,
      head: [["", "Amount"]],
      body: [
        ["Total Income", fmt(income)],
        ["Total Expense", fmt(expense)],
        [profit >= 0 ? "Net Profit" : "Net Loss", fmt(Math.abs(profit))],
        ["Total Pending", fmt(pending)],
      ],
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 1: { halign: "right" } },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      margin: { left: 14, right: 14 },
    });

    // Transactions table
    if (transactions.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text("Transactions", 14, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [["Date", "Type", "Title", "Amount", "Paid", "Pending"]],
        body: transactions.map((t) => [
          new Date(t.created_at).toLocaleDateString("en-IN"),
          t.type.charAt(0).toUpperCase() + t.type.slice(1),
          t.title || "-",
          fmt(t.amount),
          fmt(t.paid_amount),
          t.pending_amount > 0 ? fmt(t.pending_amount) : "-",
        ]),
        headStyles: { fillColor: [37, 99, 235] },
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9 },
      });
    }

    // Spare Pending table
    if (monthlyPending.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text("Spare Pending", 14, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [["Date", "Item", "Supplier", "Total", "Paid", "Pending"]],
        body: monthlyPending.map((t) => [
          new Date(t.created_at).toLocaleDateString("en-IN"),
          t.title || "-",
          t.supplier_name || "-",
          fmt(t.amount),
          fmt(t.paid_amount),
          fmt(t.pending_amount),
        ]),
        headStyles: { fillColor: [234, 88, 12] },
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
        },
        alternateRowStyles: { fillColor: [255, 247, 237] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9 },
      });
    }

    // Credit to Customer table
    if (monthlyCredits.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text("Credit to Customer", 14, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [["Date", "Customer", "Service", "Total", "Paid", "Pending"]],
        body: monthlyCredits.map((c) => [
          new Date(c.created_at).toLocaleDateString("en-IN"),
          c.customer_name || "-",
          c.service_name || "-",
          fmt(c.amount),
          fmt(c.paid_amount),
          fmt(c.pending_amount),
        ]),
        headStyles: { fillColor: [79, 70, 229] },
        columnStyles: {
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
        },
        alternateRowStyles: { fillColor: [238, 242, 255] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9 },
      });
    }

    doc.save(`monthly-summary-${year}-${String(month).padStart(2, "0")}.pdf`);
  };

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Monthly Summary</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Analyse income & expenses by month
        </p>
      </div>

      {/* Month/Year picker */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {!loading && summary && (
          <button
            onClick={downloadPDF}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading monthly data..." />
      ) : (
        <>
          <div className="max-w-md">
            <MonthlySummary data={summary} loading={false} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Transactions — {months[month - 1]} {year}
            </h3>
            <TransactionTable transactions={transactions} loading={false} />
          </div>

          {/* Spare Pending this month */}
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-orange-700">
                Spare Pending — {months[month - 1]} {year}
              </h3>
              <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-3 py-1 rounded-full">
                {monthlyPending.length} item
                {monthlyPending.length !== 1 ? "s" : ""}
              </span>
            </div>
            {monthlyPending.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No pending expenses this month
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-100">
                      <th className="text-left py-2 pr-4 font-medium">Date</th>
                      <th className="text-left py-2 pr-4 font-medium">Item</th>
                      <th className="text-left py-2 pr-4 font-medium">
                        Supplier
                      </th>
                      <th className="text-right py-2 pr-4 font-medium">
                        Total
                      </th>
                      <th className="text-right py-2 pr-4 font-medium">Paid</th>
                      <th className="text-right py-2 font-medium">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyPending.map((t) => (
                      <tr
                        key={t.id}
                        className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors"
                      >
                        <td className="py-2.5 pr-4 text-gray-500">
                          {new Date(t.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-800 font-medium">
                          {t.title || "-"}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600">
                          {t.supplier_name || "-"}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-gray-800">
                          {fmt(t.amount)}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-green-600">
                          {fmt(t.paid_amount)}
                        </td>
                        <td className="py-2.5 text-right text-orange-600 font-semibold">
                          {fmt(t.pending_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-orange-200">
                      <td
                        colSpan={5}
                        className="py-2.5 text-sm font-semibold text-orange-700"
                      >
                        Total Pending
                      </td>
                      <td className="py-2.5 text-right text-orange-700 font-bold">
                        {fmt(
                          monthlyPending.reduce(
                            (s, t) => s + Number(t.pending_amount),
                            0,
                          ),
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Credit to Customer this month */}
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-indigo-700">
                Credit to Customer — {months[month - 1]} {year}
              </h3>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">
                {monthlyCredits.length} item
                {monthlyCredits.length !== 1 ? "s" : ""}
              </span>
            </div>
            {monthlyCredits.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No credits given this month
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-100">
                      <th className="text-left py-2 pr-4 font-medium">Date</th>
                      <th className="text-left py-2 pr-4 font-medium">
                        Customer
                      </th>
                      <th className="text-left py-2 pr-4 font-medium">
                        Service
                      </th>
                      <th className="text-right py-2 pr-4 font-medium">
                        Total
                      </th>
                      <th className="text-right py-2 pr-4 font-medium">Paid</th>
                      <th className="text-right py-2 font-medium">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyCredits.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-50 hover:bg-indigo-50/40 transition-colors"
                      >
                        <td className="py-2.5 pr-4 text-gray-500">
                          {new Date(c.created_at).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-800 font-medium">
                          {c.customer_name || "-"}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600">
                          {c.service_name || "-"}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-gray-800">
                          {fmt(c.amount)}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-green-600">
                          {fmt(c.paid_amount)}
                        </td>
                        <td
                          className="py-2.5 text-right font-semibold"
                          style={{
                            color: c.pending_amount > 0 ? "#6366f1" : "#16a34a",
                          }}
                        >
                          {fmt(c.pending_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-indigo-200">
                      <td
                        colSpan={5}
                        className="py-2.5 text-sm font-semibold text-indigo-700"
                      >
                        Total Pending
                      </td>
                      <td className="py-2.5 text-right text-indigo-700 font-bold">
                        {fmt(
                          monthlyCredits.reduce(
                            (s, c) => s + Number(c.pending_amount),
                            0,
                          ),
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyPage;
