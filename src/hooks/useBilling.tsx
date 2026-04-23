"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BillingContextType {
  isPremium: boolean;
  isLoading: boolean;
  purchasePremium: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = () => {
      const saved = localStorage.getItem('is_premium');
      setIsPremium(saved === 'true');
      setIsLoading(false);
    };
    checkStatus();
  }, []);

  const purchasePremium = async () => {
    setIsPremium(true);
    localStorage.setItem('is_premium', 'true');
    window.dispatchEvent(new Event('storage-update'));
  };

  const restorePurchases = async () => {
    const saved = localStorage.getItem('is_premium');
    setIsPremium(saved === 'true');
  };

  return (
    <BillingContext.Provider value={{ isPremium, isLoading, purchasePremium, restorePurchases }}>
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