"use client";

import React from 'react';
import FixedHeader from '@/components/FixedHeader';

const Settings = () => {
  return (
    <div className="flex flex-col h-[100dvh] bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      <div className="flex-1 p-6 pt-24">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="font-medium">App Version</p>
            <p className="text-sm text-gray-500">1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;