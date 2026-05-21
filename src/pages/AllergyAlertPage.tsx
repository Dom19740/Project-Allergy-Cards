"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import CardActions from '@/components/CardActions';
// ... other imports (assuming standard ones for this app)

const AllergyAlertPage = () => {
  const { id } = useParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'android' | 'ios'>('web');

  useEffect(() => {
    Device.getInfo().then(info => {
      setPlatform(info.platform as any);
    });
  }, []);

  const handleShare = async () => {
    setIsSharing(true);
    const shareUrl = window.location.href;
    const shareData = {
      title: 'My Allergy Alert Card',
      text: 'Please see my allergy information.',
      url: shareUrl,
    };

    try {
      if (platform !== 'web') {
        // Native Share
        await Share.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
          dialogTitle: 'Share Allergy Card',
        });
      } else if (navigator.share && navigator.canShare?.(shareData)) {
        // Web Share API
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to Clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if ((error as Error).name !== 'AbortError') {
        toast.error("Could not share the link.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, cacheBust: true });
      const fileName = `allergy-card-${id || 'export'}.png`;

      if (platform !== 'web') {
        // Android/iOS: Save via Filesystem and Share
        const base64Data = dataUrl.split(',')[1];
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: 'Allergy Card',
          url: savedFile.uri,
        });
      } else {
        // Web: Standard download
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
      toast.success("Card ready!");
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error("Failed to generate image.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ... rest of the component logic (onPrint, onSave, etc.)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Card Content */}
      <div ref={cardRef} className="p-4">
        {/* ... Card UI ... */}
      </div>

      {/* Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0">
        <CardActions
          onShare={handleShare}
          onDownload={handleDownload}
          onPrint={() => window.print()}
          onSave={() => toast.info("Card saved to your profile")}
          onToggleMenu={() => {}}
          onEmergency={() => {}}
          onReadAloud={() => setIsSpeaking(!isSpeaking)}
          isSharing={isSharing}
          isDownloading={isDownloading}
          isSpeaking={isSpeaking}
        />
      </div>
    </div>
  );
};

export default AllergyAlertPage;