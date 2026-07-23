"use client";

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload, ClipboardCopy, ClipboardPaste, Crown } from 'lucide-react';
import { toast } from 'sonner';
import {
  downloadBackup,
  copyBackupToClipboard,
  readBackupFileText,
  readClipboardText,
  parseBackupPayload,
  applyParsedBackup,
  backupRequiresPremium,
  stashPendingBackupRestore,
  ParsedBackup,
  BackupImportResult,
} from '@/lib/backup';
import { useBilling } from '@/hooks/useBilling';
import { PREMIUM_LIMITS } from '@/lib/premium-config';

interface BackupRestoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackupRestoreDialog: React.FC<BackupRestoreDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isPremium } = useBilling();
  const [isBusy, setIsBusy] = useState(false);
  const [gatedBackup, setGatedBackup] = useState<{ text: string; parsed: ParsedBackup } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSavedCards = isPremium ? PREMIUM_LIMITS.MAX_SAVED_CARDS : PREMIUM_LIMITS.FREE_MAX_SAVED_CARDS;

  const notifyRestoreResult = (result: BackupImportResult) => {
    const { importedCards, importedEmergency, importedImages, importedPresets } = result;
    const parts = [];
    if (importedCards > 0) parts.push(`${importedCards} card${importedCards === 1 ? '' : 's'}`);
    if (importedEmergency) parts.push('emergency card');
    if (importedImages > 0) parts.push(`${importedImages} custom allergen image${importedImages === 1 ? '' : 's'}`);
    if (importedPresets > 0) parts.push(`${importedPresets} custom alert${importedPresets === 1 ? '' : 's'}`);
    toast.success(`Restored ${parts.join(' and ')}.`);
  };

  // Parses (but doesn't yet write) a backup. A backup containing anything a
  // free account could never have created (multiple cards, a premium
  // language, custom allergens, custom alerts) can only have come from a
  // Premium account - so it can only be restored onto one. Block the import
  // entirely and require restoring Premium first, rather than silently
  // importing a stripped-down subset that isn't what the user actually had.
  const processBackupText = async (text: string) => {
    const parsed = parseBackupPayload(text);

    if (!isPremium && backupRequiresPremium(parsed)) {
      setGatedBackup({ text, parsed });
      return;
    }

    const result = await applyParsedBackup(parsed, maxSavedCards);
    notifyRestoreResult(result);
    onClose();
  };

  const handleDownload = async () => {
    setIsBusy(true);
    try {
      await downloadBackup(isPremium);
      onClose();
    } catch (error) {
      console.error('Backup download failed:', error);
      toast.error('Could not save your backup. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsBusy(true);
    try {
      await copyBackupToClipboard(isPremium);
      toast.success('Backup copied to clipboard.');
    } catch (error) {
      console.error('Backup copy failed:', error);
      toast.error('Could not copy your backup. Please try again.');
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
      const text = await readClipboardText();
      await processBackupText(text);
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
      const text = await readBackupFileText(file);
      await processBackupText(text);
    } catch (error: any) {
      toast.error(error?.message || 'Could not restore that backup file.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleGateRestorePurchase = async () => {
    if (!gatedBackup) return;
    await stashPendingBackupRestore(gatedBackup.text);
    setGatedBackup(null);
    onClose();
    navigate('/premium-onboarding');
  };

  return (
    <>
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
              <Download className="h-4 w-4 text-red-500" />
              Backup to file
            </Button>

            <Button
              onClick={handleImportClick}
              disabled={isBusy}
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-200 justify-start gap-3 px-4"
            >
              <Upload className="h-4 w-4 text-red-500" />
              Restore from file
            </Button>

            <Button
              onClick={handleCopyToClipboard}
              disabled={isBusy}
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-200 justify-start gap-3 px-4"
            >
              <ClipboardCopy className="h-4 w-4 text-red-500" />
              Copy to clipboard
            </Button>

            <Button
              onClick={handleRestoreFromClipboard}
              disabled={isBusy}
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-200 justify-start gap-3 px-4"
            >
              <ClipboardPaste className="h-4 w-4 text-red-500" />
              Paste from clipboard
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

      {/* Deliberately not user-dismissable via backdrop click, outside tap, or
          Escape - only the explicit Cancel/Restore Purchase buttons close it,
          so a stray tap can't silently discard a backup that requires this
          decision. */}
      <Dialog open={!!gatedBackup} onOpenChange={() => {}}>
        <DialogContent
          hideClose
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-5 fixed left-1/2 -translate-x-1/2 top-[calc(1rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300"
        >
          <DialogHeader className="mb-1">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600 shrink-0" />
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Restore Your Purchase First
              </DialogTitle>
            </div>
          </DialogHeader>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This backup includes Premium features - multiple cards, a premium language, custom allergens, or custom alerts - so it can only be restored on a Premium account. Restore your purchase first, then this backup will finish importing automatically.
          </p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleGateRestorePurchase}
              disabled={isBusy}
              variant="primary"
              className="w-full h-11 rounded-xl font-bold"
            >
              Restore Purchase
            </Button>
            <Button
              onClick={() => setGatedBackup(null)}
              disabled={isBusy}
              variant="outline"
              className="w-full h-11 rounded-xl border-gray-200 text-gray-600"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BackupRestoreDialog;
