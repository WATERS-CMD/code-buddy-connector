// Configuration
const DPO_ENDPOINT_URL = "https://secure.3gdirectpay.com/API/v6/"; 
const COMPANY_TOKEN = "9F416C11-127B-4DE2-AC7F-D5710E4C5E0A"; // Your company token
const TEST_SERVICE = "3854";
const TEST_PRODUCT = "Test Product";

// Type definitions
interface PaymentResponse {
  Result: string;
  ResultExplanation: string;
  TransToken?: string;
  TransRef?: string;
  [key: string]: any;
}

interface CreateTokenRequest {
  CompanyToken: string;
  Amount: string;
  Currency: string;
  Reference: string;
  ReturnUrl: string;
  BackUrl: string;
  CompanyRef?: string;
  RedirectURL?: string;
  PTL?: number;
}

interface VerifyTokenRequest {
  CompanyToken: string;
  TransactionToken: string;
}

/**
 * Create a payment token for DPO Pay
 */
export const createPaymentToken = async ({
  amount,
  currency,
  reference,
  returnUrl,
  backUrl
}: {
  amount: string;
  currency: string;
  reference: string;
  returnUrl: string;
  backUrl: string;
}): Promise<PaymentResponse> => {
  try {
    // For development, return mock response
    if (process.env.NODE_ENV === 'development') {
      return {
        Result: "000",
        ResultExplanation: "Success",
        TransToken: "TEST_TOKEN_" + Date.now(),
        TransRef: reference
      };
    }

    const request: CreateTokenRequest = {
      CompanyToken: COMPANY_TOKEN,
      Amount: amount,
      Currency: currency,
      Reference: reference,
      ReturnUrl: returnUrl,
      BackUrl: backUrl,
      CompanyRef: reference,
      PTL: 30
    };

    const response = await fetch(`${DPO_ENDPOINT_URL}createToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating payment token:', error);
    throw new Error('Failed to create payment token');
  }
};

/**
 * Verify a transaction token
 */
export const verifyPaymentToken = async (transactionToken: string): Promise<PaymentResponse> => {
  try {
    // For development, return mock response
    if (process.env.NODE_ENV === 'development') {
      return {
        Result: "000",
        ResultExplanation: "Transaction Verified",
        TransactionApproved: "1",
        TransactionStatusCode: "1",
        TransactionStatusDescription: "Completed"
      };
    }

    const request: VerifyTokenRequest = {
      CompanyToken: COMPANY_TOKEN,
      TransactionToken: transactionToken
    };

    const response = await fetch(`${DPO_ENDPOINT_URL}verifyToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment token:', error);
    throw new Error('Failed to verify payment token');
  }
};

/**
 * Get the DPO payment URL for a transaction token
 */
export const getPaymentUrl = (transactionToken: string): string => {
  return `https://secure.3gdirectpay.com/dpopayment.php?ID=${transactionToken}`;
};

// Export types for use in other components
export type { PaymentResponse };