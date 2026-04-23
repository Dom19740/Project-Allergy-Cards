"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Crown, 
  Globe, 
  ShieldAlert, 
  MessageSquare, 
  Save, 
  Settings,
  Info,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBilling } from '@/hooks/useBilling';

const FixedHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isPremium } = useBilling();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ShieldAlert, label: 'My Allergens', path: '/select-allergens' },
    { icon: Globe, label: 'Languages', path: '/select-language' },
    { icon: MessageSquare, label: 'Custom Alerts', path: '/custom-alerts' },
    { icon: Save, label: 'Saved Cards', path: '/saved-cards' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: Info, label: 'About', path: '/about' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between safe-top">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="bg-red-600 p-1.5 rounded-lg">
            <ShieldAlert className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-gray-900 dark:text-white uppercase">
            Allergy Alert
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isPremium && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/premium')}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-bold"
            >
              <Crown className="h-4 w-4 mr-1" />
              Go Premium
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(true)}
            className="rounded-full"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
            <span className="font-black text-lg tracking-tight uppercase">Menu</span>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-xl">
                  <item.icon className="h-6 w-6 text-red-600" />
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">{item.label}</span>
              </button>
            ))}
          </div>

          {!isPremium && (
            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
              <Button 
                onClick={() => handleNavigate('/premium')}
                className="w-full py-6 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Crown className="h-5 w-5" />
                Unlock All Features
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FixedHeader;