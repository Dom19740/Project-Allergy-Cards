"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Preferences } from '@capacitor/preferences';
import { toast } from "react-hot-toast";

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
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Enter Promo Code</DialogTitle>
          <p className="text-sm text-muted-foreground">
            If you have a special access code, enter it below.
          </p>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="uppercase font-bold tracking-widest text-center h-12"
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleRedeem}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12"
          >
            Redeem Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromoCodeDialog;