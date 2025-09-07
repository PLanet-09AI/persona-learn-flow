import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, User, AlertCircle } from 'lucide-react';
import CVGenerator from '@/components/learning/CVGenerator';
import { paymentFirebaseService } from '@/services/paymentFirebase';
import { yocoClientService } from '@/services/yocoClient';
import { UserProfile, SubscriptionStatus } from '@/types/payment';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

const CVGeneratorPage: React.FC = () => {
  const { user, firebaseUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (firebaseUser) {
      loadUserData();
    }
  }, [firebaseUser]);

  const loadUserData = async () => {
    if (!firebaseUser) return;

    setLoading(true);
    try {
      // Load user profile
      const userProfile = await paymentFirebaseService.getUserProfile(firebaseUser.uid);
      setProfile(userProfile);

      // Check subscription status using client service
      const subStatus = await yocoClientService.checkSubscriptionStatus(firebaseUser.uid);
      setSubscription({
        status: subStatus.hasActiveSubscription ? 'active' : 'none',
        endDate: subStatus.expiresAt
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load your profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isProfileComplete = (profile: UserProfile): boolean => {
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'industry',
      'experienceLevel'
    ];

    return requiredFields.every(field => {
      const value = profile[field as keyof UserProfile];
      return value && value !== '';
    }) && profile.skills.length > 0;
  };

  const hasActiveSubscription = subscription?.status === 'active';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              You need to complete your profile before generating a CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/profile'} 
              className="w-full"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileComplete = isProfileComplete(profile);

  if (!profileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Your profile needs more information to generate a comprehensive CV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p className="font-medium">Missing information:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {!profile.firstName && <li>First Name</li>}
                {!profile.lastName && <li>Last Name</li>}
                {!profile.email && <li>Email Address</li>}
                {!profile.industry && <li>Industry</li>}
                {!profile.experienceLevel && <li>Experience Level</li>}
                {profile.skills.length === 0 && <li>Skills (at least one)</li>}
              </ul>
            </div>
            <Button 
              onClick={() => window.location.href = '/profile'} 
              className="w-full"
            >
              <User className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>CV Generator - Premium Feature</CardTitle>
            <CardDescription>
              AI-powered CV and cover letter generation requires an active subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p className="font-medium">What you'll get:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Professional CV generation using AI</li>
                <li>Multiple template styles</li>
                <li>Personalized cover letters</li>
                <li>ATS-optimized formatting</li>
                <li>Multiple output formats</li>
                <li>Unlimited generations</li>
              </ul>
            </div>
            
            <Alert>
              <AlertDescription>
                <strong>Current Status:</strong> {subscription?.status || 'No active subscription'}
                {subscription?.endDate && (
                  <span className="block text-sm mt-1">
                    {subscription.status === 'active' 
                      ? `Expires: ${subscription.endDate.toLocaleDateString()}`
                      : `Expired: ${subscription.endDate.toLocaleDateString()}`
                    }
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <Button 
              onClick={() => window.location.href = '/subscription'} 
              className="w-full"
            >
              View Subscription Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CV Generator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create professional CVs and cover letters using AI, tailored to your profile and career goals
          </p>
        </div>

        {/* Subscription Status Banner */}
        {subscription && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <FileText className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Premium Active</strong> - Unlimited CV and cover letter generations
              {subscription.endDate && (
                <span className="block text-sm mt-1">
                  Subscription expires: {subscription.endDate.toLocaleDateString()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* CV Generator Component */}
        <CVGenerator profile={profile} />

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Generated CVs are based on your profile information. 
            Keep your profile updated for best results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CVGeneratorPage;
