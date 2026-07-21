"use client";

import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { getMobileOS, isIOSSafari, PLAY_STORE_URL } from '@/lib/platform';

const InstallChoiceStep = () => {
  const os = getMobileOS();
  const safari = isIOSSafari();
  const isNative = Capacitor.isNativePlatform();

  return (
    <div className="space-y-4 text-center text-gray-700 dark:text-gray-300 leading-relaxed">
      <div className="flex items-center justify-center gap-2">
        <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-full">
          <ShieldCheck className="h-5 w-5 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Keep Your Cards Safe</h2>
      </div>

      <p>
        To protect sensitive data, your cards are never uploaded or stored online - they stay only on this device.
      </p>

      {isNative ? (
        <p>You're using the installed app, so your cards are already stored safely on this device.</p>
      ) : os === 'android' ? (
        <div className="space-y-3">
          <p>Installing the app from Google Play keeps that storage safe even if you clear your browser data.</p>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
            <img
              src="/images/GetItOnGooglePlay_Badge_Web_color_English.svg"
              alt="Get it on Google Play"
              className="h-14 w-auto"
            />
          </a>
        </div>
      ) : os === 'ios' && safari ? (
        <div className="space-y-3">
          <p>Adding this app to your Home Screen keeps that storage safe even if you clear Safari's history.</p>
          <ol className="text-left text-sm space-y-1.5 max-w-xs mx-auto list-decimal list-inside bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
            <li>Tap the Share button in Safari</li>
            <li>Scroll down and tap 'Add to Home Screen'</li>
            <li>Tap 'Add' in the top right corner</li>
          </ol>
        </div>
      ) : os === 'ios' ? (
        <div className="flex items-start gap-2 text-left bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 max-w-xs mx-auto">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Only Safari supports adding this app to your Home Screen on iPhone - open this site in Safari to install it there.
          </p>
        </div>
      ) : (
        <p>Everything stays local to this browser - no account, no server, no upload. Backup your cards regularly to avoid losing them.</p>
      )}

      {!isNative && (
        os === null ? (
          <p className="text-sm text-gray-400">
            For safer storage, we recommend using Google Play on Android or Safari on iPhone instead.
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            You can also keep using it right in your browser - tap Continue.
          </p>
        )
      )}
    </div>
  );
};

export default InstallChoiceStep;
