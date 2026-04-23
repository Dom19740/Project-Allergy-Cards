"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { toast } from 'sonner';

interface BillingContextType {
  isPremium: boolean;
  isLoading: boolean;
  purchasePremium: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  price: string;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [price] = useState<string>("$4.99");

  useEffect(() => {
    const status = storage.get(STORAGE_KEYS.IS_PREMIUM);
    setIsPremium(!!status);
    setIsLoading(false);
  }, []);

  const purchasePremium = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      storage.set(STORAGE_KEYS.IS_PREMIUM, true);
      setIsPremium(true);
      toast.success("Premium unlocked!");
    } catch (error) {
      toast.error("Purchase failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const status = storage.get(STORAGE_KEYS.IS_PREMIUM);
      if (status) {
        setIsPremium(true);
        toast.success("Purchases restored.");
      } else {
        toast.info("No purchases found.");
      }
    } catch (error) {
      toast.error("Restore failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BillingContext.Provider value={{ isPremium, isLoading, purchasePremium, restorePurchases, price }}>
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