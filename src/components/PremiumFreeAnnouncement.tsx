"use client";

import { useEffect, useState } from 'react';
import { Crown, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const PremiumFreeAnnouncement = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAnnouncement = async () => {
      const hasSeenAnnouncement = await storage.get<boolean>(
        STORAGE_KEYS.PREMIUM_FREE_ANNOUNCEMENT_SEEN,
      );

      if (!hasSeenAnnouncement && isMounted) {
        await storage.set(STORAGE_KEYS.PREMIUM_FREE_ANNOUNCEMENT_SEEN, true);
        setIsOpen(true);
      }
    };

    void checkAnnouncement();

    return () => {
      isMounted = false;
    };
  }, []);

  const closeAnnouncement = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAnnouncement()}>
      <DialogContent className="w-[90%] max-w-[420px] rounded-2xl border-gray-200 dark:border-gray-700 p-5 shadow-2xl">
        <DialogHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Crown className="h-7 w-7 fill-amber-500 text-amber-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Premium is now completely free
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            Every Premium feature is now available to you at no cost.
          </p>
          <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-left text-sm dark:bg-gray-800/70">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              More saved cards
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              All languages and features
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              No subscription or payment required
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="primary" className="w-full rounded-xl py-6 text-lg" onClick={closeAnnouncement}>
            Start using Premium
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumFreeAnnouncement;
