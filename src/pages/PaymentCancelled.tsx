import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PaymentCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl text-orange-800">Payment Cancelled</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <Alert className="border-orange-200 bg-orange-50">
            <XCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Your payment was cancelled. No charges were made to your account.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            You can try again anytime or contact support if you need assistance.
          </p>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate('/subscription')}
              className="w-full"
              variant="default"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at support@personalearn.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelled;
