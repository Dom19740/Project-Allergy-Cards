"use client";

import React from 'react';
import { Link } from 'react-router-dom';

const FixedHeader = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Status Bar Background - matches the brand red */}
      <div className="h-[env(safe-area-inset-top)] bg-red-600 w-full" />
      
      {/* Main Header Content */}
      <div className="bg-gray-100 dark:bg-gray-900 flex justify-center items-center h-[106px] relative border-b border-gray-200 dark:border-gray-800">
        <Link to="/" className="block flex justify-center">
          <h1 className="bg-red-600 text-white px-4 py-[13px] rounded-lg text-2xl md:text-3xl font-extrabold tracking-tight shadow-sm">
            SIMPLE ALLERGY ALERT
          </h1>
        </Link>
      </div>
    </div>
  );
};

export default FixedHeader;