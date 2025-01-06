import * as soap from "soap";

const DPO_ENDPOINT_URL = "https://secure.3gdirectpay.com/API/v6/";
const COMPANY_TOKEN = "9F416C11-127B-4DE2-AC7F-D5710E4C5E0A";
const TEST_SERVICE = "3854";
const TEST_PRODUCT = "Test Product";

/**
 * Create a SOAP client and handle requests.
 */
const createSoapClient = async (): Promise<soap.Client> => {
  try {
    return await soap.createClientAsync(DPO_ENDPOINT_URL);
  } catch (error) {
    console.error("Error creating SOAP client:", error);
    throw new Error("Failed to create SOAP client");
  }
};

/**
 * Create a payment token.
 */
export const createPaymentToken = async ({
  amount,
  currency,
  reference,
  returnUrl,
  backUrl,
}: {
  amount: string;
  currency: string;
  reference: string;
  returnUrl: string;
  backUrl: string;
}): Promise<any> => {
  try {
    const client = await createSoapClient();

    const request = {
      CompanyToken: COMPANY_TOKEN,
      Service: TEST_SERVICE,
      Product: TEST_PRODUCT,
      Amount: amount,
      Currency: currency,
      Reference: reference,
      ReturnUrl: returnUrl,
      BackUrl: backUrl,
      CompanyRef: reference,
      PTL: 30, // 30-minute payment time limit
    };

    const [result] = await client.CreateTokenAsync(request);
    console.log("Create Token Response:", result);
    return result;
  } catch (error) {
    console.error("Error creating payment token:", error);
    throw new Error("Failed to create payment token");
  }
};

/**
 * Verify a payment token.
 */
export const verifyPaymentToken = async (transactionToken: string): Promise<any> => {
  try {
    const client = await createSoapClient();

    const request = {
      CompanyToken: COMPANY_TOKEN,
      TransactionToken: transactionToken,
    };

    const [result] = await client.VerifyTokenAsync(request);
    console.log("Verify Token Response:", result);
    return result;
  } catch (error) {
    console.error("Error verifying payment token:", error);
    throw new Error("Failed to verify payment token");
  }
};

/**
 * Charge a credit card using a payment token.
 */
export const chargeTokenCreditCard = async ({
  transactionToken,
  cardNumber,
  expiryDate,
  cvv,
  cardholderName,
  chargeType,
  threeD,
}: {
  transactionToken: string;
  cardNumber: string;
  expiryDate: string; // MMYY format
  cvv: string;
  cardholderName: string;
  chargeType?: string;
  threeD?: object;
}): Promise<any> => {
  try {
    const client = await createSoapClient();

    const request = {
      CompanyToken: COMPANY_TOKEN,
      TransactionToken: transactionToken,
      CreditCardNumber: cardNumber,
      CreditCardExpiry: expiryDate,
      CreditCardCVV: cvv,
      CardHolderName: cardholderName,
      ChargeType: chargeType,
      ThreeD: threeD,
    };

    const [result] = await client.chargeTokenCreditCardAsync(request);
    console.log("Charge Credit Card Response:", result);
    return result;
  } catch (error) {
    console.error("Error charging credit card:", error);
    throw new Error("Failed to charge credit card");
  }
};

/**
 * Get the payment URL for the transaction token.
 */
export const getPaymentUrl = (transactionToken: string): string => {
  if (!transactionToken) throw new Error("Transaction token is required");
  return `https://secure.3gdirectpay.com/dpopayment.php?ID=${transactionToken}`;
};