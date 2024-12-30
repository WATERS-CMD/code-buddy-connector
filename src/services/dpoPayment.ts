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

  console.log('Sending DPO request:', xmlRequest);

  try {
    const response = await fetch('https://secure.3gdirectpay.com/API/v6', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml',
        'Origin': window.location.origin,
      },
      mode: 'cors',
      body: xmlRequest,
    });

    console.log('DPO response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DPO error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log('DPO response XML:', xmlText);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const resultCode = xmlDoc.querySelector('Result')?.textContent || '';
    let transToken = xmlDoc.querySelector('TransToken')?.textContent || '';

    // Extract the token from the URL if necessary
    const tokenMatch = transToken.match(/ID=([^&]+)/); // Matches "ID=..."
    if (tokenMatch) {
      transToken = tokenMatch[1]; // Extracts the actual token part
    }

    // Remove the TEST_TOKEN prefix if it exists
    if (transToken.startsWith('TEST_TOKEN_')) {
      transToken = transToken.replace('TEST_TOKEN_', '');
    }

    const resultExplanation = xmlDoc.querySelector('ResultExplanation')?.textContent || '';

    console.log('Parsed DPO response:', {
      Result: resultCode,
      TransToken: transToken,
      ResultExplanation: resultExplanation
    });

    return {
      Result: resultCode,
      TransToken: transToken,
      ResultExplanation: resultExplanation
    };
  } catch (error) {
    console.error('Error creating payment token:', error);
    throw error;
  }
};
