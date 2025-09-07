import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { paymentFirebaseService } from "@/services/paymentFirebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      const checkoutId = searchParams.get('checkout_id');
      const paymentId = searchParams.get('payment_id');

      if (!checkoutId || !user) {
        setIsProcessing(false);
        return;
      }

      try {
        // Update payment record
        const payment = await paymentFirebaseService.getPaymentByCheckoutId(checkoutId);
        
        if (payment) {
          const now = new Date();
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + (payment.subscriptionType === 'yearly' ? 12 : 1));

          await paymentFirebaseService.updatePaymentRecord(payment.id, {
            status: 'completed',
            paymentId: paymentId || undefined,
            paidAt: now,
            expiresAt
          });

          // Create subscription
          await paymentFirebaseService.createSubscription({
            userId: user.id,
            paymentId: payment.id,
            subscriptionType: payment.subscriptionType,
            status: 'active',
            startDate: now,
            endDate: expiresAt,
            autoRenew: true,
            createdAt: now,
            updatedAt: now
          });

          toast({
            title: "Payment Successful!",
            description: "Your subscription is now active. Welcome aboard!",
          });
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        toast({
          title: "Processing Error",
          description: "Payment received but there was an issue activating your subscription. Contact support.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, user, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-yellow-500 animate-pulse mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Thank you for your payment! Your subscription has been activated and you now have full access to all features.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/learn')}
              className="w-full"
            >
              Start Learning
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              className="w-full"
            >
              View Profile
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Remember: You have 7 days to request a refund if you're not satisfied.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl text-yellow-700">Payment Cancelled</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Your payment was cancelled. No charges were made to your account.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/subscribe')}
              className="w-full"
            >
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-700">Payment Failed</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            We couldn't process your payment. Please check your payment details and try again.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/subscribe')}
              className="w-full"
            >
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/contact')}
              className="w-full"
            >
              Contact Support
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            If you continue to experience issues, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
