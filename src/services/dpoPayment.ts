import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const API_BASE_URL = 'http://localhost:3000/api/dpo';
const WHITELISTED_DOMAIN = 'apolytosmanagement.com';

interface DPOPaymentResponse {
  Result: string;
  TransToken: string;
  ResultExplanation: string;
}

export const createDPOToken = async (amount: string): Promise<DPOPaymentResponse> => {
  const transRef = `TRANS${Date.now()}`;
  const builder = new XMLBuilder();
  const parser = new XMLParser();

  const xmlRequest = builder.build({
    '?xml': { '@_version': '1.0', '@_encoding': 'utf-8' },
    API3G: {
      CompanyToken: '8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3',
      Request: 'createToken',
      Transaction: {
        PaymentAmount: amount,
        PaymentCurrency: 'USD',
        CompanyRef: transRef,
        RedirectURL: `https://${WHITELISTED_DOMAIN}/payment-complete`,
        BackURL: `https://${WHITELISTED_DOMAIN}/donation`,
        CompanyRefUnique: '0',
        PTL: '30'
      },
      Services: {
        Service: {
          ServiceType: '5525',
          ServiceDescription: 'Donation',
          ServiceDate: new Date().toISOString().split('T')[0]
        }
      }
    }
  });

  try {
    console.log('Sending XML request:', xmlRequest);
    
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

    const resultCode = result.API3G.Result;
    const transToken = result.API3G.TransToken;
    const resultExplanation = result.API3G.ResultExplanation;

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

export const verifyDPOToken = async (transToken: string): Promise<DPOPaymentResponse> => {
  const builder = new XMLBuilder();
  const parser = new XMLParser();

  const xmlRequest = builder.build({
    API3G: {
      CompanyToken: '8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3',
      Request: 'verifyToken',
      TransactionToken: transToken
    }
  });

  try {
    console.log('Sending verification request:', xmlRequest);
    
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