/**
 * Format a number as Indian Rupee currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to readable format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Get the current month name and year
 */
export const getCurrentMonthYear = () => {
  return new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};
