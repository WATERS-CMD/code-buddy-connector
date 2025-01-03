interface DPOPaymentResponse {
  TransToken: string;
  Result: string;
  ResultExplanation: string;
}

export const createDPOPaymentRequest = async (amount: string): Promise<DPOPaymentResponse> => {
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
        <PTL>60</PTL>
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
    const headers = new Headers({
      'Content-Type': 'application/xml',
      'Accept': 'application/xml',
      'Origin': window.location.origin,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    console.log('Sending XML Request:', xmlRequest);

    const response = await fetch('https://secure.3gdirectpay.com/API/v6/', {
      method: 'POST',
      headers: headers,
      mode: 'cors',
      body: xmlRequest,
    });

    if (!response.ok) {
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('API Response:', responseText);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, "text/xml");

    const transToken = xmlDoc.querySelector("TransToken")?.textContent;
    const result = xmlDoc.querySelector("Result")?.textContent;
    const resultExplanation = xmlDoc.querySelector("ResultExplanation")?.textContent;

    if (!transToken || !result) {
      console.error('Invalid API response structure:', responseText);
      throw new Error("Invalid API response");
    }

    return {
      TransToken: transToken,
      Result: result,
      ResultExplanation: resultExplanation || "Success",
    };
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const verifyDPOPaymentToken = async (transToken: string): Promise<boolean> => {
  const verifyXmlRequest = `<?xml version="1.0" encoding="utf-8"?>
    <API3G>
      <CompanyToken>8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3</CompanyToken>
      <Request>verifyToken</Request>
      <TransactionToken>${transToken}</TransactionToken>
    </API3G>`;

  try {
    console.log('Sending Verify Token Request:', verifyXmlRequest);

    const response = await fetch('https://secure.3gdirectpay.com/API/v6/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: verifyXmlRequest,
    });

    const responseText = await response.text();
    console.log('Verify Token Response:', responseText);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseText, "text/xml");

    const result = xmlDoc.querySelector("Result")?.textContent;
    const resultExplanation = xmlDoc.querySelector("ResultExplanation")?.textContent;

    if (result !== "000") {
      throw new Error(resultExplanation || "Transaction verification failed");
    }

    return true;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw error;
  }
};