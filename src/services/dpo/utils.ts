/**
 * Format amount to have exactly 2 decimal places and ensure it's a valid number
 */
export const formatAmount = (amount: string): string => {
  const cleanAmount = amount.replace(/[^0-9.]/g, '');
  const numericAmount = parseFloat(cleanAmount);
  
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid amount');
  }
  
  return numericAmount.toFixed(2);
};

/**
 * Get the DPO payment URL for a transaction token
 */
export const getPaymentUrl = (transactionToken: string): string => {
  return `https://secure.3gdirectpay.com/dpopayment.php?ID=${transactionToken}`;
};