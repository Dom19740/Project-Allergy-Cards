"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isPremiumUser, purchasePremium, restorePurchases, PREMIUM_PRODUCT_ID, LEMON_SQUEEZY_CHECKOUT_URL, refreshPremiumStatus } from '@/lib/billing';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';

interface BillingContextType {
  isPremium: boolean;
  isLoading: boolean;
  price: string;
  purchasePremium: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [price, setPrice] = useState<string>("$4.99"); // Fallback price

  useEffect(() => {
    const checkStatus = async () => {
      const status = await isPremiumUser();
      setIsPremium(status);
      setIsLoading(false);
    };

    checkStatus();

    // Function to update price from the store
    const updatePrice = () => {
      if (typeof window !== 'undefined' && (window as any).CdvPurchase) {
        const { store } = (window as any).CdvPurchase;
        const product = store.get(PREMIUM_PRODUCT_ID);
        if (product && product.getOffer()) {
          setPrice(product.getOffer().price);
        }
      }
    };

    // Listen for store updates to get the localized price
    if (typeof window !== 'undefined' && (window as any).CdvPurchase) {
      const { store } = (window as any).CdvPurchase;
      store.when().updated(updatePrice);
      updatePrice(); // Initial check
    }

    const handleStatusChange = async (e: any) => {
      if (typeof e.detail === 'boolean') {
        setIsPremium(e.detail);
        return;
      }

      const status = await refreshPremiumStatus();
      setIsPremium(status);
    };

    window.addEventListener('premium-status-changed', handleStatusChange);
    return () => window.removeEventListener('premium-status-changed', handleStatusChange);
  }, []);

  const handlePurchase = async () => {
    if (Capacitor.getPlatform() === 'web') {
      window.location.href = LEMON_SQUEEZY_CHECKOUT_URL;
      return;
    }

    try {
      await purchasePremium();
    } catch (error) {
      toast.error("Purchase failed. Please try again.");
      console.error(error);
    }
  };

  const handleRestore = async () => {
    if (Capacitor.getPlatform() === 'web') {
      // Handled via the email restore dialog in the UI
      return;
    }

    try {
      await restorePurchases();
      toast.success("Checking for previous purchases...");
    } catch (error) {
      toast.error("Restore failed.");
    }
  };

  return (
    <BillingContext.Provider value={{ 
      isPremium, 
      isLoading, 
      price,
      purchasePremium: handlePurchase, 
      restorePurchases: handleRestore 
    }}>
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};