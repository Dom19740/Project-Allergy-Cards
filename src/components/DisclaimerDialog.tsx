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
import { AlertTriangle } from "lucide-react";

interface DisclaimerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerDialog: React.FC<DisclaimerDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mb-2">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-xl font-bold">Safety Disclaimer</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center space-y-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            This app provides translated allergy alerts for convenience. While we aim for accuracy, translations and emergency numbers may not always be correct.
          </p>
          <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
            Always verify important information locally when possible. If in doubt, do not eat.
          </p>
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