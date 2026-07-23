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
import { HelpCircle, Save, Share2, Download, Volume2, Languages, Layers } from 'lucide-react';
import EmergencyCrossIcon from '@/components/EmergencyCrossIcon';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';

interface UnderstandCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleAllergen = ALLERGEN_OPTIONS.find(a => a.id === 'soy')!;

const iconRows = [
  { icon: Layers, color: 'text-orange-600', description: 'Switch between saved cards' },
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
        hideClose
        className="w-[90%] sm:max-w-[425px] rounded-2xl fixed left-1/2 -translate-x-1/2 top-[calc(1.5rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300 max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader className="flex flex-col items-center text-center">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full shrink-0">
              <HelpCircle className="h-5 w-5 text-red-600" />
            </div>
            Understand Your Card
          </DialogTitle>
        </DialogHeader>

        <div className="pt-6 pb-2 space-y-2.5">
          <div className="flex items-center space-x-3 p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex-shrink-0 w-16 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-normal uppercase whitespace-nowrap">
                {sampleAllergen.name}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Tap to show allergen full screen
            </p>
          </div>

          <div className="flex items-center space-x-3 p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex-shrink-0 w-16 flex items-center justify-center">
              <img src="/noentry.png" alt="No entry" className="w-8 h-8 object-contain" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Tap to show image full screen
            </p>
          </div>

          {iconRows.map(({ icon: Icon, color, description }) => (
            <div
              key={description}
              className="flex items-center space-x-3 p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {description}
              </p>
            </div>
          ))}

          <div className="flex items-center space-x-3 p-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex-shrink-0 w-16 flex items-center justify-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 border-red-600">
                <EmergencyCrossIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              Access emergency card
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="primary"
            className="w-full rounded-xl py-6 text-lg"
          >
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnderstandCardDialog;
