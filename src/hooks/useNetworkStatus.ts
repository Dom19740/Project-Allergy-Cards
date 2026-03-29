"use client";

import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initial check
    const checkStatus = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
    };

    checkStatus();

    // Listen for changes
    const handler = Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
    });

    return () => {
      handler.then(h => h.remove());
    };
  }, []);

  return isOnline;
};