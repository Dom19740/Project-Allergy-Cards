"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Share, Plus, Layout, MoreVertical, X } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { getMobileOS, isIOSSafari, isMobileWeb, isStandalone } from '@/lib/platform';

const getInstallSteps = (isSafari: boolean, os: 'ios' | 'android' | null) => {
  if (isSafari) {
    return [
      { icon: Share, text: "Tap the 'Share' button in Safari" },
      { icon: Plus, text: "Scroll down and tap 'Add to Home Screen'" },
      { icon: Layout, text: "Tap 'Add' in the top right corner" },
    ];
  }
  if (os === 'ios') {
    return [
      { icon: Share, text: "Tap the Share button in your browser" },
      { icon: Plus, text: "Look for 'Add to Home Screen' - if it's not there, switch to Safari and add it from there instead" },
    ];
  }
  return [
    { icon: MoreVertical, text: "Tap the menu button in your browser" },
    { icon: Plus, text: "Tap 'Add to Home screen' or 'Install app'" },
  ];
};

interface InstallBannerProps {
  visible: boolean;
}

const InstallBanner: React.FC<InstallBannerProps> = ({ visible }) => {
  const [dismissed, setDismissed] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const safari = isIOSSafari();
  const os = getMobileOS();

  useEffect(() => {
    const checkDismissed = async () => {
      if (!isMobileWeb() || isStandalone()) {
        setDismissed(true);
        return;
      }
      const wasDismissed = await storage.get<string>(STORAGE_KEYS.INSTALL_BANNER_DISMISSED);
      setDismissed(wasDismissed === 'true');
    };
    checkDismissed();
  }, []);

  const handleDismiss = async () => {
    setDismissed(true);
    await storage.set(STORAGE_KEYS.INSTALL_BANNER_DISMISSED, 'true');
  };

  if (!visible || dismissed) return null;

  const browserDataLabel = safari ? "Clearing Safari's history" : "Clearing your browser's data";

  return (
    <>
      <div className="w-full flex items-start gap-3 p-3.5 mb-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Protect your saved cards
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            {browserDataLabel} can erase your saved cards. Add this app to your Home Screen to keep them safe.
          </p>
          <button
            onClick={() => setShowInstructions(true)}
            className="text-xs font-bold text-amber-700 dark:text-amber-300 underline mt-1.5"
          >
            How do I do this?
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-amber-500 hover:text-amber-700"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-5">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Add to Home Screen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {getInstallSteps(safari, os).map((step, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="flex-shrink-0 w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Can't find this option? You can also back up your cards anytime with the Backup button below your card list.
          </p>

          <Button
            onClick={() => {
              setShowInstructions(false);
              handleDismiss();
            }}
            variant="primary"
            className="w-full h-12 mt-2 rounded-xl font-bold"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallBanner;
