"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle2, ArrowLeft, RefreshCw, Globe, Shield, Zap, Loader2 } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { toast } from 'sonner';

const UnlockPremium = () => {
  const navigate = useNavigate();
  const { isPremium, purchasePremium, restorePurchases } = useBilling();
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const handleEmailRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreEmail) return;
    
    setIsRestoring(true);
    try {
      const response = await fetch('/api/restore-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restoreToken: restoreEmail }),
      });
      const data = await response.json();
      
      if (data.success) {
        await Preferences.set({ key: 'isPremium', value: 'true' });
        sessionStorage.setItem('isPremium', 'true');
        window.dispatchEvent(new CustomEvent('premium-status-changed', { detail: true }));
        toast.success("Premium restored successfully!");
        setIsRestoreOpen(false);
      } else {

        toast.error("No active premium purchase found for this email.");
      }
    } catch (error) {
      toast.error("Failed to restore purchase. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  const features = [
    {
      icon: <Globe className="h-5 w-5 text-amber-500" />,
      title: "Unlimited Languages",
      description: "Translate your allergy cards into over 20 languages for safe travel."
    },
    {
      icon: <Shield className="h-5 w-5 text-amber-500" />,
      title: "Emergency Cards",
      description: "Create specialized cards for medical emergencies and first responders."
    },
    {
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      title: "Instant Access",
      description: "One-time purchase for lifetime access to all current and future features."
    }
  ];

  if (isPremium) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-amber-100 dark:bg-amber-900/40 p-4 rounded-full mb-6">
          <Crown className="h-12 w-12 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Premium Unlocked</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xs">
          Thank you for supporting us! You now have full access to all features.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="w-full max-w-xs bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl py-6 text-lg font-bold"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <div className="p-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pb-12">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 rounded-3xl flex items-center justify-center mb-6 rotate-3">
          <Crown className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white text-center mb-2">
          Go Premium
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-10 max-w-xs">
          Unlock the full potential of your allergy safety companion.
        </p>

        <div className="w-full max-w-sm space-y-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-xs mt-auto space-y-4">
          <Button
            onClick={purchasePremium}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-7 text-xl font-black shadow-xl shadow-amber-200 dark:shadow-none transition-transform active:scale-95 flex items-center justify-center gap-3"
          >
            <Crown className="h-6 w-6" />
            Unlock Now
          </Button>
          
          {Capacitor.getPlatform() === 'web' ? (
            <button
              onClick={() => setIsRestoreOpen(true)}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:underline flex items-center justify-center gap-2 py-2"
            >
              <RefreshCw className="h-4 w-4" />
              Restore Web Purchase
            </button>
          ) : (
            <button
              onClick={restorePurchases}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:underline flex items-center justify-center gap-2 py-2"
            >
              <RefreshCw className="h-4 w-4" />
              Restore Purchases
            </button>
          )}
        </div>
      </div>

      {isRestoreOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Restore Purchase</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter the email address you used during checkout to restore your premium status.
            </p>
            <form onSubmit={handleEmailRestore} className="space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={restoreEmail}
                onChange={(e) => setRestoreEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent text-sm text-gray-900 dark:text-white"
                required
                disabled={isRestoring}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRestoreOpen(false)}
                  className="flex-1"
                  disabled={isRestoring}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={isRestoring}
                >
                  {isRestoring ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Restore"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnlockPremium;