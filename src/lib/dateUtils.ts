/**
 * Get default billing dates for bill creation
 * Billing date: 5th of current month
 * Payment due date: Last day of current month
 */
export const getDefaultBillingDates = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const billingDay = currentMonth == 1 ? 24 : 25;

  // Billing date: 5th of current month
  const paymentDueDate = new Date(currentYear, currentMonth + 1, 5);

  // Payment due date: Last day of current month
  const billingDate = new Date(currentYear, currentMonth, billingDay);

  // Format dates as YYYY-MM-DD without timezone conversion
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    billingDate: formatDate(billingDate),
    paymentDueDate: formatDate(paymentDueDate),
  };
};

/**
 * Get the start and end dates of the current month
 * Start period: 1st day of current month
 * End period: Last day of current month
 */
export const getDefaultPeriod = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // First day of current month
  const startPeriod = new Date(currentYear, currentMonth, 1);

  // Last day of current month (by going to the 0th day of the next month)
  const endPeriod = new Date(currentYear, currentMonth + 1, 0);

  // Format dates as YYYY-MM-DD without timezone conversion
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startPeriod: formatDate(startPeriod),
    endPeriod: formatDate(endPeriod),
  };
};
