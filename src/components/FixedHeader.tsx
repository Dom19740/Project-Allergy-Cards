"use client";

import React from 'react';
import { Link } from 'react-router-dom';

const FixedHeader = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Status Bar Background - matches the brand red */}
      <div className="h-[env(safe-area-inset-top)] bg-red-600 w-full" />
      
      {/* Main Header Content */}
      <div className="bg-gray-100 dark:bg-gray-900 flex justify-center items-center h-[60px] relative px-4">
        <Link to="/" className="block w-full max-w-2xl">
          <h1 className="bg-red-600 text-white px-4 py-[7px] rounded-lg text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight shadow-sm whitespace-nowrap text-center w-full">
            SIMPLE ALLERGY ALERT
          </h1>
        </Link>
      </div>
    </div>
  );
};

export default FixedHeader;