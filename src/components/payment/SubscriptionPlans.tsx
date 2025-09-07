import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Shield, Zap, Star, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { enhancedYocoService } from "@/services/yocoEnhanced";
import { useToast } from "@/components/ui/use-toast";

export const SubscriptionPlans = () => {
  const [isLoading, setIsLoading] = useState<'monthly' | 'yearly' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

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
      console.log('🔐 Creating Yoco checkout and redirecting to payment page');
      
      const checkout = await enhancedYocoService.createSubscriptionCheckout(
        user.id,
        user.email || user.name || 'Unknown User',
        planType
      );

      if (checkout.redirectUrl) {
        toast({
          title: "Redirecting to Payment",
          description: "You will be redirected to complete your payment.",
        });

        // Small delay to show the toast before redirect
        setTimeout(() => {
          window.location.href = checkout.redirectUrl;
        }, 1000);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Checkout Creation Failed",
        description: error.message || "Unable to create payment checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const features = [
    "Unlimited course access",
    "AI-powered personalized learning",
    "Progress tracking and analytics",
    "Chat with AI tutor",
    "Certificate generation",
    "CV builder with AI assistance",
    "Priority support",
    "Mobile app access"
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Learning Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock unlimited access to personalized AI-powered learning courses and build your career with our comprehensive platform.
        </p>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-blue-700 font-medium">
            🔐 Secure checkout powered by Yoco
          </p>
          <p className="text-xs text-blue-600 mt-1">
            You'll be redirected to complete your payment securely
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Monthly Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Monthly Plan
            </CardTitle>
            <div className="text-3xl font-bold">
              R99
              <span className="text-base font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Separator />
            
            <Button
              onClick={() => handleSubscribe('monthly')}
              disabled={!!isLoading}
              className="w-full"
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
            
            <p className="text-xs text-center text-muted-foreground">
              Cancel anytime • 7-day refund guarantee
            </p>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className="relative border-primary">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Best Value
            </Badge>
          </div>
          
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Yearly Plan
            </CardTitle>
            <div className="text-3xl font-bold">
              R999
              <span className="text-base font-normal text-muted-foreground">/year</span>
            </div>
            <div className="text-sm text-green-600 font-medium">
              Save R189 (2 months free!)
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm text-primary font-medium">
                🎯 Perfect for committed learners
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Get the full experience at the best price
              </p>
            </div>
            
            <Separator />
            
            <Button
              onClick={() => handleSubscribe('yearly')}
              disabled={!!isLoading}
              className="w-full"
              size="lg"
              variant="default"
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
            
            <p className="text-xs text-center text-muted-foreground">
              Cancel anytime • 7-day refund guarantee
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Secure payment powered by Yoco • All major cards accepted</span>
        </div>
      </div>
    </div>
  );
};
