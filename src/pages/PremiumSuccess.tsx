import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncPremiumCache } from '@/lib/billing';

const PremiumSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const orderId = searchParams.get('order_id');
  const sessionToken = searchParams.get('session_token');

  useEffect(() => {
    if (!orderId || !sessionToken) {
      setStatus('error');
      return;
    }

    const verifyOrder = async () => {
      try {
        const response = await fetch(`/api/verify-order?order_id=${encodeURIComponent(orderId)}&session_token=${encodeURIComponent(sessionToken)}`);
        const data = await response.json();

        if (data.success) {
          syncPremiumCache(true);
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verifyOrder();
  }, [orderId, sessionToken]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      {status === 'loading' && (
        <div className="space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Verifying your purchase...</h1>
          <p className="text-muted-foreground">Please wait while we confirm your order with Lemon Squeezy.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-6 max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">Premium Unlocked!</h1>
          <p className="text-muted-foreground">
            Thank you for upgrading! You now have lifetime access to all premium features, including 100+ languages, custom allergens, and widgets.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Home Screen
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6 max-w-md">
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-3xl font-bold text-destructive">Verification Failed</h1>
          <p className="text-muted-foreground">
            We couldn't verify your purchase. If you believe this is an error, please try restoring your purchase using your email address.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/premium-onboarding')} className="w-full">
              Try Again
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Go to Home Screen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumSuccess;