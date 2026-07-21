"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Capacitor } from '@capacitor/core';
import { syncPremiumCache } from '@/lib/billing';

interface PromoCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PromoCodeDialog: React.FC<PromoCodeDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState("");

  // Dev-only local reset, not a real promo code - never sent to the server.
  const RESET_CODE = 'RESET';

  // Native's WebView origin (https://localhost under Capacitor's default
  // config) is never the app's real domain, so a relative fetch would hit
  // the local bundle's own origin instead of the deployed API.
  const apiBase = Capacitor.getPlatform() === 'web' ? '' : 'https://app.simpleallergyalert.com';

  const handleRedeem = async () => {
    const normalizedCode = code.trim().toUpperCase();

    try {
      if (normalizedCode === RESET_CODE) {
        syncPremiumCache(false);
        toast.success("Premium Locked", { icon: '🔒' });
        onSuccess();
        onClose();
        return;
      }

      const response = await fetch(`${apiBase}/api/redeem-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalizedCode }),
      });

      if (!response.ok) {
        throw new Error('Invalid promo code');
      }

      syncPremiumCache(true);

      try {
        await import('@capacitor-firebase/analytics').then(({ FirebaseAnalytics }) =>
          FirebaseAnalytics.logEvent({
            name: 'promo_code_redeemed',
            params: {
              code: normalizedCode,
              platform: Capacitor.getPlatform(),
            },
          })
        );
      } catch {
      }

      toast.success("Premium Unlocked!", { icon: '🎉' });

      onSuccess();
      onClose();
    } catch {
      toast.error("Invalid promo code");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRedeem();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-6 fixed left-1/2 -translate-x-1/2 top-[calc(2rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300"
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold">Enter Promo Code</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            If you have a special access code, enter it below.
          </p>
        </DialogHeader>
        
        <div className="py-6">
          <Input
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="uppercase font-bold tracking-widest text-center h-14 text-lg rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200"
            autoFocus
          />
        </div>
        
        <div className="w-full flex justify-between items-center mt-2 gap-4 shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRedeem}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12 font-bold"
          >
            Redeem Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeDialog;