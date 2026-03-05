"use client";

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const SystemBarsConfig = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const setupBars = async () => {
        try {
          // @ts-ignore
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          
          await StatusBar.setStyle({ style: Style.Light });
          
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: '#f3f4f6' });
            
            try {
              // @ts-ignore
              const { NavigationBar } = await import('@capacitor-community/navigation-bar');
              await NavigationBar.setNavigationBarColor({
                color: '#f3f4f6',
                darkButtons: true,
              });
            } catch (navError) {
              console.warn('Navigation bar plugin not available:', navError);
            }
          }
        } catch (error) {
          console.error('Error configuring system bars:', error);
        }
      };

      setupBars();
    }
  }, []);

  return null;
};

export default SystemBarsConfig;