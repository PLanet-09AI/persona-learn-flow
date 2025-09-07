import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, AlertCircle, DollarSign, CheckCircle } from "lucide-react";
import { enhancedYocoService } from "@/services/yocoEnhanced";
import { useToast } from "@/components/ui/use-toast";

interface RefundManagerProps {
  paymentId?: string;
  onRefundComplete?: (refundData: any) => void;
}

export const RefundManager: React.FC<RefundManagerProps> = ({
  paymentId: initialPaymentId = '',
  onRefundComplete
}) => {
  const [paymentId, setPaymentId] = useState(initialPaymentId);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [refundResult, setRefundResult] = useState<any>(null);
  const { toast } = useToast();

  const handleProcessRefund = async () => {
    if (!paymentId.trim()) {
      toast({
        title: "Payment ID Required",
        description: "Please enter a valid payment ID to process the refund.",
        variant: "destructive"
      });
      return;
    }

    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid refund amount greater than 0.",
        variant: "destructive"
      });
      return;
    }

    const amountInCents = Math.round(parseFloat(refundAmount) * 100);

    setIsProcessing(true);
    setRefundResult(null);

    try {
      console.log(`🔄 Processing refund for payment ${paymentId}`);

      const refund = await enhancedYocoService.processRefund(
        paymentId.trim(),
        {
          amount: amountInCents,
          reason: refundReason.trim() || 'Administrative refund',
          metadata: {
            processedBy: 'admin',
            processedAt: new Date().toISOString(),
            refundType: 'manual_refund'
          }
        }
      );

      setRefundResult(refund);

      toast({
        title: "Refund Processed Successfully! ✅",
        description: `Refund of R${(amountInCents / 100).toFixed(2)} has been processed.`,
      });

      if (onRefundComplete) {
        onRefundComplete(refund);
      }

      // Clear form after successful refund
      setRefundAmount('');
      setRefundReason('');

    } catch (error: any) {
      console.error('❌ Refund processing error:', error);
      
      let errorMessage = 'Failed to process refund. Please try again.';
      
      if (error.message.includes('not found')) {
        errorMessage = 'Payment ID not found. Please check the payment ID and try again.';
      } else if (error.message.includes('already refunded')) {
        errorMessage = 'This payment has already been refunded.';
      } else if (error.message.includes('insufficient')) {
        errorMessage = 'Refund amount exceeds the available balance.';
      }

      toast({
        title: "Refund Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestRefund = () => {
    // For testing purposes, simulate a successful refund
    const mockRefund = {
      id: `rfnd_${Date.now()}`,
      status: 'successful',
      amount: Math.round(parseFloat(refundAmount) * 100),
      currency: 'ZAR',
      createdDate: new Date().toISOString(),
      metadata: {
        processedBy: 'admin',
        processedAt: new Date().toISOString(),
        refundType: 'test_refund'
      }
    };

    setRefundResult(mockRefund);

    toast({
      title: "Test Refund Simulated ✅",
      description: `Mock refund of R${refundAmount} created for testing.`,
    });

    if (onRefundComplete) {
      onRefundComplete(mockRefund);
    }
  };

  const getConfigInfo = enhancedYocoService.getConfigInfo();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Refund Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Status */}
          <Alert className={getConfigInfo.hasSecretKey ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            <AlertCircle className={`h-4 w-4 ${getConfigInfo.hasSecretKey ? 'text-green-600' : 'text-yellow-600'}`} />
            <AlertDescription>
              <strong>Yoco Configuration:</strong>{' '}
              {getConfigInfo.hasSecretKey ? (
                <span className="text-green-700">
                  Secret key configured ✓ ({getConfigInfo.secretKeyPreview})
                </span>
              ) : (
                <span className="text-yellow-700">
                  Secret key missing. Add VITE_YOCO_SECRET_KEY to your .env file for live refunds.
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Refund Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-id">Payment ID</Label>
              <Input
                id="payment-id"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="ch_xxxxxxxxxxxxx"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter the Yoco payment ID you want to refund
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-amount">Refund Amount (ZAR)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="refund-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the amount to refund (partial or full refund)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-reason">Refund Reason (Optional)</Label>
              <Textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g., Customer request, technical issue, etc."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleProcessRefund}
              disabled={isProcessing || !paymentId.trim() || !refundAmount}
              className="flex-1"
              variant={getConfigInfo.hasSecretKey ? "default" : "secondary"}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Refund...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {getConfigInfo.hasSecretKey ? 'Process Real Refund' : 'Live Refund (Key Missing)'}
                </div>
              )}
            </Button>

            <Button
              onClick={handleTestRefund}
              disabled={isProcessing || !refundAmount}
              variant="outline"
              className="flex-1"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Test Refund
              </div>
            </Button>
          </div>

          {!getConfigInfo.hasSecretKey && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Development Mode:</strong> Use "Test Refund" to simulate refunds without the secret key.
                For production refunds, add your Yoco secret key to the .env file.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Refund Result */}
      {refundResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Refund Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Refund ID:</span>
                  <p className="font-mono text-xs text-muted-foreground">{refundResult.id}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant="outline" className="ml-2">
                    {refundResult.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Amount:</span>
                  <p className="font-semibold">R{(refundResult.amount / 100).toFixed(2)}</p>
                </div>
                <div>
                  <span className="font-medium">Date:</span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(refundResult.createdDate).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {refundResult.metadata && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <span className="text-xs font-medium">Metadata:</span>
                  <pre className="text-xs text-muted-foreground mt-1">
                    {JSON.stringify(refundResult.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RefundManager;
