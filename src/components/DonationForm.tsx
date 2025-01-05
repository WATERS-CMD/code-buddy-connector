import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPaymentToken } from "@/services/dpoPaymentService";

const DonationForm = () => {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const paymentResponse = await createPaymentToken({
        amount,
        currency: "USD",
        reference: `TRANS${Date.now()}`,
        returnUrl: "https://apolytosmanagement.com/payment-complete",
        backUrl: "https://apolytosmanagement.com/donation"
      });
      
      if (paymentResponse.Result === "000") {
        const paymentUrl = `https://secure.3gdirectpay.com/payv3.php?ID=${paymentResponse.TransToken}&timeout=1800`;
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