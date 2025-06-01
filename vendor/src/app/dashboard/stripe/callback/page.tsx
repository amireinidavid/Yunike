'use client';

import { useRouter } from 'next/navigation';
import StripeRedirectHandler from '../../../../components/stripe/StripeRedirectHandler';

const StripeCallbackPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <StripeRedirectHandler
        redirectPath="/dashboard/settings/payments"
      />
    </div>
  );
};

export default StripeCallbackPage; 