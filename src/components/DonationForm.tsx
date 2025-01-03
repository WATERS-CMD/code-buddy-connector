import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PresetAmounts from "./PresetAmounts";
import { createDPOPaymentRequest, verifyDPOPaymentToken } from "@/utils/dpoApi";

const DonationForm = () => {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const paymentResponse = await createDPOPaymentRequest(amount);

      if (paymentResponse.Result === "000") {
        const isTransactionValid = await verifyDPOPaymentToken(paymentResponse.TransToken);

        if (isTransactionValid) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PresetAmounts selectedAmount={amount} onAmountSelect={setAmount} />

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