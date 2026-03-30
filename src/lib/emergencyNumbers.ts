"use client";

export interface EmergencyNumberInfo {
  number: string;
  region?: string;
  label?: string;
}

export const emergencyNumbers: Record<string, EmergencyNumberInfo[]> = {
  'en': [
    { number: '911', region: 'USA/Canada', label: '911 (USA/Canada)' },
    { number: '999', region: 'UK', label: '999 (UK)' },
    { number: '000', region: 'Australia', label: '000 (Australia)' },
    { number: '111', region: 'New Zealand', label: '111 (New Zealand)' },
    { number: '112', region: 'Europe/International', label: '112 (International)' }
  ],
  'es': [
    { number: '112', region: 'Spain/Europe', label: '112 (Spain)' },
    { number: '911', region: 'Americas', label: '911 (Americas)' }
  ],
  'es-419': [
    { number: '911', region: 'Mexico/Latin America', label: '911 (Mexico/Latin America)' },
    { number: '112', region: 'International', label: '112 (International)' }
  ],
  'pt': [
    { number: '112', region: 'Portugal/Europe', label: '112 (Portugal)' }
  ],
  'pt-BR': [
    { number: '192', region: 'Brazil (Ambulance)', label: '192 (Brazil)' },
    { number: '193', region: 'Brazil (Fire)', label: '193 (Fire)' },
    { number: '190', region: 'Brazil (Police)', label: '190 (Police)' }
  ],
  'vi': [
    { number: '115', region: 'Vietnam (Ambulance)', label: '115 (Vietnam)' }
  ],
  'th': [
    { number: '1669', region: 'Thailand (Ambulance)', label: '1669 (Thailand)' },
    { number: '191', region: 'Thailand (Police)', label: '191 (Police)' }
  ],
  'fr': [
    { number: '112', region: 'France/Europe', label: '112 (France)' },
    { number: '15', region: 'France (SAMU)', label: '15 (SAMU)' }
  ],
  'de': [{ number: '112', region: 'Germany/Europe', label: '112 (Germany)' }],
  'it': [{ number: '112', region: 'Italy/Europe', label: '112 (Italy)' }],
  'nl': [{ number: '112', region: 'Netherlands/Europe', label: '112 (Netherlands)' }],
  'pl': [{ number: '112', region: 'Poland/Europe', label: '112 (Poland)' }],
  'tr': [{ number: '112', region: 'Turkey', label: '112 (Turkey)' }],
  'ja': [{ number: '119', region: 'Japan', label: '119 (Japan)' }],
  'ko': [{ number: '119', region: 'South Korea', label: '119 (South Korea)' }],
  'zh': [{ number: '120', region: 'China', label: '120 (China)' }],
  'hi': [{ number: '102', region: 'India', label: '102 (Ambulance)' }],
  'ar': [{ number: '997', region: 'Saudi Arabia', label: '997 (Ambulance)' }],
};

export const getEmergencyNumbers = (langCode: string = 'en'): EmergencyNumberInfo[] => {
  // Try exact match first (e.g., 'es-419' or 'pt-BR')
  if (emergencyNumbers[langCode]) {
    return emergencyNumbers[langCode];
  }
  
  // Fallback to base language code (e.g., 'en', 'es', 'vi')
  const baseCode = langCode.split('-')[0].toLowerCase();
  return emergencyNumbers[baseCode] || emergencyNumbers['en'];
};

export const getEmergencyNumber = (langCode: string = 'en'): string => {
  const numbers = getEmergencyNumbers(langCode);
  return numbers[0].number;
};