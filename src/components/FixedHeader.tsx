"use client";

import React from 'react';

const FixedHeader = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Status Bar Background - matches the brand red */}
      <div className="h-[env(safe-area-inset-top)] bg-red-600 w-full" />
    </div>
  );
};

export default FixedHeader;