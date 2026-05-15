"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Preferences } from '@capacitor/preferences';
import { toast } from "sonner";

interface PromoCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PromoCodeDialog: React.FC<PromoCodeDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState("");

  const handleRedeem = async () => {
    const normalizedCode = code.trim().toUpperCase();
    
    if (normalizedCode === 'SAAFREE') {
      localStorage.setItem('isPremium', 'true');
      await Preferences.set({ key: 'isPremium', value: 'true' });
      
      toast.success("Premium Unlocked!", {
        icon: '🎉',
      });
      
      onSuccess();
      onClose();
      window.location.reload();
    } else if (normalizedCode === 'RESET') {
      localStorage.setItem('isPremium', 'false');
      await Preferences.set({ key: 'isPremium', value: 'false' });
      
      toast.success("Premium Revoked", {
        icon: '🔄',
      });
      
      onSuccess();
      onClose();
      window.location.reload();
    } else {
      toast.error("Invalid promo code");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-6 fixed left-1/2 -translate-x-1/2 top-[calc(2rem+env(safe-area-inset-top))] translate-y-0 animate-in fade-in slide-in-from-top-8 duration-300"
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold">Enter Promo Code</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            If you have a special access code, enter it below.
          </p>
        </DialogHeader>
        
        <div className="py-6">
          <Input
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="uppercase font-bold tracking-widest text-center h-14 text-lg rounded-xl border-gray-200 focus:ring-red-500 focus:border-gray-200"
            autoFocus
          />
        </div>
        
        <div className="w-full flex justify-between items-center mt-2 gap-4 shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full h-12 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRedeem}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12 font-bold"
          >
            Redeem Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeDialog;