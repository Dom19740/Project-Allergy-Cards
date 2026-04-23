"use client";

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReadAloudButtonProps {
  text: string;
  languageCode: string;
}

const ReadAloudButton = ({ text, languageCode }: ReadAloudButtonProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!window.speechSynthesis) {
      toast.error("Speech synthesis is not supported in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language codes if necessary (e.g., 'en' to 'en-US')
    // Most browsers handle 2-letter codes well, but we can be specific
    utterance.lang = languageCode;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance error", event);
      setIsSpeaking(false);
      toast.error("Could not read aloud. Please check your device volume.");
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleSpeak}
      className={`rounded-full w-12 h-12 shadow-md transition-all ${
        isSpeaking ? 'bg-red-100 border-red-200 text-red-600 animate-pulse' : 'bg-white dark:bg-gray-800'
      }`}
      title={isSpeaking ? "Stop reading" : "Read aloud"}
    >
      {isSpeaking ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
    </Button>
  );
};

export default ReadAloudButton;