"use client";

import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';

/**
 * Checks if the app is running in a native mobile environment (Android/iOS)
 */
const isNative = async () => {
  const info = await Device.getInfo();
  return info.platform === 'android' || info.platform === 'ios';
};

export const generateCardImage = async (elementId: string): Promise<string | null> => {
  const element = document.getElementById(elementId);
  if (!element) return null;

  try {
    // Ensure images are loaded
    const images = element.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    const canvas = await html2canvas(element, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.transform = 'none';
        }
      }
    });

    return canvas.toDataURL('image/png', 1.0);
  } catch (error) {
    console.error('Error generating card image:', error);
    return null;
  }
};

export const downloadCard = async (elementId: string, fileName: string = 'allergy-card.png') => {
  const dataUrl = await generateCardImage(elementId);
  if (!dataUrl) return false;

  const native = await isNative();

  if (native) {
    try {
      // For native apps, we save to the filesystem
      const base64Data = dataUrl.split(',')[1];
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });
      
      // On Android, we might want to share it immediately or notify the user where it is
      // For now, just saving it is the primary goal.
      return true;
    } catch (error) {
      console.error('Native download error:', error);
      return false;
    }
  } else {
    // Standard web download
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
};

export const shareCard = async (elementId: string, title: string = 'My Allergy Card') => {
  const dataUrl = await generateCardImage(elementId);
  if (!dataUrl) return false;

  const native = await isNative();

  if (native) {
    try {
      const base64Data = dataUrl.split(',')[1];
      const fileName = 'allergy-card.png';
      
      // Save temporarily to share
      const cacheFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: title,
        text: 'Check out my allergy card generated with AllergyCard.app',
        url: cacheFile.uri,
        dialogTitle: 'Share Allergy Card',
      });
      return true;
    } catch (error) {
      console.error('Native share error:', error);
      return false;
    }
  } else {
    // Web share
    if (navigator.share) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'allergy-card.png', { type: 'image/png' });
        
        await navigator.share({
          title: title,
          text: 'Check out my allergy card generated with AllergyCard.app',
          files: [file],
        });
        return true;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return true;
        console.error('Web share error:', error);
      }
    }
    
    // Fallback for browsers that don't support file sharing
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'allergy-card.png';
    link.click();
    return true;
  }
};