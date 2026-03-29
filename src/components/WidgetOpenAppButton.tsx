"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface WidgetOpenAppButtonProps {
  onOpenApp: () => void;
}

const WidgetOpenAppButton: React.FC<WidgetOpenAppButtonProps> = ({ onOpenApp }) => {
  return (
    <Button
      onClick={onOpenApp}
      variant="ghost"
      size="icon"
      className="text-gray-500 hover:bg-gray-100 rounded-full h-10 w-10"
      title="Open App"
    >
      {/* Using text "AA" as placeholder for app logo - replace with actual logo image/icon */}
      AA
    </Button>
  );
};

export default WidgetOpenAppButton;