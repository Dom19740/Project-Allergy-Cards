"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShieldAlert, MessageSquare, Languages, X } from 'lucide-react';

interface CardMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const CardMenu: React.FC<CardMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const menuItems = [
    { to: "/", label: "Saved Cards", icon: Home },
    { to: "/select-allergens", label: "Edit Allergens", icon: ShieldAlert },
    { to: "/select-alert", label: "Edit Message", icon: MessageSquare },
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
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                onClick={onClose}
              >
                <item.icon className="h-4 w-4 text-red-500" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CardMenu;