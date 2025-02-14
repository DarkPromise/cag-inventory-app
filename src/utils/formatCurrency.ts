/**
 * Format a number to a currency string (e.g. 1000 => $1,000.00)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};
