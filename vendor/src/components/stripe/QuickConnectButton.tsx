'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Sparkles } from 'lucide-react';
import useStripeStore from '@/store/useStripeStore';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickConnectButtonProps {
  className?: string;
}

export default function QuickConnectButton({ className }: QuickConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const { createConnectAccount, getAccountStatus, accountStatus } = useStripeStore();
  
  const isTestMode = process.env.NODE_ENV === 'development';
  
  const handleQuickSetup = async () => {
    try {
      setLoading(true);
      
      // Create a Stripe Connect account
      const result = await createConnectAccount();
      
      if (result?.accountId) {
        if (result.accountLinkUrl) {
          // Redirect to Stripe's onboarding page
          window.location.href = result.accountLinkUrl;
        } else {
          // If there's no URL (rare), just refresh the status
          await getAccountStatus();
          alert('Test Stripe Connect account created! You can now receive test payments.');
        }
      }
    } catch (error) {
      console.error('Error setting up test account:', error);
      alert('Failed to create test account. See console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isTestMode || accountStatus.detailsSubmitted) {
    return null;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700", className)}
            onClick={handleQuickSetup}
            disabled={loading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Setting up...' : 'Quick Setup (Test Mode)'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-start gap-2 max-w-xs">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs">
              This creates a test Stripe Connect account for development purposes.
              Only visible in development mode.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 