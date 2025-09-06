/**
 * Get default billing dates for bill creation
 * Billing date: 5th of current month
 * Payment due date: Last day of current month
 */
export const getDefaultBillingDates = () => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Billing date: 5th of current month
  const billingDate = new Date(currentYear, currentMonth, 5);
  
  // Payment due date: Last day of current month
  const paymentDueDate = new Date(currentYear, currentMonth + 1, 0);
  
  // Format dates as YYYY-MM-DD without timezone conversion
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    billingDate: formatDate(billingDate),
    paymentDueDate: formatDate(paymentDueDate)
  };
};