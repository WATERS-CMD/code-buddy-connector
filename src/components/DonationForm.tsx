import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DPOPaymentResponse {
  TransToken: string;
  Result: string;
  ResultExplanation: string;
}

const DonationForm = () => {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to create a payment token
  const createDPOPaymentRequest = async () => {
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
      } as DPOPaymentResponse;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };

  // Function to verify the transaction token
  const verifyDPOPaymentToken = async (transToken: string) => {
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
        headers: { 'Content-Type': 'application/xml' },
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Step 1: Create the payment request
      const paymentResponse = await createDPOPaymentRequest();

      // Step 2: Verify the transaction token
      if (paymentResponse.Result === "000") {
        const isTransactionValid = await verifyDPOPaymentToken(paymentResponse.TransToken);

        if (isTransactionValid) {
          // Step 3: Redirect to the payment page
          const paymentUrl = `https://secure.3gdirectpay.com/payv3.php?ID=${paymentResponse.TransToken}&timeout=1800`;
          window.location.href = paymentUrl;
        } else {
          toast.error("Transaction is no longer valid. Please try again.");
        }
      } else {
        toast.error(`Payment initialization failed: ${paymentResponse.ResultExplanation}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Predefined donation amounts
  const predefinedAmounts = [10, 25, 50, 100];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {predefinedAmounts.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant={amount === preset.toString() ? "default" : "outline"}
            onClick={() => setAmount(preset.toString())}
            className="w-full"
          >
            ${preset}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Amount ($)
          </label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Donate Now"}
        </Button>
      </div>
    </form>
  );
};

export default DonationForm;
