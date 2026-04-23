"use client";

import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { toast } from 'sonner';

export const useBilling = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [price, setPrice] = useState<string>("$4.99"); // Default price

  useEffect(() => {
    const checkPremiumStatus = () => {
      const status = storage.get(STORAGE_KEYS.IS_PREMIUM);
      setIsPremium(!!status);
      setIsLoading(false);
    };

    checkPremiumStatus();
    
    // In a real app, you would fetch the localized price from the App Store / Play Store here
    // For now, we'll stick with the default or fetch from a config
  }, []);

  const purchasePremium = async () => {
    setIsLoading(true);
    try {
      // Simulate a purchase process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      storage.set(STORAGE_KEYS.IS_PREMIUM, true);
      setIsPremium(true);
      toast.success("Premium unlocked! Thank you for your support.");
    } catch (error) {
      toast.error("Purchase failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    setIsLoading(true);
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 1000));
      const status = storage.get(STORAGE_KEYS.IS_PREMIUM);
      if (status) {
        setIsPremium(true);
        toast.success("Purchases restored successfully.");
      } else {
        toast.info("No previous purchases found.");
      }
    } catch (error) {
      toast.error("Failed to restore purchases.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isPremium,
    isLoading,
    purchasePremium,
    restorePurchases,
    price
  };
};