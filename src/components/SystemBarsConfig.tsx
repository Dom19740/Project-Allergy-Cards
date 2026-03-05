"use client";

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const SystemBarsConfig = () => {
  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      const setupBars = async () => {
        try {
          // Dynamically import to prevent crashes if installation failed
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          
          // Set Status Bar: Light background with Dark (Black) icons
          await StatusBar.setStyle({ style: Style.Light });
          
          // On Android, we can also set the background color to match the app's header
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: '#f3f4f6' });
            
            try {
              const { NavigationBar } = await import('@capacitor-community/navigation-bar');
              // Set Navigation Bar (Android bottom bar)
              await NavigationBar.setNavigationBarColor({
                color: '#f3f4f6',
                darkButtons: true, // This makes the icons black
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