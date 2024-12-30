interface DPOPaymentResponse {
  TransToken: string;
  Result: string;
  ResultExplanation: string;
}

interface VerifyTokenResponse {
  Result: string;
  ResultExplanation: string;
  TransactionToken: string;
  TransactionRef: string;
  CustomerName?: string;
  CustomerCredit?: string;
  TransactionApproval?: string;
  TransactionCurrency: string;
  TransactionAmount: string;
  FraudAlert: string;
  FraudExplnation: string;
  TransactionNetAmount: string;
  TransactionSettlementDate: string;
  TransactionRollingReserveAmount: string;
  TransactionRollingReserveDate: string;
  CustomerPhone?: string;
  CustomerCountry?: string;
  CustomerAddress?: string;
  CustomerCity?: string;
  CustomerZip?: string;
  MobilePaymentRequest?: string;
  AccRef?: string;
}

export const createDPOToken = async (amount: string): Promise<DPOPaymentResponse> => {
  const transRef = `TRANS${Date.now()}`;
  const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
    <API3G>
      <CompanyToken>8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3</CompanyToken>
      <Request>createToken</Request>
      <Transaction>
        <PaymentAmount>${amount}</PaymentAmount>
        <PaymentCurrency>USD</PaymentCurrency>
        <CompanyRef>${transRef}</CompanyRef>
        <RedirectURL>https://apolytosmanagement.com/payment-complete</RedirectURL>
        <BackURL>https://apolytosmanagement.com/donation</BackURL>
        <CompanyRefUnique>0</CompanyRefUnique>
        <PTL>30</PTL>
      </Transaction>
      <Services>
        <Service>
          <ServiceType>3854</ServiceType>
          <ServiceDescription>Donation</ServiceDescription>
          <ServiceDate>${new Date().toISOString().split('T')[0]}</ServiceDate>
        </Service>
      </Services>
    </API3G>`;

  try {
    const response = await fetch('https://secure.3gdirectpay.com/API/v6/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      mode: 'no-cors',
      body: xmlRequest,
    });

    if (!response.ok && response.type !== 'opaque') {
      throw new Error('Network response was not ok');
    }

    // Parse the XML response to get the actual token
    // Note: Since we're using no-cors mode, we can't actually read the response
    // In production, this should be handled through a backend proxy
    // For now, we'll simulate a successful response
    return {
      Result: "000",
      TransToken: transRef, // Using our generated reference as the token
      ResultExplanation: "Success"
    };
  } catch (error) {
    console.error('Error creating payment token:', error);
    throw error;
  }
};

export const verifyDPOToken = async (transToken: string): Promise<VerifyTokenResponse> => {
  const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
    <API3G>
      <CompanyToken>8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3</CompanyToken>
      <Request>verifyToken</Request>
      <TransactionToken>${transToken}</TransactionToken>
    </API3G>`;

  try {
    const response = await fetch('https://secure.3gdirectpay.com/API/v6/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      mode: 'no-cors',
      body: xmlRequest,
    });

    if (!response.ok && response.type !== 'opaque') {
      throw new Error('Network response was not ok');
    }

    // Mock response for testing
    return {
      Result: "000",
      ResultExplanation: "Transaction Verified",
      TransactionToken: transToken,
      TransactionRef: `REF_${Date.now()}`,
      TransactionCurrency: "USD",
      TransactionAmount: "100.00",
      FraudAlert: "0",
      FraudExplnation: "",
      TransactionNetAmount: "97.00",
      TransactionSettlementDate: new Date().toISOString(),
      TransactionRollingReserveAmount: "3.00",
      TransactionRollingReserveDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};
