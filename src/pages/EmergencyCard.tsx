"use client";

import React from 'react';
import FixedHeader from '@/components/FixedHeader';

const EmergencyCard = () => {
  return (
    <div className="flex flex-col h-[100dvh] bg-red-50 dark:bg-red-950/20">
      <FixedHeader />
      <div className="flex-1 p-6 pt-24 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">EMERGENCY CARD</h1>
        <p className="text-lg mb-8">This card contains critical medical information for emergencies.</p>
      </div>
    </div>
  );
};

export default EmergencyCard;