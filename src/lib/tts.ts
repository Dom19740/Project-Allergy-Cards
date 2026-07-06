"use client";

import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Google Translate uses a couple of legacy/non-standard codes that TTS
// engines (Web Speech API, Android, iOS) don't recognize even though they
// do ship a voice for the language under its modern BCP-47 tag.
const TTS_LANG_ALIASES: Record<string, string> = {
  iw: 'he', // Hebrew
  jw: 'jv', // Javanese
};

const speakOnce = (text: string, lang: string) =>
  TextToSpeech.speak({ text, lang, rate: 0.9, pitch: 1.0, volume: 1.0, category: 'ambient' });

// Translation and speech are unrelated capabilities under the hood - Google
// Translate covers 100+ languages, but most of the obscure ones (Cebuano,
// Chichewa, Esperanto, Kurdish, Sundanese, Yiddish, etc.) simply have no
// installed TTS voice on typical devices/browsers, so speak() rejects.
// When the exact tag fails, retry once with just the base language (e.g.
// "es-419" -> "es"), since a region/dialect voice is often missing even
// when the base language itself is supported.
export const speakText = async (text: string, lang: string) => {
  const normalized = TTS_LANG_ALIASES[lang] || lang;
  try {
    await speakOnce(text, normalized);
  } catch (error) {
    const baseLang = normalized.split('-')[0];
    if (baseLang === normalized) throw error;
    await speakOnce(text, baseLang);
  }
};
