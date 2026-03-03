"use client";

/**
 * Mapping of language codes to their primary emergency service numbers.
 * Note: 112 is the international standard and works in most countries 
 * (often redirecting to local numbers on mobile networks).
 */
export const emergencyNumbers: Record<string, string> = {
  'en': '911', // Defaulting to 911 for English (US/Canada)
  'es': '112', // Spain/Europe (Latin Am varies, but 112/911 are common)
  'fr': '112',
  'de': '112',
  'it': '112',
  'pt': '112',
  'nl': '112',
  'pl': '112',
  'ru': '112',
  'ja': '119',
  'ko': '119',
  'zh': '120', // Medical emergency in China
  'ar': '997', // Saudi Arabia (Medical)
  'hi': '102', // India (Ambulance)
  'tr': '112',
  'vi': '115',
  'th': '1669',
  'id': '118',
  'el': '166',
  'he': '101',
  'sv': '112',
  'no': '113',
  'da': '112',
  'fi': '112',
};

export const getEmergencyNumber = (langCode: string | undefined): string => {
  if (!langCode) return '112';
  return emergencyNumbers[langCode] || '112';
};