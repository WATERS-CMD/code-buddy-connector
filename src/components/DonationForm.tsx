import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPaymentToken, getPaymentUrl } from "@/services/dpo/paymentService";

const DonationForm = () => {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      console.log('Submitting amount:', amount); // Debug log
      
      const paymentResponse = await createPaymentToken({
        amount,
        currency: "USD",
        reference: `TRANS${Date.now()}`,
        returnUrl: window.location.origin + "/payment-complete",
        backUrl: window.location.origin + "/donation"
      });
      
      console.log('Payment response:', paymentResponse); // Debug log

      if (paymentResponse.Result === "000") {
        if (!paymentResponse.TransToken) {
          throw new Error("No transaction token received");
        }
        // Store token in session storage for verification after redirect
        sessionStorage.setItem('dpoTransactionToken', paymentResponse.TransToken);
        // Redirect to DPO payment page
        window.location.href = getPaymentUrl(paymentResponse.TransToken);
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