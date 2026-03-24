"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ShieldAlert, MessageSquare, Languages, X, Info, Mail } from 'lucide-react';

interface CardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDisclaimer: () => void;
  isEmergency?: boolean;
  fromWidget?: boolean;
}

const CardMenu: React.FC<CardMenuProps> = ({ isOpen, onClose, onOpenDisclaimer, isEmergency = false, fromWidget = false }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleNavigation = (to: string) => {
    onClose();
    // If we're from a widget, we use replace: true for the first navigation
    // to clear the deep link state from the history stack.
    navigate(to, { replace: fromWidget });
  };

  const handleReportIssue = () => {

    const subject = encodeURIComponent("Simple Allergy Alert Issue Report");
    window.location.href = `mailto:happymunkeestudio@dpbcreative.com?subject=${subject}`;
    onClose();
  };

  const menuItems = [
    { to: "/", label: "Saved Cards", icon: Home },
    ...(!isEmergency ? [
      { to: "/select-allergens", label: "Edit Allergens", icon: ShieldAlert },
      { to: "/select-alert", label: "Edit Alert", icon: MessageSquare },
    ] : []),
    { to: "/select-language", label: "Change Language", icon: Languages },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Centering Container */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        {/* Animated Menu Content */}
        <div className="w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-bottom-full duration-500 ease-out">
          <div className="p-2">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</span>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
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

            <button
              onClick={handleReportIssue}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
            >
              <Mail className="h-4 w-4 text-red-500" />
              <span>Report an Issue</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDisclaimer();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
            >
              <Info className="h-4 w-4 text-red-500" />
              <span>Disclaimer</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardMenu;