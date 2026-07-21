"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Clipboard, Share, Smartphone, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { getMobileOS, isIOSSafari, isMobileWeb, isStandalone, PLAY_STORE_URL } from '@/lib/platform';
import { copyBackupToClipboard } from '@/lib/backup';

interface ProtectCardsDialogProps {
  visible: boolean;
}

const ProtectCardsDialog: React.FC<ProtectCardsDialogProps> = ({ visible }) => {
  const [dismissed, setDismissed] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const os = getMobileOS();
  const safari = isIOSSafari();

  useEffect(() => {
    const checkDismissed = async () => {
      if (!isMobileWeb() || isStandalone()) {
        setDismissed(true);
        return;
      }
      // storage.get() JSON-parses the stored value, so a value written as the
      // string 'true' round-trips back as the boolean true - check both.
      const wasDismissed = await storage.get<string | boolean>(STORAGE_KEYS.INSTALL_BANNER_DISMISSED);
      setDismissed(wasDismissed === 'true' || wasDismissed === true);
    };
    checkDismissed();
  }, []);

  const handleDismiss = async () => {
    setDismissed(true);
    await storage.set(STORAGE_KEYS.INSTALL_BANNER_DISMISSED, 'true');
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      await copyBackupToClipboard();
      toast.success('Backup copied - you can paste it after installing.');
    } catch (error) {
      console.error('Backup copy failed:', error);
      toast.error('Could not copy your backup. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  if (!visible || dismissed) return null;

  return (
    <Dialog open onOpenChange={(next) => { if (!next) handleDismiss(); }}>
      <DialogContent className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-5">
        <DialogHeader className="mb-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Protect your saved cards
            </DialogTitle>
          </div>
        </DialogHeader>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {os === 'android'
            ? "Cards saved in your browser can be lost if you clear browsing data. The Google Play app keeps its own separate, protected copy - but it starts empty, so back up first and restore inside the app."
            : "Cards saved in your browser can be lost if you clear browsing data. Adding this app to your Home Screen keeps a separate, protected copy - but it starts empty, so back up first and restore inside the installed app."}
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex-shrink-0 w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Clipboard className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1.5">
                1. Back up your cards now
              </p>
              <Button
                onClick={handleBackupNow}
                disabled={isBackingUp}
                variant="outline"
                className="h-9 px-4 rounded-lg text-sm"
              >
                Copy backup
              </Button>
            </div>
          </div>

          {os === 'android' ? (
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex-shrink-0 w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1.5">
                  2. Get the app from Google Play
                </p>
                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
                  <img
                    src="/images/GetItOnGooglePlay_Badge_Web_color_English.svg"
                    alt="Get it on Google Play"
                    className="h-10 w-auto"
                  />
                </a>
              </div>
            </div>
          ) : safari ? (
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex-shrink-0 w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Share className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  2. Add to Home Screen
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Tap Share, scroll down to 'Add to Home Screen', then tap 'Add'
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex-shrink-0 w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  2. Switch to Safari
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Only Safari supports adding this app to your Home Screen on iPhone - open this site in Safari, then use its Share button to add it
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex-shrink-0 w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                3. Restore your backup
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Open the app, tap Backup, then Restore from clipboard (or Restore from backup if that doesn't work)
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleDismiss}
          variant="primary"
          className="w-full h-12 mt-4 rounded-xl font-bold"
        >
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ProtectCardsDialog;
