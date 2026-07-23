"use client";

import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, Clipboard } from 'lucide-react';
import { toast } from 'sonner';
import { downloadBackup, importBackup, importBackupFromClipboard } from '@/lib/backup';
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

  const handleDownload = async () => {
    setIsBusy(true);
    try {
      await downloadBackup();
    } catch (error) {
      console.error('Backup download failed:', error);
      toast.error('Could not save your backup. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFromClipboard = async () => {
    setIsBusy(true);
    try {
      const { importedCards, importedEmergency, importedImages } = await importBackupFromClipboard(maxSavedCards);
      const parts = [];
      if (importedCards > 0) parts.push(`${importedCards} card${importedCards === 1 ? '' : 's'}`);
      if (importedEmergency) parts.push('emergency card');
      if (importedImages > 0) parts.push(`${importedImages} custom allergen image${importedImages === 1 ? '' : 's'}`);
      toast.success(`Restored ${parts.join(' and ')}.`);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Could not restore from the clipboard.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsBusy(true);
    try {
      const { importedCards, importedEmergency, importedImages } = await importBackup(file, maxSavedCards);
      const parts = [];
      if (importedCards > 0) parts.push(`${importedCards} card${importedCards === 1 ? '' : 's'}`);
      if (importedEmergency) parts.push('emergency card');
      if (importedImages > 0) parts.push(`${importedImages} custom allergen image${importedImages === 1 ? '' : 's'}`);
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
          Your saved cards live only on this device. Download a backup file so you can restore them if you clear your browser data or switch devices.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownload}
            disabled={isBusy}
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 justify-start gap-3 px-4"
          >
            <Download className="h-4 w-4" />
            Download backup
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

          <Button
            onClick={handleRestoreFromClipboard}
            disabled={isBusy}
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 justify-start gap-3 px-4"
          >
            <Clipboard className="h-4 w-4" />
            Restore from clipboard
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
