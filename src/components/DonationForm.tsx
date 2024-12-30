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
          <PTL>5</PTL>
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
          'Accept': 'application/xml',
          'Origin': 'https://apolytosmanagement.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
        mode: 'cors',
        credentials: 'include',
        body: xmlRequest,
      });

      const data = await response.text();
      // Parse XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
      const result = xmlDoc.querySelector("Result")?.textContent;
      const transToken = xmlDoc.querySelector("TransToken")?.textContent;
      const resultExplanation = xmlDoc.querySelector("ResultExplanation")?.textContent;

      return {
        Result: result,
        TransToken: transToken,
        ResultExplanation: resultExplanation,
      } as DPOPaymentResponse;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const paymentResponse = await createDPOPaymentRequest();
      
      if (paymentResponse.Result === "000") {
        // Redirect to DPO payment page
        const paymentUrl = `https://secure.3gdirectpay.com/payv3.php?ID=${paymentResponse.TransToken}`;
        window.location.href = paymentUrl;
      } else {
        toast.error(`Payment initialization failed: ${paymentResponse.ResultExplanation}`);
      }
    } catch (error) {
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

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