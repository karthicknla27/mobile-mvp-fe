import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import IncomePage from "./pages/IncomePage";
import ExpensePage from "./pages/ExpensePage";
import TransactionsPage from "./pages/TransactionsPage";
import MonthlyPage from "./pages/MonthlyPage";
import PendingPage from "./pages/PendingPage";
import CreditPage from "./pages/CreditPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/expense" element={<ExpensePage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/monthly" element={<MonthlyPage />} />
              <Route path="/pending" element={<PendingPage />} />
              <Route path="/credits" element={<CreditPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
