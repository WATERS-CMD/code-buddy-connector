import { COMPANY_TOKEN, DPO_ENDPOINT_URL, TEST_PRODUCT, TEST_SERVICE } from './config';
import { CreateTokenRequest, PaymentResponse, VerifyTokenRequest, ChargeTokenRequest } from './types';
import { formatAmount, getPaymentUrl } from './utils';

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
        TransToken: `TEST_TOKEN_${Date.now()}`,
        TransRef: reference
      };
    }

    const formattedAmount = formatAmount(amount);
    console.log('Formatted amount:', formattedAmount); // Debug log

    const request: CreateTokenRequest = {
      CompanyToken: COMPANY_TOKEN,
      Service: TEST_SERVICE,
      Product: TEST_PRODUCT,
      Amount: formattedAmount,
      Currency: currency,
      Reference: reference,
      ReturnUrl: returnUrl,
      BackUrl: backUrl,
      CompanyRef: reference,
      PTL: 30 // 30 minutes payment time limit
    };

    console.log('Payment request:', request); // Debug log

    const response = await fetch(`${DPO_ENDPOINT_URL}createToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Payment response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error creating payment token:', error);
    throw error;
  }
};

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

export const chargeTokenCreditCard = async ({
  transactionToken,
  cardNumber,
  expiryDate,
  cvv,
  cardholderName,
  chargeType,
  threeD
}: {
  transactionToken: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  chargeType?: string;
  threeD?: object;
}): Promise<PaymentResponse> => {
  try {
    // For development, return mock response
    if (process.env.NODE_ENV === 'development') {
      return {
        Result: "000",
        ResultExplanation: "Transaction Successful",
        TransactionApproved: "1",
        TransactionStatusCode: "1",
        TransactionStatusDescription: "Payment Completed"
      };
    }

    const request: ChargeTokenRequest = {
      CompanyToken: COMPANY_TOKEN,
      TransactionToken: transactionToken,
      CreditCardNumber: cardNumber,
      CreditCardExpiry: expiryDate,
      CreditCardCVV: cvv,
      CardHolderName: cardholderName,
      ChargeType: chargeType,
      ThreeD: threeD
    };

    const response = await fetch(`${DPO_ENDPOINT_URL}chargeTokenCreditCard`, {
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
    console.error('Error charging credit card:', error);
    throw new Error('Failed to process credit card payment');
  }
};

export * from './types';
export * from './utils';
