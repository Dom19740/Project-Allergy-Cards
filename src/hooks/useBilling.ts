"use client";

import { useState, useEffect } from 'react';
import { isPremiumUser, purchasePremium, restorePurchases } from '@/lib/billing';
import { toast } from 'sonner';

export const useBilling = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await isPremiumUser();
      setIsPremium(status);
      setIsLoading(false);
    };

    checkStatus();

    const handleStatusChange = (e: any) => {
      setIsPremium(e.detail);
    };

    window.addEventListener('premium-status-changed', handleStatusChange);
    return () => window.removeEventListener('premium-status-changed', handleStatusChange);
  }, []);

  const handlePurchase = async () => {
    try {
      await purchasePremium();
    } catch (error) {
      toast.error("Purchase failed. Please try again.");
      console.error(error);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      toast.success("Checking for previous purchases...");
    } catch (error) {
      toast.error("Restore failed.");
    }
  };

  return {
    isPremium,
    isLoading,
    purchasePremium: handlePurchase,
    restorePurchases: handleRestore
  };
};