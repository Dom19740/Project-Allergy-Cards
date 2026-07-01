"use client";

import { LanguageCode } from './types';
import { ALLERGEN_DICTIONARY, REGIONAL_OVERRIDES } from './allergen-dictionary';
import { UI_TEXT_DICTIONARY } from './ui-text-dictionary';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from './supportedLanguages';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { Capacitor } from '@capacitor/core';

export type { SupportedLanguage };

/**
 * Thrown when both the free Google endpoint and the /api/translate proxy fail.
 * Callers must surface this to the user instead of showing an untranslated or
 * partially-translated safety card, since a silent bad translation here is
 * more dangerous than a visible failure.
 */
export class TranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranslationError';
  }
}

const REQUEST_TIMEOUT_MS = 8000;

const fetchWithTimeout = async (url: string, init?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const logTranslationEvent = (name: string, params: Record<string, string | number>) => {
  FirebaseAnalytics.logEvent({ name, params }).catch(() => {});
};

const recordTranslationException = (message: string) => {
  // Crashlytics is native-only; on web this is a no-op.
  if (Capacitor.isNativePlatform()) {
    FirebaseCrashlytics.recordException({ message }).catch(() => {});
  }
};

// Preserve capitalization if the original text was capitalized
const applyCapitalization = (text: string, translation: string): string => {
  if (text[0] === text[0].toUpperCase() && text[0] !== text[0].toLowerCase()) {
    return translation.charAt(0).toUpperCase() + translation.slice(1);
  }
  return translation;
};

const applyRegionalOverrides = (translated: string, targetLanguage: string): string => {
  const overrides = REGIONAL_OVERRIDES[targetLanguage];
  if (!overrides) return translated;

  let result = translated;
  Object.entries(overrides).forEach(([latin, european]) => {
    // Use a more robust replacement that handles accented characters correctly.
    const escaped = latin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])${escaped}(?![a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])`, 'g');
    result = result.replace(regex, (match, p1) => (p1 || '') + european);
  });
  return result;
};

// Extracts translated text from the gtx endpoint's nested array shape.
// Returns null if the shape doesn't match what we expect - the endpoint
// sometimes returns HTTP 200 with malformed/empty data instead of an error.
const parseFreeEndpointResponse = (data: any): string | null => {
  if (!data || !Array.isArray(data[0]) || data[0].length === 0) return null;
  const translated = data[0]
    .map((segment: any) => segment?.[0])
    .filter((segment: any) => typeof segment === 'string')
    .join('');
  return translated.length > 0 ? translated : null;
};

const translateViaFreeEndpoint = async (text: string, targetLanguage: string): Promise<string> => {
  const response = await fetchWithTimeout(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`
  );

  if (!response.ok) {
    throw new Error(`free endpoint returned HTTP ${response.status}`);
  }

  const body = await response.text();
  if (!body) {
    throw new Error('free endpoint returned an empty body');
  }

  let data: any;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error('free endpoint returned unparseable JSON');
  }

  const translated = parseFreeEndpointResponse(data);
  if (translated === null) {
    throw new Error('free endpoint returned malformed translation data');
  }

  return translated;
};

const translateViaProxy = async (text: string, targetLanguage: string): Promise<string> => {
  const response = await fetchWithTimeout('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage }),
  });

  if (!response.ok) {
    throw new Error(`proxy endpoint returned HTTP ${response.status}`);
  }

  const data = await response.json().catch(() => null);
  const translated = data?.translatedText;
  if (typeof translated !== 'string' || translated.length === 0) {
    throw new Error('proxy endpoint returned no translation');
  }

  return translated;
};

/**
 * Translates text using local dictionaries first, then Google Translate.
 *
 * The free translate_a/single "gtx" endpoint is the same undocumented client
 * the Google Translate website itself uses - it has no SLA and Google can
 * throttle or block it without notice. When it fails we retry once against
 * our own rate-limited /api/translate proxy (backed by the official Cloud
 * Translation API + GOOGLE_TRANSLATE_API_KEY, kept server-side only). If both
 * fail, we throw rather than silently showing untranslated/broken text on a
 * safety-critical allergy card.
 */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || !targetLanguage || targetLanguage === 'en') return text;

  const normalizedText = text.toLowerCase().trim();

  // 1. Check local dictionaries first (case-insensitive)
  const allergenEntry = ALLERGEN_DICTIONARY[targetLanguage]?.[normalizedText];
  if (allergenEntry) return applyCapitalization(text, allergenEntry);

  const uiTextEntry = UI_TEXT_DICTIONARY[targetLanguage]?.[normalizedText];
  if (uiTextEntry) return applyCapitalization(text, uiTextEntry);

  try {
    const translated = await translateViaFreeEndpoint(text, targetLanguage);
    logTranslationEvent('translation_completed', { path: 'free', target_language: targetLanguage });
    return applyRegionalOverrides(translated, targetLanguage);
  } catch (freeError) {
    const freeErrorMessage = (freeError as Error).message;
    logTranslationEvent('translation_fallback_triggered', {
      target_language: targetLanguage,
      reason: freeErrorMessage,
    });

    try {
      const translated = await translateViaProxy(text, targetLanguage);
      logTranslationEvent('translation_completed', { path: 'proxy_fallback', target_language: targetLanguage });
      return applyRegionalOverrides(translated, targetLanguage);
    } catch (proxyError) {
      const proxyErrorMessage = (proxyError as Error).message;
      const message = `Translation unavailable for "${targetLanguage}": free endpoint (${freeErrorMessage}), proxy (${proxyErrorMessage})`;
      logTranslationEvent('translation_failed', { target_language: targetLanguage });
      recordTranslationException(message);
      throw new TranslationError(message);
    }
  }
};

export const getAllGoogleLanguages = async (): Promise<SupportedLanguage[]> => {
  return SUPPORTED_LANGUAGES;
};
