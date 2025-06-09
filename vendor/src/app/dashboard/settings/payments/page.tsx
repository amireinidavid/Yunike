'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import StripeConnectAccount from '../../../../components/stripe/ConnectAccount';
import useAuthStore from '../../../../store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Loader2, Save } from 'lucide-react';

const PaymentSettingsPage = () => {
  const { user, isLoading, error, updateStripePayoutSchedule } = useAuthStore();
  const [payoutSchedule, setPayoutSchedule] = useState('WEEKLY');
  const [minimumAmount, setMinimumAmount] = useState('50');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSavePayoutSettings = async () => {
    setSaveLoading(true);
    setSaveMessage('');
    
    try {
      await updateStripePayoutSchedule(payoutSchedule, parseFloat(minimumAmount));
      setSaveMessage('Payout settings updated successfully');
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message || 'Failed to update payout settings'}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment Settings</h1>
        <p className="text-gray-500">
          Manage your payment methods, payouts, and Stripe Connect account.
        </p>
      </div>

      <Tabs defaultValue="connect">
        <TabsList className="mb-4">
          <TabsTrigger value="connect">Stripe Connect</TabsTrigger>
          <TabsTrigger 
            value="payouts" 
            disabled={!user?.vendor?.stripeAccountId || !user?.vendor?.stripeOnboardingComplete}
          >
            Payout Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="connect" className="space-y-4">
          <StripeConnectAccount />
        </TabsContent>
        
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
              <CardDescription>
                Configure how and when you want to receive payments from sales.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payout Schedule</label>
                <Select
                  value={payoutSchedule}
                  onValueChange={setPayoutSchedule}
                  disabled={!user?.vendor?.stripeOnboardingComplete}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payout schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  How often you want to receive payouts to your bank account.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Payout Amount ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={minimumAmount}
                  onChange={(e) => setMinimumAmount(e.target.value)}
                  disabled={!user?.vendor?.stripeOnboardingComplete}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Payouts will only be processed when your balance reaches this amount.
                </p>
              </div>

              {saveMessage && (
                <div className={`p-3 rounded-md ${
                  saveMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {saveMessage}
                </div>
              )}

              <Button
                onClick={handleSavePayoutSettings}
                disabled={saveLoading || !user?.vendor?.stripeOnboardingComplete}
                className="flex items-center"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Payout Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Connection</CardTitle>
              <CardDescription>
                Details about your current Stripe Connect integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Connection Status:</div>
                  <div className={`${
                    user?.vendor?.stripeOnboardingComplete ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {user?.vendor?.stripeOnboardingComplete 
                      ? 'Active' 
                      : user?.vendor?.stripeAccountId 
                        ? 'Pending Setup Completion' 
                        : 'Not Connected'}
                  </div>
                  
                  {user?.vendor?.stripeAccountId && (
                    <>
                      <div className="font-medium">Account ID:</div>
                      <div>{user.vendor.stripeAccountId}</div>
                      
                      <div className="font-medium">Account Status:</div>
                      <div>{user.vendor.stripeAccountStatus || 'Unknown'}</div>
                      
                      <div className="font-medium">Charges Enabled:</div>
                      <div>{user.vendor.stripeOnboardingComplete ? 'Yes' : 'No'}</div>
                      
                      <div className="font-medium">Payouts Enabled:</div>
                      <div>{user.vendor.stripeOnboardingComplete ? 'Yes' : 'No'}</div>
                    </>
                  )}
                </div>
                
                {!user?.vendor?.stripeOnboardingComplete && user?.vendor?.stripeAccountId && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Resume Stripe Connect Setup
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSettingsPage; 