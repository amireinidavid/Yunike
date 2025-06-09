'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useStripeStore from '@/store/useStripeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StripeOnboardingCompletePage() {
  const router = useRouter();
  const { getAccountStatus, isLoading, error, accountStatus } = useStripeStore();
  const [processingComplete, setProcessingComplete] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Update account status when page loads
  useEffect(() => {
    const fetchAccountStatus = async () => {
      await getAccountStatus();
      setProcessingComplete(true);
    };

    fetchAccountStatus();
  }, [getAccountStatus]);

  // Auto redirect countdown after processing is complete
  useEffect(() => {
    if (!processingComplete) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard/stripe-connect');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [processingComplete, router]);

  // Handle manual navigation
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToStripeSettings = () => {
    router.push('/dashboard/stripe-connect');
  };

  return (
    <div className="container max-w-lg mx-auto py-16">
      <Card className="border-green-200 shadow-lg">
        <CardHeader className="pb-4 text-center">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
          )}
          <CardTitle className="text-2xl font-bold">
            {isLoading ? 'Processing...' : 'Stripe Onboarding Complete!'}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center">
          {isLoading ? (
            <p className="text-muted-foreground">
              We're updating your account information...
            </p>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="mb-4">
                Thank you for completing your Stripe onboarding process! Your account is now set up to
                receive payments.
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-green-800 mb-2">Account Status</h3>
                <p className="text-sm text-green-700">
                  {accountStatus.detailsSubmitted 
                    ? 'Your account details have been submitted successfully.' 
                    : 'Your account has been created, but additional information may be needed.'}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  {accountStatus.payoutsEnabled 
                    ? 'Payouts are enabled! You can now receive payments.' 
                    : 'Payouts will be enabled once your account is fully verified.'}
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                You will be redirected to your Stripe settings in {countdown} seconds...
              </p>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            onClick={handleGoToDashboard}
            disabled={isLoading}
          >
            Go to Dashboard
          </Button>
          <Button 
            onClick={handleGoToStripeSettings}
            disabled={isLoading}
          >
            Stripe Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
