"use client";

import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Search, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { fileToCompressedDataUrl } from '@/lib/customAllergenImages';

// The gesture to save an image out of the search results differs by platform
// - both iOS and Android use a touch-and-hold, but the menu item it opens
// (and where the file ends up) has a different name on each.
const getSaveImageHint = (): string => {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') {
    return 'Touch and hold the photo you like and choose "Save to Photos", then come back here and tap Upload from device.';
  }
  if (platform === 'android') {
    return 'Touch and hold the photo you like and choose "Download image", then come back here and tap Upload from device.';
  }
  return 'Right-click (or press and hold) the photo you like and choose "Save image", then come back here and tap Upload from device.';
};

interface CustomAllergenImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  allergenName: string;
  currentImage?: string;
  onImageChange: (dataUrl: string | null) => void;
}

const CustomAllergenImageDialog: React.FC<CustomAllergenImageDialogProps> = ({
  isOpen,
  onClose,
  allergenName,
  currentImage,
  onImageChange,
}) => {
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearchWeb = () => {
    // Biasing toward white-background photos makes the saved image sit
    // consistently alongside the built-in allergen icons (see the letterboxing
    // comment on fileToCompressedDataUrl below), instead of carrying over
    // whatever busy background the source photo happened to have.
    const query = encodeURIComponent(`${allergenName} white background`);
    window.open(`https://www.google.com/search?tbm=isch&q=${query}`, '_blank', 'noopener,noreferrer');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onImageChange(dataUrl);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Could not use that image.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemove = () => {
    onImageChange(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] max-w-[400px] rounded-2xl border-gray-200 dark:border-gray-700 shadow-2xl p-5">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {currentImage ? `Change image for "${allergenName}"` : `Add an image for "${allergenName}"`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Button
              onClick={handleSearchWeb}
              disabled={isBusy}
              variant="outline"
              className="w-full h-12 rounded-none border-0 justify-start gap-3 px-4"
            >
              <Search className="h-4 w-4" />
              Search the web
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              {getSaveImageHint()}
            </p>
          </div>

          <Button
            onClick={handleUploadClick}
            disabled={isBusy}
            variant="outline"
            className="w-full h-12 rounded-xl border-gray-200 justify-start gap-3 px-4"
          >
            <Upload className="h-4 w-4" />
            Upload from device
          </Button>

          {currentImage && (
            <Button
              onClick={handleRemove}
              disabled={isBusy}
              variant="outline"
              className="w-full h-12 rounded-xl border-red-200 text-red-600 justify-start gap-3 px-4 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove image
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomAllergenImageDialog;
