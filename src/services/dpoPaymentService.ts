interface CreateTokenParams {
  amount: string;
  currency: string;
  reference: string;
  returnUrl: string;
  backUrl: string;
}

interface DPOPaymentResponse {
  TransToken: string;
  Result: string;
  ResultExplanation: string;
}

export const createPaymentToken = async ({
  amount,
  currency,
  reference,
  returnUrl,
  backUrl
}: CreateTokenParams): Promise<DPOPaymentResponse> => {
  const companyToken = "8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3"; // This should ideally be in a secure environment
  
  const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
    <API3G>
      <CompanyToken>${companyToken}</CompanyToken>
      <Request>createToken</Request>
      <Transaction>
        <PaymentAmount>${amount}</PaymentAmount>
        <PaymentCurrency>${currency}</PaymentCurrency>
        <CompanyRef>${reference}</CompanyRef>
        <RedirectURL>${returnUrl}</RedirectURL>
        <BackURL>${backUrl}</BackURL>
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
      body: xmlRequest,
    });

    // For development/testing, we'll return a mock response
    // In production, you would parse the actual XML response
    if (!response.ok && response.type !== 'opaque') {
      throw new Error('Network response was not ok');
    }

    // Mock response for development
    return {
      Result: "000",
      TransToken: `TEST_TOKEN_${Date.now()}`,
      ResultExplanation: "Success"
    };
  } catch (error) {
    console.error('Error creating payment token:', error);
    throw error;
  }
};

export const verifyPaymentToken = async (transactionToken: string): Promise<boolean> => {
  const companyToken = "8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3";
  
  const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
    <API3G>
      <CompanyToken>${companyToken}</CompanyToken>
      <Request>verifyToken</Request>
      <TransactionToken>${transactionToken}</TransactionToken>
    </API3G>`;

  try {
    const response = await fetch('https://secure.3gdirectpay.com/API/v6/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
      },
      body: xmlRequest,
    });

    if (!response.ok && response.type !== 'opaque') {
      throw new Error('Network response was not ok');
    }

    // Mock verification response for development
    return true;
  } catch (error) {
    console.error('Error verifying payment token:', error);
    throw error;
  }
};