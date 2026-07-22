"use client";

import { toPng } from 'html-to-image';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';
import { toast } from 'sonner';

/**
 * Checks if the app is running in a native mobile environment
 */
const isNative = async () => {
  const info = await Device.getInfo();
  return info.platform === 'android' || info.platform === 'ios';
};

// Per-image safety cap so a single stalled/broken image can't hold up card
// generation indefinitely - it just falls through and gets captured as-is.
const IMAGE_LOAD_TIMEOUT_MS = 5000;

// html-to-image rasterizes whatever is currently painted - if an <img> hasn't
// finished loading yet (cold cache/slow network), it gets captured blank.
// Preloading elsewhere in the app makes this rare, but doesn't guarantee it,
// so wait for every image in the card before handing it to toPng.
const waitForImages = (element: HTMLElement): Promise<void> => {
  const images = Array.from(element.querySelectorAll('img'));
  return Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
        setTimeout(done, IMAGE_LOAD_TIMEOUT_MS);
      });
    })
  ).then(() => undefined);
};

export const generateCardImage = async (element: HTMLElement): Promise<string | null> => {
  try {
    await waitForImages(element);
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

const downloadDataUrl = (dataUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
    downloadDataUrl(dataUrl, fileName);
    return true;
  }
};

export const shareCard = async (element: HTMLElement, title: string = 'My Allergy Card', text: string = 'My Allergy Alert Card') => {
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
        text: text,
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
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'allergy-card.png', { type: 'image/png' });
      const shareData = { title, text, files: [file] };

      // Some browsers (e.g. desktop Firefox) expose navigator.share but can't
      // actually share files, so sharing with `files` set throws. Fall back
      // to a plain download instead of reporting a failure.
      if (!navigator.canShare || !navigator.canShare(shareData)) {
        downloadDataUrl(dataUrl, 'allergy-card.png');
        toast.info("Your browser can't share images directly, so we saved it to your device instead.");
        return true;
      }

      try {
        await navigator.share(shareData);
        return true;
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return true; // user cancelled the share sheet
        console.error('Web share error:', error);
        return false;
      }
    }
    return false;
  }
};