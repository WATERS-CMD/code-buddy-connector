import * as soap from 'soap';
import { toast } from "sonner";

// Configuration
const DPO_ENDPOINT_URL = "https://secure.3gdirectpay.com/API/v6/"; // DPO API endpoint
const COMPANY_TOKEN = "9F416C11-127B-4DE2-AC7F-D5710E4C5E0A"; // Replace with actual token in production
const TEST_SERVICE = "3854";
const TEST_PRODUCT = "Test Product";

// Type definitions
interface CreateTokenArgs {
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

interface VerifyTokenArgs {
  CompanyToken: string;
  TransactionToken: string;
}

interface PaymentResponse {
  Result: string;
  ResultExplanation: string;
  TransToken?: string;
  TransRef?: string;
  [key: string]: any;
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

    const client = await soap.createClientAsync(DPO_ENDPOINT_URL);
    
    const args: CreateTokenArgs = {
      CompanyToken: COMPANY_TOKEN,
      Amount: amount,
      Currency: currency,
      Reference: reference,
      ReturnUrl: returnUrl,
      BackUrl: backUrl,
      CompanyRef: reference,
      PTL: 30 // 30 minutes payment time limit
    };

    const [response] = await client.CreateTokenAsync(args);
    
    if (!response || !response.TransToken) {
      throw new Error('Invalid response from DPO API');
    }

    return {
      Result: response.Result,
      ResultExplanation: response.ResultExplanation,
      TransToken: response.TransToken,
      TransRef: response.TransRef
    };
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

    const client = await soap.createClientAsync(DPO_ENDPOINT_URL);
    
    const args: VerifyTokenArgs = {
      CompanyToken: COMPANY_TOKEN,
      TransactionToken: transactionToken
    };

    const [response] = await client.VerifyTokenAsync(args);
    
    return {
      Result: response.Result,
      ResultExplanation: response.ResultExplanation,
      TransactionApproved: response.TransactionApproved,
      TransactionStatusCode: response.TransactionStatusCode,
      TransactionStatusDescription: response.TransactionStatusDescription
    };
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