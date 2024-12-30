import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyDPOToken } from "@/services/dpoPayment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PaymentComplete = () => {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyPayment = async () => {
      const transToken = sessionStorage.getItem('dpoTransToken');
      
      if (!transToken) {
        setVerificationStatus('error');
        toast.error("Payment verification failed: No transaction token found");
        return;
      }

      try {
        const verificationResult = await verifyDPOToken(transToken);
        
        if (verificationResult.Result === "000") {
          setVerificationStatus('success');
          toast.success("Payment verified successfully!");
          // Clean up the token from storage
          sessionStorage.removeItem('dpoTransToken');
        } else {
          setVerificationStatus('error');
          toast.error(`Payment verification failed: ${verificationResult.ResultExplanation}`);
        }
      } catch (error) {
        setVerificationStatus('error');
        toast.error("Failed to verify payment. Please contact support.");
        console.error('Verification error:', error);
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>
            {verificationStatus === 'loading' && 'Verifying Payment...'}
            {verificationStatus === 'success' && 'Thank You for Your Donation!'}
            {verificationStatus === 'error' && 'Payment Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            {verificationStatus === 'loading' && 'Please wait while we verify your payment...'}
            {verificationStatus === 'success' && 'Your donation has been successfully processed. Thank you for your generosity!'}
            {verificationStatus === 'error' && 'We encountered an issue verifying your payment. Please contact support for assistance.'}
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
          >
            Return to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentComplete;