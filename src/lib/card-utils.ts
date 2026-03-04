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
    return await toPng(element, { 
      cacheBust: true, 
      pixelRatio: 3,
      backgroundColor: '#ffffff'
    });
  } catch (error) {
    console.error('Error generating card image:', error);
    return null;
  }
};

export const downloadCard = async (element: HTMLElement, fileName: string = 'allergy-card.png') => {
  const dataUrl = await generateCardImage(element);
  if (!dataUrl) return false;

  const native = await isNative();

  if (native) {
    try {
      const base64Data = dataUrl.split(',')[1];
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });
      return true;
    } catch (error) {
      console.error('Native download error:', error);
      return false;
    }
  } else {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }
};

export const shareCard = async (element: HTMLElement, title: string = 'My Allergy Card') => {
  const dataUrl = await generateCardImage(element);
  if (!dataUrl) return false;

  const native = await isNative();

  if (native) {
    try {
      const base64Data = dataUrl.split(',')[1];
      const fileName = 'allergy-card.png';
      
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: title,
        text: 'My Allergy Alert Card',
        url: savedFile.uri,
      });
      return true;
    } catch (error) {
      if ((error as any).code !== 'UA') { // Ignore user cancellations
        console.error('Native share error:', error);
        return false;
      }
      return true;
    }
  } else {
    if (navigator.share) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'allergy-card.png', { type: 'image/png' });
        await navigator.share({
          title: title,
          files: [file],
        });
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }
};