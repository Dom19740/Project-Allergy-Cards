"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Save, Share2, Download, Volume2, Languages } from 'lucide-react';
import EmergencyCrossIcon from '@/components/EmergencyCrossIcon';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';

interface UnderstandCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleAllergen = ALLERGEN_OPTIONS.find(a => a.id === 'peanut')!;

const iconRows = [
  { icon: Save, color: 'text-black', description: 'Save card to app' },
  { icon: Share2, color: 'text-green-600', description: 'Share card' },
  { icon: Download, color: 'text-blue-600', description: 'Download card to device' },
  { icon: Volume2, color: 'text-purple-600', description: 'Read out card' },
  { icon: Languages, color: 'text-indigo-600', description: 'Toggle Translation/English' },
];

const UnderstandCardDialog: React.FC<UnderstandCardDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[90%] sm:max-w-[425px] rounded-2xl fixed left-1/2 -translate-x-1/2 top-[calc(1rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300 max-h-[90vh] overflow-y-auto p-4 gap-2"
      >
        <DialogHeader className="flex flex-col items-center text-center space-y-0.5">
          <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-full mb-0.5">
            <HelpCircle className="h-4 w-4 text-red-600" />
          </div>
          <DialogTitle className="text-base font-bold">Understand Your Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <div className="flex items-center space-x-3 p-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex-shrink-0 w-14 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-normal uppercase whitespace-nowrap">
                {sampleAllergen.name}
              </span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              Tap to show allergen full screen
            </p>
          </div>

          <div className="flex items-center space-x-3 p-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex-shrink-0 w-14 flex items-center justify-center">
              <img src="/noentry.png" alt="No entry" className="w-6 h-6 object-contain" />
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              Tap to show image full screen
            </p>
          </div>

          {iconRows.map(({ icon: Icon, color, description }) => (
            <div
              key={description}
              className="flex items-center space-x-3 p-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex-shrink-0 w-14 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                {description}
              </p>
            </div>
          ))}

          <div className="flex items-center space-x-3 p-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex-shrink-0 w-14 flex items-center justify-center">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white border-2 border-black">
                <EmergencyCrossIcon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              Access emergency card
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="primary"
            className="w-full rounded-xl py-2.5 text-base"
          >
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnderstandCardDialog;
