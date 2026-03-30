"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Phone, AlertCircle, Check } from 'lucide-react';
import { getEmergencyNumbers, EmergencyNumberInfo } from '@/lib/emergencyNumbers';
import { cn } from '@/lib/utils';

interface EmergencyNumberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (number: string) => void;
  langCode: string;
}

const EmergencyNumberDialog: React.FC<EmergencyNumberDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  langCode
}) => {
  const [options, setOptions] = useState<EmergencyNumberInfo[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [customNumber, setCustomNumber] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const availableNumbers = getEmergencyNumbers(langCode);
      setOptions(availableNumbers);
      if (availableNumbers.length > 0) {
        setSelectedNumber(availableNumbers[0].number);
        setIsCustom(false);
      } else {
        setIsCustom(true);
      }
    }
  }, [isOpen, langCode]);

  const handleConfirm = () => {
    const finalNumber = isCustom ? customNumber : selectedNumber;
    if (finalNumber) {
      onConfirm(finalNumber);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-5 fixed left-1/2 -translate-x-1/2 top-[calc(1rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300"
      >
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Verify Emergency Number
          </DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Confirm the correct emergency services number for your current location.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-1 overflow-hidden px-1">
          <RadioGroup 
            value={isCustom ? 'custom' : selectedNumber} 
            onValueChange={(val) => {
              if (val === 'custom') {
                setIsCustom(true);
              } else {
                setIsCustom(false);
                setSelectedNumber(val);
              }
            }}
            className="gap-2"
          >
            {options.map((opt) => (
              <div key={opt.label} className="relative">
                <RadioGroupItem value={opt.number} id={opt.label} className="sr-only" />
                <Label 
                  htmlFor={opt.label}
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer",
                    !isCustom && selectedNumber === opt.number 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                  )}
                >
                  <span className="font-semibold text-sm">{opt.label}</span>
                  {!isCustom && selectedNumber === opt.number && <Check size={16} className="shrink-0 ml-2" />}
                </Label>
              </div>
            ))}
            
            <div className="flex flex-col gap-2">
              <div className="relative">
                <RadioGroupItem value="custom" id="custom" className="sr-only" />
                <Label 
                  htmlFor="custom"
                  className={cn(
                    "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer",
                    isCustom 
                      ? 'border-red-500 bg-red-50 text-red-700' 
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                  )}
                >
                  <span className="font-semibold text-sm">Other / Custom Number</span>
                  {isCustom && <Check size={16} className="shrink-0 ml-2" />}
                </Label>
              </div>
              
              {isCustom && (
                <div className="px-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Input 
                    placeholder="e.g. 911" 
                    value={customNumber}
                    onChange={(e) => setCustomNumber(e.target.value)}
                    type="tel"
                    className="w-full h-11 rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200 px-4"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="flex flex-row gap-2 mt-4 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isCustom ? !customNumber : !selectedNumber}
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all active:scale-95 font-medium gap-2"
          >
            <Phone className="h-4 w-4" />
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyNumberDialog;