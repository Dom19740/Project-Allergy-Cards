"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';
import { toast } from 'sonner';

interface RestorePurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Web-only "restore by email" flow, shared between the Unlock Premium step
// and the Home screen menu - native restores go through useBilling's
// restorePurchases() (Play Store ownership check) instead of this dialog.
const RestorePurchaseDialog: React.FC<RestorePurchaseDialogProps> = ({ isOpen, onClose }) => {
  const [restoreEmail, setRestoreEmail] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const handleEmailRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreEmail) return;

    setIsRestoring(true);
    try {
      const response = await fetch('/api/restore-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restoreToken: restoreEmail }),
      });
      const data = await response.json();

      if (data.success) {
        await Preferences.set({ key: 'isPremium', value: 'true' });
        sessionStorage.setItem('isPremium', 'true');
        window.dispatchEvent(new CustomEvent('premium-status-changed', { detail: true }));
        toast.success("Premium restored successfully!");
        onClose();
      } else {
        toast.error("No active premium purchase found for this email.");
      }
    } catch (error) {
      toast.error("Failed to restore purchase. Please try again.");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-5 fixed left-1/2 -translate-x-1/2 top-[calc(1rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Restore Purchase</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleEmailRestore}>
          <div className="flex flex-col gap-1.5 py-1 px-1">
            <Label htmlFor="restore-email" className="text-[11px] font-bold text-gray-400 px-1 uppercase tracking-wider">
              Email Used At Checkout
            </Label>
            <Input
              id="restore-email"
              type="email"
              placeholder="your@email.com"
              value={restoreEmail}
              onChange={(e) => setRestoreEmail(e.target.value)}
              disabled={isRestoring}
              required
              autoFocus
              className="w-full h-11 rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200 px-4 disabled:opacity-50"
            />
          </div>

          <DialogFooter className="flex flex-row gap-2 mt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isRestoring}
              className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRestoring}
              variant="primary"
              className="flex-1 h-11 rounded-xl shadow-sm transition-all active:scale-95 font-medium disabled:opacity-50"
            >
              {isRestoring ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Restore"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RestorePurchaseDialog;
