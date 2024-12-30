import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const API_BASE_URL = 'http://secure.3gdirectpay.com/API/v6/';
const WHITELISTED_DOMAIN = 'apolytosmanagement.com';

interface DPOPaymentResponse {
  Result: string;
  TransToken: string;
  ResultExplanation: string;
}

export const createDPOToken = async (amount: string): Promise<DPOPaymentResponse> => {
  const transRef = `TRANS${Date.now()}`;
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    suppressEmptyNode: true,
    processEntities: true,
    suppressBooleanAttributes: false
  });

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: true,
    allowBooleanAttributes: true
  });

  const xmlObj = {
    "API3G": {
      "CompanyToken": "8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3",
      "Request": "createToken",
      "Transaction": {
        "PaymentAmount": amount,
        "PaymentCurrency": "USD",
        "CompanyRef": transRef,
        "RedirectURL": `https://${WHITELISTED_DOMAIN}/payment-complete`,
        "BackURL": `https://${WHITELISTED_DOMAIN}/donation`,
        "CompanyRefUnique": "0",
        "PTL": "30"
      },
      "Services": {
        "Service": {
          "@_ServiceType": "5525",
          "ServiceDescription": "Donation",
          "ServiceDate": new Date().toISOString().split('T')[0]
        }
      }
    }
  };

  const xmlRequest = builder.build(xmlObj);
  console.log('Sending XML request:', xmlRequest);

  try {
    const response = await axios.post(`${API_BASE_URL}/transaction`, xmlRequest, {
      headers: { 
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      },
      responseType: 'text'
    });

    console.log('Raw response:', response.data);
    const result = parser.parse(response.data);
    console.log('Parsed response:', result);

    return {
      Result: result.API3G.Result,
      TransToken: result.API3G.TransToken,
      ResultExplanation: result.API3G.ResultExplanation
    };
  } catch (error) {
    console.error('Error creating payment token:', error);
    throw error;
  }
};

export const verifyDPOToken = async (transToken: string): Promise<DPOPaymentResponse> => {
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    suppressEmptyNode: true,
    processEntities: true,
    suppressBooleanAttributes: false
  });

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: true,
    allowBooleanAttributes: true
  });

  const xmlObj = {
    "API3G": {
      "CompanyToken": "8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3",
      "Request": "verifyToken",
      "TransactionToken": transToken
    }
  };

  const xmlRequest = builder.build(xmlObj);
  console.log('Sending verification request:', xmlRequest);

  try {
    const response = await axios.post(`${API_BASE_URL}/verify`, xmlRequest, {
      headers: { 
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      },
      responseType: 'text'
    });

    console.log('Raw verification response:', response.data);
    const result = parser.parse(response.data);
    console.log('Parsed verification response:', result);

    return {
      Result: result.API3G.Result,
      TransToken: transToken,
      ResultExplanation: result.API3G.ResultExplanation
    };
  } catch (error) {
    console.error('Error verifying payment token:', error);
    throw error;
  }
};
