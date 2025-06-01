'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/useAuthStore';
import { Loader2, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';

const StripeConnectAccount = () => {
  const router = useRouter();
  const { 
    user, 
    isLoading, 
    error, 
    stripeConnectData,
    createStripeConnectAccount,
    getStripeAccountStatus,
    getStripeOnboardingLink
  } = useAuthStore();
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  // Check account status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      await getStripeAccountStatus();
    };

    if (user?.vendor?.id) {
      checkStatus();
    }
  }, [user?.vendor?.id, getStripeAccountStatus]);

  // Handle account creation
  const handleCreateAccount = async () => {
    await createStripeConnectAccount();
  };

  // Handle onboarding link generation and redirect
  const handleOnboardingSetup = async () => {
    setIsLoadingLink(true);
    try {
      const url = await getStripeOnboardingLink();
      if (url) {
        window.location.href = url;
      } else {
        setStatusMessage("Failed to get onboarding link. Please try again.");
      }
    } catch (error) {
      setStatusMessage("An error occurred while setting up your account.");
    } finally {
      setIsLoadingLink(false);
    }
  };

  // Handle Stripe redirect result
  useEffect(() => {
    // Check if this is a redirect from Stripe onboarding
    const url = new URL(window.location.href);
    const setupMode = url.searchParams.get('setup_mode');
    
    if (setupMode === 'complete') {
      // Success - refresh account status
      getStripeAccountStatus();
      setStatusMessage("Your Stripe Connect account setup was successful!");
    } else if (setupMode === 'canceled') {
      // Cancelled - show message
      setStatusMessage("Account setup was canceled. You can resume setup later.");
    }
  }, [getStripeAccountStatus]);

  // Render account status
  const renderAccountStatus = () => {
    if (!user?.vendor) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          <span>You need to create a vendor profile first.</span>
        </div>
      );
    }

    if (!stripeConnectData?.accountId) {
      return (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <span>You haven't created a Stripe Connect account yet.</span>
          </div>
          <Button onClick={handleCreateAccount} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Stripe Connect Account'
            )}
          </Button>
        </div>
      );
    }

    if (stripeConnectData.onboardingComplete) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
          <span>Your Stripe Connect account is active and ready to receive payments!</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          <span>
            Your Stripe Connect account needs to be set up. 
            Complete the onboarding process to start receiving payments.
          </span>
        </div>
        <Button 
          onClick={handleOnboardingSetup} 
          disabled={isLoadingLink || isLoading}
          className="flex items-center"
        >
          {(isLoadingLink || isLoading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              Complete Stripe Onboarding
              <ExternalLink className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Stripe Connect</h2>
        <p className="text-gray-600">
          Connect your Stripe account to receive payments from customers.
        </p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-md ${
          statusMessage.includes('successful') 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-amber-50 border border-amber-200 text-amber-700'
        }`}>
          {statusMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        {renderAccountStatus()}
      </div>

      {stripeConnectData?.accountId && !stripeConnectData.onboardingComplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-medium text-blue-800 mb-2">What to expect during onboarding:</h3>
          <ul className="list-disc pl-5 space-y-1 text-blue-700">
            <li>You'll be redirected to Stripe to complete your account setup</li>
            <li>You'll need to provide business information and banking details</li>
            <li>For testing, you can use Stripe's test data</li>
            <li>Once complete, you'll be redirected back to this page</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default StripeConnectAccount; 