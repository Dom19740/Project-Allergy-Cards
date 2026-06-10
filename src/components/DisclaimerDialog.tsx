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
import { Info, Bug } from "lucide-react";
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { Capacitor } from '@capacitor/core';

interface DisclaimerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerDialog: React.FC<DisclaimerDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState(0);

  const handleIconClick = () => {
    setTapCount(prev => prev + 1);
    if (tapCount >= 5) {
      // Secret navigation to premium if tapped many times
      onClose();
      navigate('/premium-onboarding');
    }
  };

  const handleTestCrash = async () => {
    if (Capacitor.isNativePlatform()) {
      // This will crash the app immediately on a real device
      await FirebaseCrashlytics.crash({ message: "Test Crash from Simple Allergy Alert" });
    } else {
      alert("Crash testing only works on a real Android/iOS device!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[90%] sm:max-w-[425px] rounded-2xl fixed left-1/2 -translate-x-1/2 top-[calc(1.5rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300"
      >
        <DialogHeader className="flex flex-col items-center text-center">
          <div 
            className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full mb-2 cursor-default active:opacity-70 transition-opacity"
            onClick={handleIconClick}
          >
            <Info className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold">Safety Disclaimer</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center space-y-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            This app provides translated allergy alerts for convenience. While we aim for accuracy, translations and emergency numbers may not always be correct.
          </p>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>Always verify important information locally when possible.</p>
            <p className="mt-2 font-bold text-red-600 dark:text-red-500">
              If in doubt, do not eat.
            </p>
          </div>

          {/* Hidden Debug Section */}
          {tapCount >= 3 && (
            <div className="pt-4 border-t border-gray-100 mt-4 animate-in fade-in zoom-in duration-300">
              <Button 
                variant="outline" 
                onClick={handleTestCrash}
                className="w-full border-dashed border-red-300 text-red-400 text-xs flex items-center justify-center gap-2"
              >
                <Bug size={14} />
                Force Test Crash (Native Only)
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-6 text-lg"
          >
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisclaimerDialog;