"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SaveAlertPresetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const SaveAlertPresetDialog: React.FC<SaveAlertPresetDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleClose = () => {
    setName('');
    onClose();
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-5 fixed left-1/2 -translate-x-1/2 top-[calc(1rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Name This Alert
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 py-1 px-1">
          <Label htmlFor="preset-name" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Alert Name
          </Label>
          <Input
            id="preset-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Me, My Kid"
            autoFocus
            className="w-full h-11 rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200 px-4"
          />
        </div>

        <DialogFooter className="flex flex-row gap-2 mt-4 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            variant="primary"
            className="flex-1 h-11 rounded-xl shadow-sm transition-all active:scale-95 font-medium disabled:opacity-50"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveAlertPresetDialog;
