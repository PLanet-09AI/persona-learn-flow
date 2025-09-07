import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, ExternalLink, Shield, CreditCard } from "lucide-react";
import { enhancedYocoService } from "@/services/yocoEnhanced";
import { useToast } from "@/components/ui/use-toast";

export const PaymentTestPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testPaymentConfig = enhancedYocoService.getConfigInfo();

  const handleTestCheckout = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing Yoco checkout creation...');

      const checkout = await enhancedYocoService.createSubscriptionCheckout(
        'test-user-123',
        'test@example.com',
        'monthly'
      );

      setTestResult({
        success: true,
        data: checkout,
        message: 'Checkout created successfully!'
      });

      toast({
        title: "Checkout Test Successful! ✅",
        description: "Yoco checkout created successfully. Check the result below.",
      });

    } catch (error: any) {
      console.error('❌ Checkout test failed:', error);
      
      setTestResult({
        success: false,
        error: error.message,
        message: 'Checkout creation failed'
      });

      toast({
        title: "Checkout Test Failed",
        description: error.message || "Unable to create checkout session.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActualRedirect = () => {
    if (testResult?.success && testResult.data?.redirectUrl) {
      window.open(testResult.data.redirectUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Payment System Test</h1>
        <p className="text-muted-foreground">
          Test the Yoco payment integration and checkout creation
        </p>
      </div>

      {/* Configuration Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Public Key:</span>
              <Badge variant={testPaymentConfig.hasPublicKey ? "default" : "destructive"}>
                {testPaymentConfig.hasPublicKey ? '✅ Configured' : '❌ Missing'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Secret Key:</span>
              <Badge variant={testPaymentConfig.hasSecretKey ? "default" : "destructive"}>
                {testPaymentConfig.hasSecretKey ? '✅ Configured' : '❌ Missing'}
              </Badge>
            </div>
            {testPaymentConfig.hasSecretKey && (
              <div className="text-xs text-muted-foreground">
                Preview: {testPaymentConfig.secretKeyPreview}
              </div>
            )}
          </div>

          {!testPaymentConfig.hasSecretKey && (
            <Alert className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Secret key required:</strong> Add VITE_YOCO_SECRET_KEY to your .env file to test checkout creation.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Checkout Creation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Test Checkout Creation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will create a test checkout session for a Monthly subscription (R99.00).
          </p>

          <Button
            onClick={handleTestCheckout}
            disabled={isLoading || !testPaymentConfig.hasSecretKey}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating test checkout...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Test Checkout Creation
              </div>
            )}
          </Button>

          {!testPaymentConfig.hasSecretKey && (
            <p className="text-xs text-center text-muted-foreground">
              Button disabled until secret key is configured
            </p>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Test Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription>
                  <strong>{testResult.message}</strong>
                  {testResult.error && (
                    <div className="mt-2 text-sm text-red-700">
                      Error: {testResult.error}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {testResult.success && testResult.data && (
                <div className="space-y-3">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Checkout Details:</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {testResult.data.id}</div>
                      <div><strong>Status:</strong> <Badge variant="outline">{testResult.data.status}</Badge></div>
                      <div><strong>Amount:</strong> R{(testResult.data.amount / 100).toFixed(2)}</div>
                      <div><strong>Currency:</strong> {testResult.data.currency}</div>
                    </div>
                  </div>

                  {testResult.data.redirectUrl && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Redirect URL:</p>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-muted p-2 rounded text-xs break-all">
                          {testResult.data.redirectUrl}
                        </code>
                        <Button
                          onClick={handleActualRedirect}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                  )}

                  {testResult.data.metadata && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Metadata:</h4>
                      <pre className="text-xs text-muted-foreground">
                        {JSON.stringify(testResult.data.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentTestPage;
