"use client";

import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export const generateCardImage = async (element: HTMLElement): Promise<string | null> => {
  try {
    // html2canvas is the most reliable for Android WebViews
    const canvas = await html2canvas(element, {
      scale: 3, // High quality for printing/sharing
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Ensure the cloned element is visible and correctly positioned for capture
        const el = clonedDoc.getElementById(element.id) || clonedDoc.querySelector('[ref]');
        if (el instanceof HTMLElement) {
          el.style.transform = 'none';
        }
      }
    });
    return canvas.toDataURL('image/png');
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
  if (Capacitor.isNativePlatform()) {
    // On mobile, the most reliable "download" is sharing the file 
    // so the user can select "Save Image" from the system sheet.
    return await shareCard(element, 'Save Card', 'Save this allergy card to your device');
  }

  const dataUrl = await generateCardImage(element);
  if (!dataUrl) return false;

  try {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Web download failed:', error);
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

  if (Capacitor.isNativePlatform()) {
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
      // Don't return false if user just cancelled the share sheet
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