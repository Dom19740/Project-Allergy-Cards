"use client";

import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { exportBackup, importBackup } from '@/lib/backup';
import { useBilling } from '@/hooks/useBilling';
import { PREMIUM_LIMITS } from '@/lib/premium-config';

interface BackupRestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackupRestoreDialog: React.FC<BackupRestoreDialogProps> = ({ isOpen, onClose }) => {
  const { isPremium } = useBilling();
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSavedCards = isPremium ? PREMIUM_LIMITS.MAX_SAVED_CARDS : PREMIUM_LIMITS.FREE_MAX_SAVED_CARDS;

  const handleExport = async () => {
    setIsBusy(true);
    try {
      await exportBackup();
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        toast.error('Could not export your cards. Please try again.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsBusy(true);
    try {
      const { importedCards, importedEmergency } = await importBackup(file, maxSavedCards);
      const parts = [];
      if (importedCards > 0) parts.push(`${importedCards} card${importedCards === 1 ? '' : 's'}`);
      if (importedEmergency) parts.push('emergency card');
      toast.success(`Restored ${parts.join(' and ')}.`);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Could not restore that backup file.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-5">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Backup & Restore
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Your saved cards live only on this device. Export a backup file so you can restore them if you clear your browser data or switch devices.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleExport}
            disabled={isBusy}
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 justify-start gap-3 px-4"
          >
            <Download className="h-4 w-4" />
            Export backup
          </Button>

          <Button
            onClick={handleImportClick}
            disabled={isBusy}
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 justify-start gap-3 px-4"
          >
            <Upload className="h-4 w-4" />
            Restore from backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackupRestoreDialog;
