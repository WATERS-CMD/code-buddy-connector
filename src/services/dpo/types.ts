export interface PaymentResponse {
  Result: string;
  ResultExplanation: string;
  TransToken?: string;
  TransRef?: string;
  [key: string]: any;
}

export interface CreateTokenRequest {
  CompanyToken: string;
  Amount: string;
  Currency: string;
  Reference: string;
  ReturnUrl: string;
  BackUrl: string;
  Service?: string;
  Product?: string;
  CompanyRef?: string;
  RedirectURL?: string;
  PTL?: number;
}

export interface VerifyTokenRequest {
  CompanyToken: string;
  TransactionToken: string;
}

export interface ChargeTokenRequest {
  CompanyToken: string;
  TransactionToken: string;
  CreditCardNumber: string;
  CreditCardExpiry: string;
  CreditCardCVV: string;
  CardHolderName: string;
  ChargeType?: string;
  ThreeD?: object;
}