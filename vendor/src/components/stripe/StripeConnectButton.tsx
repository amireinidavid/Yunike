'use client';

import { useState } from 'react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import useStripeStore from '@/store/useStripeStore';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';

interface StripeConnectButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  vendorId?: string;
  onSuccess?: () => void;
  showStatus?: boolean;
  variant?: VariantProps<typeof Button>['variant'];
  size?: VariantProps<typeof Button>['size'];
}

export default function StripeConnectButton({
  vendorId,
  onSuccess,
  showStatus = true,
  className,
  children,
  variant,
  size,
  ...props
}: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const { createConnectAccount, getOnboardingLink, accountStatus } = useStripeStore();
  
  const isConnected = accountStatus.stripeAccountId && accountStatus.detailsSubmitted;
  
  const handleClick = async () => {
    try {
      setLoading(true);
      
      if (!accountStatus.stripeAccountId) {
        // Create a new account
        const result = await createConnectAccount();
        if (result?.accountLinkUrl) {
          window.location.href = result.accountLinkUrl;
        }
      } else if (!accountStatus.detailsSubmitted) {
        // Continue with existing account setup
        const url = await getOnboardingLink();
        if (url) {
          window.location.href = url;
        }
      } else if (onSuccess) {
        // Already connected, call success callback
        onSuccess();
      }
    } catch (error) {
      console.error('Error with Stripe Connect:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col">
      <Button
        variant={isConnected ? "outline" : "default"}
        className={cn("flex items-center gap-2", className)}
        onClick={handleClick}
        disabled={!!(loading || (isConnected && !onSuccess))}
        {...props}
      >
        {loading ? (
          "Processing..."
        ) : isConnected ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500" />
            {children || "Connected with Stripe"}
          </>
        ) : (
          <>
            {children || "Connect with Stripe"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>
      
      {showStatus && accountStatus.stripeAccountId && !accountStatus.detailsSubmitted && (
        <p className="text-xs text-amber-600 mt-1">
          Your Stripe account setup is incomplete
        </p>
      )}
    </div>
  );
} 