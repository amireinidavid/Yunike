'use client';

import { useEffect, useState } from 'react';
import useStripeStore from '@/store/useStripeStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StripeConnectPage() {
  const {
    isLoading,
    error,
    accountStatus,
    onboardingUrl,
    createConnectAccount,
    getAccountStatus,
    getOnboardingLink,
    updatePayoutSchedule,
    disconnectAccount,
    clearError,
  } = useStripeStore();

  // Always use lowercase values for Stripe API compatibility
  const [payoutSchedule, setPayoutSchedule] = useState('daily');
  const [minimumAmount, setMinimumAmount] = useState('');
  const [isUpdatingPayout, setIsUpdatingPayout] = useState(false);

  // Load account status on page load
  useEffect(() => {
    getAccountStatus();
  }, []);

  // Helper function to handle account connection
  const handleConnectAccount = async () => {
    await createConnectAccount('EXPRESS');
    if (onboardingUrl) {
      window.location.href = onboardingUrl;
    }
  };

  // Helper function to get and open onboarding link
  const handleContinueOnboarding = async () => {
    const url = await getOnboardingLink();
    if (url) {
      window.location.href = url;
    }
  };

  // Helper function to update payout schedule
  const handleUpdatePayoutSchedule = async () => {
    setIsUpdatingPayout(true);
    try {
      // Make sure the schedule value is one of the allowed values
      const validSchedules = ['daily', 'weekly', 'monthly', 'manual'];
      const normalizedSchedule = validSchedules.includes(payoutSchedule.toLowerCase()) 
        ? payoutSchedule.toLowerCase() 
        : 'daily';
      
      const amount = minimumAmount ? parseInt(minimumAmount, 10) : undefined;
      
      console.log('Updating payout schedule:', { 
        original: payoutSchedule,
        normalized: normalizedSchedule, 
        amount 
      });
      
      const response = await updatePayoutSchedule(normalizedSchedule, amount);
      console.log('Update response:', response);
      
      // The response type is 'never', so we cannot check for response?.error.
      // Instead, rely on the store's error state and just clear any previous error before the call.
      // No need to handle response error here.
    } catch (error: unknown) {
      // Properly type the error and handle it
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in handleUpdatePayoutSchedule:', errorMessage);
    } finally {
      setIsUpdatingPayout(false);
    }
  };

  // Helper function to disconnect account with confirmation
  const handleDisconnectAccount = async () => {
    if (window.confirm('Are you sure you want to disconnect your Stripe account? This action cannot be undone.')) {
      await disconnectAccount();
    }
  };

  // Display status badge based on account status
  const renderStatusBadge = () => {
    if (!accountStatus.stripeAccountId) return null;

    const statusMap = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4 mr-2" /> },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-4 h-4 mr-2" /> },
      RESTRICTED: { color: 'bg-orange-100 text-orange-800', icon: <AlertCircle className="w-4 h-4 mr-2" /> },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4 mr-2" /> },
      DISABLED: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="w-4 h-4 mr-2" /> },
    };

    const status = accountStatus.status || 'PENDING';
    const { color, icon } = statusMap[status] || statusMap.PENDING;

    return (
      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${color}`}>
        {icon}
        {status}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Stripe Connect</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={clearError}>
            Dismiss
          </Button>
        </Alert>
      )}

      {isLoading && !accountStatus.stripeAccountId ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading your Stripe account information...</p>
        </div>
      ) : (
        <>
          {!accountStatus.stripeAccountId ? (
            <Card>
              <CardHeader>
                <CardTitle>Connect with Stripe</CardTitle>
                <CardDescription>
                  Connect your store with Stripe to start accepting payments from customers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Stripe Connect allows you to accept payments on our platform. We'll handle payment processing,
                  security, and compliance while you focus on your products.
                </p>
                {accountStatus.isTestMode && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Test Mode</AlertTitle>
                    <AlertDescription>
                      This is a test integration. No real payments will be processed.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleConnectAccount} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect with Stripe'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : !accountStatus.detailsSubmitted ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Complete Your Stripe Onboarding</CardTitle>
                  {renderStatusBadge()}
                </div>
                <CardDescription>
                  Your Stripe account has been created, but you need to complete the onboarding process.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Before you can receive payments, please complete the Stripe onboarding process
                  to verify your identity and set up your payment details.
                </p>
                {accountStatus.isTestMode && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Test Mode</AlertTitle>
                    <AlertDescription>
                      This is a test integration. No real payments will be processed.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleContinueOnboarding} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait...
                    </>
                  ) : (
                    <>
                      Continue Onboarding <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Stripe Account Status</CardTitle>
                    {renderStatusBadge()}
                  </div>
                  <CardDescription>
                    Your Stripe Connect account is set up and ready to process payments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Account ID</h3>
                      <p className="font-mono">{accountStatus.stripeAccountId}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Status</h3>
                      <p>{accountStatus.status || 'PENDING'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Payouts Enabled</h3>
                      <p>
                        {accountStatus.payoutsEnabled ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-2" /> Enabled
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <XCircle className="w-4 h-4 mr-2" /> Disabled
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-2">Charges Enabled</h3>
                      <p>
                        {accountStatus.chargesEnabled ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-2" /> Enabled
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <XCircle className="w-4 h-4 mr-2" /> Disabled
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {accountStatus.isTestMode && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Test Mode</AlertTitle>
                      <AlertDescription>
                        This is a test integration. No real payments will be processed.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => getAccountStatus()} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      'Refresh Status'
                    )}
                  </Button>
                  <Button variant="destructive" onClick={handleDisconnectAccount} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      'Disconnect Account'
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payout Settings</CardTitle>
                  <CardDescription>
                    Configure how and when you receive payouts from sales.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-4 md:col-span-2">
                        <Label htmlFor="schedule">Payout Schedule</Label>
                        <Select
                          value={payoutSchedule}
                          onValueChange={setPayoutSchedule}
                          disabled={isUpdatingPayout}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select a schedule" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-1">
                          How often you want to receive your funds.
                        </p>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <Label htmlFor="minimum">Minimum Payout Amount</Label>
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground h-10">
                            $
                          </span>
                          <Input
                            id="minimum"
                            type="number"
                            value={minimumAmount}
                            onChange={(e) => setMinimumAmount(e.target.value)}
                            placeholder="0.00"
                            className="rounded-l-none"
                            disabled={isUpdatingPayout}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Minimum amount required for automatic payout (optional).
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleUpdatePayoutSchedule} disabled={isUpdatingPayout}>
                    {isUpdatingPayout ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Payout Settings'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
