"use client";

import React from 'react';

interface EmergencyCrossIconProps {
  className?: string;
}

const EmergencyCrossIcon: React.FC<EmergencyCrossIconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="red" aria-hidden="true">
    <path d="M8 2h8v6h6v8h-6v6H8v-6H2V8h6z" />
  </svg>
);

export default EmergencyCrossIcon;
