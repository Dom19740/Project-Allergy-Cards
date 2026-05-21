"use client";

import { toPng } from 'html-to-image';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

/**
 * Checks if the app is running in a native mobile environment
 */
const isNative = async () => {
  return Capacitor.isNativePlatform();
};

/**
 * Converts a data URL (base64) to a Blob object
 */
const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const generateCardImage = async (element: HTMLElement): Promise<string | null> => {
  try {
    // html-to-image is extremely fast and handles modern CSS (flex, grid, rounded corners) perfectly
    return await toPng(element, {
      quality: 0.95,
      pixelRatio: 3, // High quality
      backgroundColor: '#ffffff',
      style: {
        transform: 'none',
      },
      cacheBust: true,
    });
  } catch (error) {
    console.error('Error generating card image:', error);
    return null;
  }
};

/**
 * Handles downloading the card. 
 * On Web: Triggers a browser download using a Blob URL (highly compatible with Android Chrome).
 * On Native: Uses the Share API so users can "Save to Device".
 */
export const downloadCard = async (element: HTMLElement, fileName: string = 'allergy-card.png') => {
  const native = await isNative();

  if (native) {
    // On mobile, the most reliable "download" is sharing the file 
    // so the user can select "Save Image" from the system sheet.
    return await shareCard(element, 'Save Card', 'Save this allergy card to your device');
  }

  const dataUrl = await generateCardImage(element);
  if (!dataUrl) return false;

  try {
    const blob = dataUrlToBlob(dataUrl);
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = fileName;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
};

/**
 * Handles sharing the card image.
 * On Web: Uses Web Share API if available, otherwise falls back to download.
 * On Native: Saves to cache and opens the native share sheet.
 */
export const shareCard = async (element: HTMLElement, title: string = 'My Allergy Card', text: string = 'My Allergy Alert Card') => {
  const dataUrl = await generateCardImage(element);
  if (!dataUrl) return false;

  const native = await isNative();

  if (native) {
    try {
      const base64Data = dataUrl.split(',')[1];
      const fileName = `allergy_card_${Date.now()}.png`;
      
      // Save to temporary cache directory for sharing
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      // On Android/iOS, local files must be shared via the 'files' array
      await Share.share({
        title: title,
        text: text,
        files: [savedFile.uri],
      });
      return true;
    } catch (error) {
      // Don't show error if user just cancelled the share sheet
      if ((error as any).code !== 'UA') { 
        console.error('Native share error:', error);
        return false;
      }
      return true;
    }
  } else {
    // Web implementation
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'allergy-card.png', { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: title,
            text: text,
            files: [file],
          });
          return true;
        }
      } catch (error) {
        console.error('Web share failed:', error);
      }
    }
    
    // Fallback for web browsers that don't support sharing files: 
    // Just download the image instead.
    try {
      const blob = dataUrlToBlob(dataUrl);
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = 'allergy-card.png';
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      return true;
    } catch (error) {
      console.error('Download fallback error:', error);
      return false;
    }
  }
};