"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SelectAlertPage = () => {
  const navigate = useNavigate();
  const [iAmAllergicTo, setIAmAllergicTo] = useState("I can not eat:");
  const [theyMakeMeSick, setTheyMakeMeSick] = useState("They make me very sick and I could die");

  useEffect(() => {
    const savedAlert = localStorage.getItem('customAlertMessages');
    if (savedAlert) {
      try {
        const parsed = JSON.parse(savedAlert);
        if (parsed.iAmAllergicTo) setIAmAllergicTo(parsed.iAmAllergicTo);
        if (parsed.theyMakeMeSick) setTheyMakeMeSick(parsed.theyMakeMeSick);
      } catch (e) {
        console.error("Failed to parse custom alert messages", e);
      }
    }
  }, []);

  const handleNext = () => {
    localStorage.setItem('customAlertMessages', JSON.stringify({
      iAmAllergicTo,
      theyMakeMeSick
    }));
    navigate('/select-language');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/select-allergens')}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Customise Alert</h1>
      </div>

      <div className="space-y-8 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="allergic-to" className="text-sm font-medium text-gray-500">
            Primary Warning
          </Label>
          <Input
            id="allergic-to"
            value={iAmAllergicTo}
            onChange={(e) => setIAmAllergicTo(e.target.value)}
            placeholder="e.g. I can not eat:"
            className="text-lg py-6"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="make-me-sick" className="text-sm font-medium text-gray-500">
            Secondary Warning
          </Label>
          <Input
            id="make-me-sick"
            value={theyMakeMeSick}
            onChange={(e) => setTheyMakeMeSick(e.target.value)}
            placeholder="e.g. They make me very sick..."
            className="text-lg py-6"
          />
        </div>
      </div>

      <Button 
        onClick={handleNext}
        className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white rounded-xl mt-8"
      >
        Next
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default SelectAlertPage;