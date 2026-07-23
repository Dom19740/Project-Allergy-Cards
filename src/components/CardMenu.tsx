"use client";

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, HelpCircle, ShieldAlert, MessageSquare, Languages, X, Info, Mail, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface CardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDisclaimer: () => void;
  onOpenUnderstandCard: () => void;
  onResetEmergencyNumber?: () => void;
  isEmergency?: boolean;
}

const CardMenu: React.FC<CardMenuProps> = ({ isOpen, onClose, onOpenDisclaimer, onOpenUnderstandCard, onResetEmergencyNumber, isEmergency = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  if (!isOpen) return null;

  // Lets the step page's Continue button jump straight back to this card
  // instead of continuing through the rest of the wizard.
  const editState = {
    returnTo: location.pathname,
    returnBase: isEmergency ? '/emergency' : '/alert',
  };

  const handleNavigation = (to: string, state?: typeof editState) => {
    onClose();
    // Changing language on the emergency card invalidates any previously
    // verified emergency number, since it was verified for the old language.
    if (isEmergency && to === "/select-language") {
      storage.remove(STORAGE_KEYS.VERIFIED_EMERGENCY_NUMBER);
    }
    // Small delay to allow the menu animation to start closing or just to be safe
    setTimeout(() => {
      navigate(to, state ? { state } : undefined);
    }, 10);
  };

  const handleReportIssue = () => {
    const subject = encodeURIComponent("Simple Allergy Alert Issue Report");
    window.location.href = `mailto:info@simpleallergyalert.com?subject=${subject}`;
    onClose();
  };

  const handleResetEmergencyNumber = async () => {
    onClose();
    if (onResetEmergencyNumber) {
      onResetEmergencyNumber();
      return;
    }
    await storage.remove(STORAGE_KEYS.VERIFIED_EMERGENCY_NUMBER);
    toast.success("Emergency number reset. You'll be asked to verify it next time.");
  };

  const menuItems = [
    { to: "/", label: "Saved Cards", icon: Home },
    ...(!isEmergency ? [
      { to: "/select-allergens", label: "Edit Allergens", icon: ShieldAlert, state: editState },
      { to: "/select-alert", label: "Edit Alerts", icon: MessageSquare, state: editState },
    ] : []),
    { to: "/select-language", label: "Change Language", icon: Languages, state: editState },
  ];

  const savedCardsItem = menuItems[0];
  const restOfMenuItems = menuItems.slice(1);

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
            <button
              onClick={() => handleNavigation(savedCardsItem.to)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
            >
              <savedCardsItem.icon className="h-4 w-4 text-red-500" />
              <span>{savedCardsItem.label}</span>
            </button>

            {!isEmergency && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUnderstandCard();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
              >
                <HelpCircle className="h-4 w-4 text-red-500" />
                <span>Understand Your Card</span>
              </button>
            )}

            {restOfMenuItems.map((item) => (
              <button
                key={item.to}
                onClick={() => handleNavigation(item.to, item.state)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
              >
                <item.icon className="h-4 w-4 text-red-500" />
                <span>{item.label}</span>
              </button>
            ))}

            {isEmergency && (
              <button
                onClick={handleResetEmergencyNumber}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
              >
                <RotateCcw className="h-4 w-4 text-red-500" />
                <span>Reset Emergency Number</span>
              </button>
            )}

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