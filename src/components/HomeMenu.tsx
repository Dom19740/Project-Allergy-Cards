"use client";

import React from 'react';
import { X, Gift, RotateCcw, Upload } from 'lucide-react';

interface HomeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPromoCode: () => void;
  onOpenRestorePurchase: () => void;
  onOpenBackupRestore: () => void;
}

// Mirrors CardMenu's bottom-sheet look and feel, but triggered from a
// separate burger button on the Home screen rather than the card's action
// bar - see the burger icon next to the Get Started button in Home.tsx.
const HomeMenu: React.FC<HomeMenuProps> = ({ isOpen, onClose, onOpenPromoCode, onOpenRestorePurchase, onOpenBackupRestore }) => {
  if (!isOpen) return null;

  const menuItems = [
    { label: "Redeem Promo Code", icon: Gift, onClick: onOpenPromoCode },
    { label: "Restore Purchase", icon: RotateCcw, onClick: onOpenRestorePurchase },
    { label: "Restore from Backup", icon: Upload, onClick: onOpenBackupRestore },
  ];

  const handleItemClick = (action: () => void) => {
    onClose();
    // Small delay to allow the menu's close animation to start before the
    // next dialog opens, matching CardMenu's navigation handler.
    setTimeout(action, 10);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
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
                key={item.label}
                onClick={() => handleItemClick(item.onClick)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
              >
                <item.icon className="h-4 w-4 text-red-500" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeMenu;
