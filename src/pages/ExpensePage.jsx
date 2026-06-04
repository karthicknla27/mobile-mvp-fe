import ExpenseForm from "../components/ExpenseForm";
import TransactionTable from "../components/TransactionTable";
import { useTransactions } from "../hooks/useTransactions";

const ExpensePage = () => {
  const { transactions, loading, refetch } = useTransactions();
  const expenses = transactions.filter((t) => t.type === "expense");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Record spare parts and expenses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseForm onSuccess={refetch} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Expenses
          </h3>
          <TransactionTable
            transactions={expenses.slice(0, 10)}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpensePage;
