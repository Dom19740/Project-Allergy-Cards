"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import SafetyDisclaimer from '@/components/SafetyDisclaimer';

interface DisclaimerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerDialog: React.FC<DisclaimerDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);

  const handleIconClick = () => {
    setTapCount((prev) => {
      const nextTapCount = prev + 1;

      if (nextTapCount === 3) {
        localStorage.removeItem('hasSeenOnboarding');
        sessionStorage.removeItem('isPremium');
        onClose();
        navigate('/premium-onboarding');
      }

      return nextTapCount;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[90%] sm:max-w-[425px] rounded-2xl fixed left-1/2 -translate-x-1/2 top-[calc(1.5rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300"
      >
        <DialogHeader className="flex flex-col items-center text-center">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div
              className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full shrink-0 cursor-default active:opacity-70 transition-opacity"
              onClick={handleIconClick}
            >
              <Info className="h-5 w-5 text-red-600" />
            </div>
            Safety Disclaimer
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center space-y-4">
          <SafetyDisclaimer />

          {tapCount > 0 && tapCount < 3 && (
            <p className="text-xs text-gray-400">
              Tap the info icon 3 times to restart onboarding.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={onClose}
            variant="primary"
            className="w-full rounded-xl py-6 text-lg"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisclaimerDialog;