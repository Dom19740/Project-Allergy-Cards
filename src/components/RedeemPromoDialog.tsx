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
import { toast } from "sonner";
import { Ticket } from "lucide-react";

interface RedeemPromoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RedeemPromoDialog: React.FC<RedeemPromoDialogProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      if (code.toUpperCase() === "FREEPREMIUM" || code.toUpperCase() === "DYAD") {
        toast.success("Promo code applied! Premium features unlocked.");
        onClose();
        // In a real app, we would update the user's billing status here
        window.location.reload(); 
      } else {
        toast.error("Invalid promo code. Please try again.");
      }
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] sm:max-w-[400px] rounded-2xl">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full mb-2">
            <Ticket className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-bold">Redeem Promo Code</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Enter your special access code below to unlock premium features.
          </p>
          <Input
            placeholder="Enter code (e.g. DYAD)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center uppercase font-mono text-lg h-12"
            onKeyPress={(e) => e.key === 'Enter' && handleRedeem()}
          />
        </div>
        <DialogFooter>
          <Button 
            onClick={handleRedeem}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-lg"
          >
            {isSubmitting ? "Verifying..." : "Redeem Code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemPromoDialog;