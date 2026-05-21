"use client";

import { toPng } from 'html-to-image';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';

/**
 * Checks if the app is running in a native mobile environment
 */
const isNative = async () => {
  const info = await Device.getInfo();
  return info.platform === 'android' || info.platform === 'ios';
};

export const generateCardImage = async (element: HTMLElement): Promise<string | null> => {
  try {
    // Optimized settings for better quality and compatibility
    return await toPng(element, { 
      cacheBust: true, 
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      style: {
        transform: 'scale(1)',
      }
    });
  } catch (error) {
    console.error('Error generating card image:', error);
    return null;
  }
};

/**
 * Handles downloading the card. 
 * On Web: Triggers a browser download.
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

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
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

      await Share.share({
        title: title,
        text: text,
        url: savedFile.uri,
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
    const link = document.createElement('a');
    link.download = 'allergy-card.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
};