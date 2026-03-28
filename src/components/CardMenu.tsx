"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ShieldAlert, MessageSquare, Languages, X, Info, Mail } from 'lucide-react';

export interface CardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDisclaimer: () => void;
  languageCode?: string;
  isEmergency?: boolean;
  fromWidget?: boolean;
}

const CardMenu: React.FC<CardMenuProps> = ({ 
  isOpen, 
  onClose, 
  onOpenDisclaimer, 
  languageCode = 'en',
  isEmergency = false, 
  fromWidget = false 
}) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleNavigation = (to: string) => {
    onClose();
    navigate(to);
  };

  const handleReportIssue = () => {
    const subject = encodeURIComponent("Issue with Allergy Card");
    const body = encodeURIComponent("Please describe the issue you encountered...");
    window.location.href = `mailto:support@allergyalert.com?subject=${subject}&body=${body}`;
    onClose();
  };

  const menuItems = isEmergency ? [
    { icon: Home, label: 'Home', to: '/' },
    { icon: ShieldAlert, label: 'Saved Cards', to: '/saved' },
    { icon: MessageSquare, label: 'Edit Card', to: '/setup' },
  ] : [
    { icon: Home, label: 'Home', to: '/' },
    { icon: ShieldAlert, label: 'Saved Cards', to: '/saved' },
    { icon: MessageSquare, label: 'Edit Card', to: '/setup' },
    { icon: Languages, label: 'Emergency Card', to: `/emergency/${languageCode}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white px-2">Menu</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-2">
          <div className="grid gap-1">
            {menuItems.map((item) => (
              <button
                key={item.to}
                onClick={() => handleNavigation(item.to)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
              >
                <item.icon className="h-4 w-4 text-red-500" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="my-2 border-t border-gray-100 dark:border-gray-700" />

          <div className="grid gap-1">
            <button
              onClick={() => {
                onOpenDisclaimer();
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
            >
              <Info className="h-4 w-4 text-blue-500" />
              <span>Disclaimer</span>
            </button>

            <button
              onClick={handleReportIssue}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
            >
              <Mail className="h-4 w-4 text-green-500" />
              <span>Report an Issue</span>
            </button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default CardMenu;