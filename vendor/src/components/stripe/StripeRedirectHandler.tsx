'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '../../store/useAuthStore';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface StripeRedirectHandlerProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectPath?: string;
}

const StripeRedirectHandler = ({ 
  onSuccess, 
  onError,
  redirectPath = '/dashboard' 
}: StripeRedirectHandlerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleStripeRedirect, getStripeAccountStatus } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing your Stripe Connect account...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get setup_mode from URL parameters
        const setupMode = searchParams.get('setup_mode');
        
        if (setupMode === 'complete') {
          // Successfully completed onboarding
          await handleStripeRedirect('success');
          await getStripeAccountStatus();
          setStatus('success');
          setMessage('Your Stripe Connect account has been successfully set up!');
          
          if (onSuccess) {
            onSuccess();
          } else {
            // Redirect after a short delay to show the status message
            setTimeout(() => {
              router.push(redirectPath);
            }, 2000);
          }
        } else if (setupMode === 'canceled') {
          // User canceled the onboarding
          await handleStripeRedirect('cancel');
          setStatus('error');
          setMessage('Stripe Connect onboarding was canceled. You can resume setup later.');
          
          if (onError) {
            onError('Stripe account setup was canceled');
          }
        } else {
          setStatus('error');
          setMessage('Invalid callback parameters.');
          
          if (onError) {
            onError('Invalid callback parameters');
          }
        }
      } catch (error: any) {
        console.error('Error processing Stripe callback:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred while processing your Stripe Connect account.');
        
        if (onError) {
          onError(error.message || 'An error occurred');
        }
      }
    };

    if (searchParams.has('setup_mode')) {
      processCallback();
    }
  }, [searchParams, handleStripeRedirect, getStripeAccountStatus, router, onSuccess, onError, redirectPath]);

  if (!searchParams.has('setup_mode')) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          )}
          
          {status === 'success' && (
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          )}
          
          {status === 'error' && (
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          )}
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Stripe Connect</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {status === 'error' && (
            <button 
              onClick={() => router.push('/dashboard/settings/payments')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Go to Payment Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeRedirectHandler; 