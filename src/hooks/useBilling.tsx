"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isPremiumUser, purchasePremium, restorePurchases } from '@/lib/billing';
import { toast } from 'sonner';

interface BillingContextType {
  isPremium: boolean;
  isLoading: boolean;
  purchasePremium: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <BillingContext.Provider 
      value={{ 
        isPremium, 
        isLoading, 
        purchasePremium: handlePurchase, 
        restorePurchases: handleRestore 
      }}
    >
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