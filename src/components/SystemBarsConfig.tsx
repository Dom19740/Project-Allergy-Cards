"use client";

import { useEffect } from 'react';
// @ts-ignore
import { StatusBar, Style } from '@capacitor/status-bar';
// @ts-ignore
import { NavigationBar } from '@capgo/capacitor-navigationbar';
import { Capacitor } from '@capacitor/core';

const SystemBarsConfig = () => {
  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      const setupBars = async () => {
        try {
          // Set Status Bar: Light background with Dark (Black) icons
          await StatusBar.setStyle({ style: Style.Light });
          
          // On Android, we can also set the background color to match the app's header
          if (Capacitor.getPlatform() === 'android') {
            // Using a light gray to match the 'bg-gray-100' used in the FixedHeader
            await StatusBar.setBackgroundColor({ color: '#f3f4f6' });
            
            // Set Navigation Bar (Android bottom bar)
            // We set the background to light and the buttons/items to dark (black)
            await NavigationBar.setNavigationBarColor({
              color: '#f3f4f6',
              darkButtons: true, // This makes the icons black
            });
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