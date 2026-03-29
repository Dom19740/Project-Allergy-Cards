"use client";

import React from 'react';
import { X, Trash2, Edit } from 'lucide-react';

interface CardMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  fromWidget: boolean;
  onEdit: () => void;
}

const CardMenu: React.FC<CardMenuProps> = ({ isOpen, onClose, onDelete, onEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Card Options</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={onEdit}
              className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-colors"
            >
              <Edit className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Edit Card</span>
            </button>
            <button 
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-600">Delete Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardMenu;