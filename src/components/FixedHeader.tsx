"use client";

import React from 'react';
import { Link } from 'react-router-dom';

const FixedHeader = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Status Bar Background - matches the brand red */}
      <div className="h-[env(safe-area-inset-top)] bg-red-600 w-full" />
      
      {/* Main Header Content */}
      <div className="bg-gray-100 dark:bg-gray-900 flex justify-center items-center h-[106px] relative">
        <Link to="/" className="block flex justify-center">
          <h1 className="bg-red-600 text-white px-4 py-[13px] rounded-lg text-2xl md:text-3xl font-extrabold tracking-tight shadow-sm">
            SIMPLE ALLERGY ALERT
          </h1>
        </Link>
        
        {/* Feathered edge transition at the bottom of the header */}
        <div className="absolute bottom-[-32px] left-0 right-0 h-8 bg-gradient-to-b from-gray-100 dark:from-gray-900 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default FixedHeader;