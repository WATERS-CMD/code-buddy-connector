import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface PaymentStatus {
  success: boolean;
  message: string;
  details?: {
    amount?: string;
    currency?: string;
    reference?: string;
  };
}

const PaymentComplete = () => {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const transToken = sessionStorage.getItem('dpoTransactionToken');
        
        if (!transToken) {
          setStatus({
            success: false,
            message: "Payment verification failed: No transaction token found"
          });
          return;
        }

        const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
          <API3G>
            <CompanyToken>8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3</CompanyToken>
            <Request>verifyToken</Request>
            <TransactionToken>${transToken}</TransactionToken>
          </API3G>`;

        const response = await fetch('/api/dpo/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml'
          },
          body: xmlRequest
        });

        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        const responseText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseText, "text/xml");
        
        const result = xmlDoc.querySelector("Result")?.textContent;
        const resultExplanation = xmlDoc.querySelector("ResultExplanation")?.textContent;
        const transactionAmount = xmlDoc.querySelector("TransactionAmount")?.textContent;
        const transactionCurrency = xmlDoc.querySelector("TransactionCurrency")?.textContent;
        const transactionRef = xmlDoc.querySelector("CompanyRef")?.textContent;

        if (result === "000") {
          setStatus({
            success: true,
            message: "Payment successful! Thank you for your donation.",
            details: {
              amount: transactionAmount,
              currency: transactionCurrency,
              reference: transactionRef
            }
          });
          toast.success("Payment verified successfully!");
        } else {
          setStatus({
            success: false,
            message: resultExplanation || "Payment verification failed"
          });
          toast.error("Payment verification failed");
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus({
          success: false,
          message: "An error occurred while verifying the payment"
        });
        toast.error("Failed to verify payment");
      } finally {
        setIsLoading(false);
        // Clear the transaction token from session storage
        sessionStorage.removeItem('dpoTransactionToken');
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-center">
            {isLoading ? "Verifying Payment..." : "Payment Status"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4">Please wait while we verify your payment...</p>
            </div>
          ) : status ? (
            <div className="space-y-4">
              <div className={`text-center text-lg font-medium ${status.success ? 'text-green-600' : 'text-red-600'}`}>
                {status.message}
              </div>
              {status.success && status.details && (
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p>Amount: {status.details.currency} {status.details.amount}</p>
                  <p>Reference: {status.details.reference}</p>
                </div>
              )}
              <div className="mt-6">
                <a
                  href="/"
                  className="block w-full text-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                  Return to Home
                </a>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentComplete;