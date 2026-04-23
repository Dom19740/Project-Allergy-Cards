"use client";

import { storage, STORAGE_KEYS } from './storage';

export const isPremiumUser = (): boolean => {
  const status = storage.get<boolean>(STORAGE_KEYS.IS_PREMIUM);
  return !!status;
};

export const initBilling = async () => {
  // Initialization logic if needed
  return true;
};