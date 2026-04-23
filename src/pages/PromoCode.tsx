"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Ticket, CheckCircle2, AlertCircle } from "lucide-react";
import { Preferences } from '@capacitor/preferences';
import toast from "react-hot-toast";

const VALID_CODES = ["TRAVEL2025", "ALLERGYFREE", "PREMIUM100", "DYAD2024"];

const PromoCode = () => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  const handleVerify = async () => {
    const normalizedCode = code.trim().toUpperCase();
    
    if (VALID_CODES.includes(normalizedCode)) {
      setStatus('success');
      localStorage.setItem('isPremium', 'true');
      await Preferences.set({ key: 'isPremium', value: 'true' });
      
      toast.success("Premium Unlocked!", {
        icon: '🎉',
        style: { borderRadius: '1rem', background: '#333', color: '#fff' }
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setStatus('error');
      toast.error("Invalid Promo Code");
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 flex flex-col">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white pb-8 pt-10 text-center">
            <div className="mx-auto bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
              <Ticket className="w-8 h-8 text-amber-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Redeem Code</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your promo code to unlock Premium features
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Input
                placeholder="ENTER CODE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-xl font-black tracking-widest h-14 rounded-xl border-2 focus:border-zinc-900 uppercase"
                disabled={status === 'success'}
              />
            </div>

            <Button 
              onClick={handleVerify}
              disabled={!code || status === 'success'}
              className={`w-full h-14 rounded-xl text-lg font-bold transition-all duration-300 ${
                status === 'success' 
                  ? 'bg-green-600 hover:bg-green-600' 
                  : 'bg-zinc-900 hover:bg-zinc-800'
              }`}
            >
              {status === 'success' ? (
                <span className="flex items-center"><CheckCircle2 className="mr-2" /> Applied</span>
              ) : status === 'error' ? (
                <span className="flex items-center"><AlertCircle className="mr-2" /> Invalid</span>
              ) : (
                "Verify Code"
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Codes are case-insensitive.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromoCode;