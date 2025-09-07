import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, Shield, Zap, Star, AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { enhancedYocoService } from "@/services/yocoEnhanced";
import { useToast } from "@/components/ui/use-toast";

export const SubscriptionPlans = () => {
  const [isLoading, setIsLoading] = useState<'monthly' | 'yearly' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const subscriptionPlans = {
    monthly: {
      name: "Monthly Pro",
      price: 99,
      period: "month",
      features: [
        "Unlimited course access",
        "AI-powered personalized learning",
        "Interactive quizzes and assessments",
        "Progress tracking and analytics",
        "Certificate generation",
        "Priority support",
        "Mobile app access"
      ]
    },
    yearly: {
      name: "Annual Pro",
      price: 299,
      originalPrice: 1188,
      period: "year",
      popular: true,
      features: [
        "Everything in Monthly Pro",
        "Save 75% compared to monthly",
        "Advanced analytics dashboard",
        "1-on-1 mentoring sessions",
        "Custom learning paths",
        "Early access to new features",
        "Lifetime certificate storage"
      ]
    }
  };

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to subscribe.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(planType);

    try {
      const plan = subscriptionPlans[planType];
      console.log(`🚀 Creating checkout for ${planType} plan for user:`, user.email);

      // Create checkout session and redirect to Yoco payment page
      const checkoutRequest = {
        amount: plan.price * 100, // Convert to cents
        currency: 'ZAR' as const,
        cancelUrl: `${window.location.origin}/payment-failure`,
        successUrl: `${window.location.origin}/payment-success`,
        failureUrl: `${window.location.origin}/payment-failure`,
        metadata: {
          userId: user.id || 'anonymous',
          userEmail: user.email || 'unknown',
          subscriptionType: plan.name,
          planType,
          timestamp: new Date().toISOString()
        }
      };

      const checkout = await enhancedYocoService.createCheckout(checkoutRequest);
      
      console.log('✅ Checkout created, redirecting to:', checkout.redirectUrl);
      
      toast({
        title: "Redirecting to Payment",
        description: "You will be redirected to complete your payment securely.",
      });
      
      // Small delay to show the toast, then redirect
      setTimeout(() => {
        window.location.href = checkout.redirectUrl;
      }, 1500);

    } catch (error: any) {
      console.error('❌ Subscription error:', error);
      
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const configInfo = enhancedYocoService.getConfigInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock your potential with AI-powered personalized learning
          </p>
        </div>

        {/* Configuration Status */}
        {!configInfo.hasSecretKey && (
          <Alert className="max-w-4xl mx-auto mb-8 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Development Mode:</strong> Add VITE_YOCO_SECRET_KEY to your .env file for live payments.
            </AlertDescription>
          </Alert>
        )}

        {!user && (
          <Alert className="max-w-4xl mx-auto mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to subscribe to a plan and start your learning journey.
            </AlertDescription>
          </Alert>
        )}

        {/* Pricing Cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          
          {/* Monthly Plan */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {subscriptionPlans.monthly.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-blue-600">R{subscriptionPlans.monthly.price}</span>
                <span className="text-gray-600">/{subscriptionPlans.monthly.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-8">
                {subscriptionPlans.monthly.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={() => handleSubscribe('monthly')}
                disabled={!!isLoading || !user || !configInfo.hasSecretKey}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isLoading === 'monthly' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating checkout...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Start Monthly Plan
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="relative overflow-hidden border-2 border-blue-500 shadow-lg transform scale-105">
            {/* Popular Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-blue-500 text-white font-semibold px-3 py-1">
                <Star className="h-4 w-4 mr-1" />
                Most Popular
              </Badge>
            </div>

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {subscriptionPlans.yearly.name}
              </CardTitle>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-lg text-gray-500 line-through">
                    R{subscriptionPlans.yearly.originalPrice}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    75% OFF
                  </Badge>
                </div>
                <span className="text-4xl font-bold text-blue-600">R{subscriptionPlans.yearly.price}</span>
                <span className="text-gray-600">/{subscriptionPlans.yearly.period}</span>
                <div className="text-sm text-green-600 font-medium mt-1">
                  Only R{Math.round(subscriptionPlans.yearly.price / 12)}/month
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-8">
                {subscriptionPlans.yearly.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={() => handleSubscribe('yearly')}
                disabled={!!isLoading || !user || !configInfo.hasSecretKey}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isLoading === 'yearly' ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating checkout...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Start Yearly Plan
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto mt-16">
          <Separator className="mb-8" />
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Shield className="h-12 w-12 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Secure Payments</h3>
              <p className="text-sm text-gray-600">
                Protected by Yoco's industry-leading security
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <CreditCard className="h-12 w-12 text-green-500" />
              <h3 className="font-semibold text-gray-900">Easy Cancellation</h3>
              <p className="text-sm text-gray-600">
                Cancel anytime with no hidden fees
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <Zap className="h-12 w-12 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Instant Access</h3>
              <p className="text-sm text-gray-600">
                Start learning immediately after payment
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-2">
            Have questions about our plans?
          </p>
          <Button variant="link" className="text-blue-600 hover:text-blue-800">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
