"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Phone, AlertCircle } from 'lucide-react';
import { getEmergencyNumbers, EmergencyNumberInfo } from '@/lib/emergencyNumbers';

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
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Verify Emergency Number
          </DialogTitle>
          <DialogDescription>
            Please confirm the correct emergency services number for your current location.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
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
            className="space-y-3"
          >
            {options.map((opt) => (
              <div key={opt.label} className="flex items-center space-x-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={opt.number} id={opt.label} />
                <Label htmlFor={opt.label} className="flex-1 font-medium cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
            
            <div className="flex flex-col space-y-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-medium cursor-pointer">Other / Custom Number</Label>
              </div>
              {isCustom && (
                <div className="pl-7">
                  <Input 
                    placeholder="Enter emergency number" 
                    value={customNumber}
                    onChange={(e) => setCustomNumber(e.target.value)}
                    type="tel"
                    className="rounded-lg"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isCustom ? !customNumber : !selectedNumber}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
          >
            <Phone className="h-4 w-4" />
            Generate Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyNumberDialog;