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
  'es-ES': [
    { number: '112', region: 'Spain', label: '112 (Spain)' }
  ],
  'es-419': [
    { number: '911', region: 'Mexico', label: '911 (Mexico)' },
    { number: '107', region: 'Argentina', label: '107 (Argentina)' },
    { number: '131', region: 'Chile', label: '131 (Chile)' },
    { number: '123', region: 'Colombia', label: '123 (Colombia)' },
    { number: '106', region: 'Peru', label: '106 (Peru)' },
    { number: '911', region: 'Venezuela', label: '911 (Venezuela)' },
    { number: '911', region: 'Ecuador', label: '911 (Ecuador)' },
    { number: '118', region: 'Bolivia', label: '118 (Bolivia)' },
    { number: '105', region: 'Uruguay', label: '105 (Uruguay)' },
    { number: '141', region: 'Paraguay', label: '141 (Paraguay)' },
    { number: '911', region: 'Costa Rica', label: '911 (Costa Rica)' },
    { number: '911', region: 'Panama', label: '911 (Panama)' },
    { number: '911', region: 'Dominican Republic', label: '911 (Dominican Republic)' },
    { number: '122', region: 'Guatemala', label: '122 (Guatemala)' },
    { number: '199', region: 'Honduras', label: '199 (Honduras)' },
    { number: '128', region: 'Nicaragua', label: '128 (Nicaragua)' },
    { number: '132', region: 'El Salvador', label: '132 (El Salvador)' },
    { number: '104', region: 'Cuba', label: '104 (Cuba)' }
  ],
  'pt-PT': [
    { number: '112', region: 'Portugal', label: '112 (Portugal)' },
    { number: '111', region: 'Angola', label: '111 (Angola)' },
    { number: '117', region: 'Mozambique', label: '117 (Mozambique)' },
    { number: '130', region: 'Cape Verde', label: '130 (Cape Verde)' },
    { number: '112', region: 'São Tomé & Príncipe', label: '112 (São Tomé & Príncipe)' },
    { number: '110', region: 'Timor-Leste', label: '110 (Timor-Leste)' }
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
    { number: '112', region: 'France', label: '112 (France)' },
    { number: '112', region: 'Belgium', label: '112 (Belgium)' },
    { number: '112', region: 'Luxembourg', label: '112 (Luxembourg)' },
    { number: '144', region: 'Switzerland', label: '144 (Switzerland)' },
    { number: '911', region: 'Canada', label: '911 (Canada)' },
    { number: '112', region: 'Monaco', label: '112 (Monaco)' }
  ],
  'de': [
    { number: '112', region: 'Germany', label: '112 (Germany)' },
    { number: '144', region: 'Austria', label: '144 (Austria)' },
    { number: '144', region: 'Switzerland', label: '144 (Switzerland)' },
    { number: '144', region: 'Liechtenstein', label: '144 (Liechtenstein)' }
  ],
  'it': [
    { number: '112', region: 'Italy', label: '112 (Italy)' },
    { number: '144', region: 'Switzerland', label: '144 (Switzerland)' },
    { number: '118', region: 'San Marino', label: '118 (San Marino)' },
    { number: '112', region: 'Vatican City', label: '112 (Vatican City)' }
  ],
  'nl': [
    { number: '112', region: 'Netherlands', label: '112 (Netherlands)' },
    { number: '112', region: 'Belgium', label: '112 (Belgium)' }
  ],
  'pl': [{ number: '112', region: 'Poland', label: '112 (Poland)' }],
  'tr': [{ number: '112', region: 'Turkey', label: '112 (Turkey)' }],
  'ja': [{ number: '119', region: 'Japan', label: '119 (Japan)' }],
  'ko': [{ number: '119', region: 'South Korea', label: '119 (South Korea)' }],
  'zh-CN': [{ number: '120', region: 'China', label: '120 (China)' }],
  'yue': [
    { number: '999', region: 'Hong Kong', label: '999 (Hong Kong)' },
    { number: '999', region: 'Macau', label: '999 (Macau)' }
  ],
  'hi': [
    { number: '112', region: 'India', label: '112 (India)' },
    { number: '102', region: 'India (Ambulance)', label: '102 (Ambulance)' }
  ],
  'ar': [
    { number: '123', region: 'Egypt', label: '123 (Egypt)' },
    { number: '997', region: 'Saudi Arabia', label: '997 (Saudi Arabia)' },
    { number: '998', region: 'UAE', label: '998 (UAE)' },
    { number: '199', region: 'Jordan', label: '199 (Jordan)' },
    { number: '122', region: 'Iraq', label: '122 (Iraq)' },
    { number: '112', region: 'Syria', label: '112 (Syria)' },
    { number: '140', region: 'Lebanon', label: '140 (Lebanon)' },
    { number: '150', region: 'Morocco', label: '150 (Morocco)' },
    { number: '14', region: 'Algeria', label: '14 (Algeria)' },
    { number: '190', region: 'Tunisia', label: '190 (Tunisia)' },
    { number: '333', region: 'Sudan', label: '333 (Sudan)' },
    { number: '194', region: 'Yemen', label: '194 (Yemen)' }
  ],
  'af': [
    { number: '112', region: 'South Africa', label: '112 (South Africa)' },
    { number: '112', region: 'Namibia', label: '112 (Namibia)' }
  ],
  'sq': [
    { number: '112', region: 'Albania', label: '112 (Albania)' },
    { number: '194', region: 'Kosovo', label: '194 (Kosovo)' }
  ],
  'am': [
    { number: '911', region: 'Ethiopia', label: '911 (Ethiopia)' },
    { number: '907', region: 'Ethiopia (Addis Ababa Ambulance)', label: '907 (Addis Ababa Ambulance)' }
  ],
  'hy': [{ number: '112', region: 'Armenia', label: '112 (Armenia)' }],
  'az': [{ number: '112', region: 'Azerbaijan', label: '112 (Azerbaijan)' }],
  'eu': [{ number: '112', region: 'Spain', label: '112 (Spain)' }],
  'be': [{ number: '112', region: 'Belarus', label: '112 (Belarus)' }],
  'bn': [
    { number: '999', region: 'Bangladesh', label: '999 (Bangladesh)' },
    { number: '112', region: 'India', label: '112 (India)' }
  ],
  'bs': [{ number: '124', region: 'Bosnia & Herzegovina', label: '124 (Bosnia & Herzegovina)' }],
  'bg': [{ number: '112', region: 'Bulgaria', label: '112 (Bulgaria)' }],
  'ca': [
    { number: '112', region: 'Spain', label: '112 (Spain)' },
    { number: '112', region: 'Andorra', label: '112 (Andorra)' }
  ],
  'ceb': [{ number: '911', region: 'Philippines', label: '911 (Philippines)' }],
  'ny': [{ number: '998', region: 'Malawi', label: '998 (Malawi)' }],
  'co': [{ number: '112', region: 'France', label: '112 (France)' }],
  'hr': [{ number: '112', region: 'Croatia', label: '112 (Croatia)' }],
  'cs': [{ number: '112', region: 'Czech Republic', label: '112 (Czech Republic)' }],
  'da': [{ number: '112', region: 'Denmark', label: '112 (Denmark)' }],
  'et': [{ number: '112', region: 'Estonia', label: '112 (Estonia)' }],
  'tl': [{ number: '911', region: 'Philippines', label: '911 (Philippines)' }],
  'fi': [{ number: '112', region: 'Finland', label: '112 (Finland)' }],
  'fy': [{ number: '112', region: 'Netherlands', label: '112 (Netherlands)' }],
  'gl': [{ number: '112', region: 'Spain', label: '112 (Spain)' }],
  'ka': [{ number: '112', region: 'Georgia', label: '112 (Georgia)' }],
  'el': [
    { number: '112', region: 'Greece', label: '112 (Greece)' },
    { number: '112', region: 'Cyprus', label: '112 (Cyprus)' }
  ],
  'gu': [{ number: '112', region: 'India', label: '112 (India)' }],
  'ht': [{ number: '114', region: 'Haiti', label: '114 (Haiti)' }],
  'iw': [{ number: '101', region: 'Israel (Ambulance)', label: '101 (Israel)' }],
  'hu': [{ number: '112', region: 'Hungary', label: '112 (Hungary)' }],
  'is': [{ number: '112', region: 'Iceland', label: '112 (Iceland)' }],
  'id': [{ number: '112', region: 'Indonesia', label: '112 (Indonesia)' }],
  'jw': [{ number: '112', region: 'Indonesia', label: '112 (Indonesia)' }],
  'su': [{ number: '112', region: 'Indonesia', label: '112 (Indonesia)' }],
  'kn': [{ number: '112', region: 'India', label: '112 (India)' }],
  'kk': [{ number: '112', region: 'Kazakhstan', label: '112 (Kazakhstan)' }],
  'km': [{ number: '119', region: 'Cambodia', label: '119 (Cambodia)' }],
  'ku': [
    { number: '122', region: 'Iraq', label: '122 (Iraq)' },
    { number: '112', region: 'Turkey', label: '112 (Turkey)' },
    { number: '112', region: 'Syria', label: '112 (Syria)' },
    { number: '115', region: 'Iran', label: '115 (Iran)' }
  ],
  'ky': [{ number: '112', region: 'Kyrgyzstan', label: '112 (Kyrgyzstan)' }],
  'lo': [{ number: '195', region: 'Laos', label: '195 (Laos)' }],
  'lv': [{ number: '112', region: 'Latvia', label: '112 (Latvia)' }],
  'lt': [{ number: '112', region: 'Lithuania', label: '112 (Lithuania)' }],
  'lb': [{ number: '112', region: 'Luxembourg', label: '112 (Luxembourg)' }],
  'mk': [{ number: '112', region: 'North Macedonia', label: '112 (North Macedonia)' }],
  'mg': [{ number: '124', region: 'Madagascar', label: '124 (Madagascar)' }],
  'ms': [
    { number: '999', region: 'Malaysia', label: '999 (Malaysia)' },
    { number: '991', region: 'Brunei', label: '991 (Brunei)' }
  ],
  'ml': [{ number: '112', region: 'India', label: '112 (India)' }],
  'mt': [{ number: '112', region: 'Malta', label: '112 (Malta)' }],
  'mi': [{ number: '111', region: 'New Zealand', label: '111 (New Zealand)' }],
  'mr': [{ number: '112', region: 'India', label: '112 (India)' }],
  'mn': [{ number: '103', region: 'Mongolia', label: '103 (Mongolia)' }],
  'my': [{ number: '999', region: 'Myanmar', label: '999 (Myanmar)' }],
  'ne': [{ number: '102', region: 'Nepal', label: '102 (Nepal)' }],
  'no': [{ number: '113', region: 'Norway', label: '113 (Norway)' }],
  'ps': [
    { number: '112', region: 'Afghanistan', label: '112 (Afghanistan)' },
    { number: '1122', region: 'Pakistan', label: '1122 (Pakistan)' }
  ],
  'fa': [
    { number: '115', region: 'Iran', label: '115 (Iran)' },
    { number: '112', region: 'Afghanistan', label: '112 (Afghanistan)' }
  ],
  'pa': [
    { number: '112', region: 'India', label: '112 (India)' },
    { number: '1122', region: 'Pakistan', label: '1122 (Pakistan)' }
  ],
  'ro': [
    { number: '112', region: 'Romania', label: '112 (Romania)' },
    { number: '112', region: 'Moldova', label: '112 (Moldova)' }
  ],
  'ru': [
    { number: '112', region: 'Russia', label: '112 (Russia)' },
    { number: '112', region: 'Belarus', label: '112 (Belarus)' },
    { number: '112', region: 'Kazakhstan', label: '112 (Kazakhstan)' }
  ],
  'sm': [{ number: '999', region: 'Samoa', label: '999 (Samoa)' }],
  'sr': [
    { number: '194', region: 'Serbia', label: '194 (Serbia)' },
    { number: '124', region: 'Montenegro', label: '124 (Montenegro)' },
    { number: '124', region: 'Bosnia & Herzegovina', label: '124 (Bosnia & Herzegovina)' }
  ],
  'sd': [
    { number: '1122', region: 'Pakistan', label: '1122 (Pakistan)' },
    { number: '112', region: 'India', label: '112 (India)' }
  ],
  'si': [{ number: '1990', region: 'Sri Lanka (Suwa Seriya)', label: '1990 (Sri Lanka)' }],
  'sk': [{ number: '112', region: 'Slovakia', label: '112 (Slovakia)' }],
  'sl': [{ number: '112', region: 'Slovenia', label: '112 (Slovenia)' }],
  'so': [{ number: '999', region: 'Somalia', label: '999 (Somalia)' }],
  'sw': [
    { number: '999', region: 'Kenya', label: '999 (Kenya)' },
    { number: '112', region: 'Tanzania', label: '112 (Tanzania)' },
    { number: '999', region: 'Uganda', label: '999 (Uganda)' }
  ],
  'sv': [{ number: '112', region: 'Sweden', label: '112 (Sweden)' }],
  'tg': [{ number: '112', region: 'Tajikistan', label: '112 (Tajikistan)' }],
  'ta': [
    { number: '112', region: 'India', label: '112 (India)' },
    { number: '1990', region: 'Sri Lanka', label: '1990 (Sri Lanka)' },
    { number: '995', region: 'Singapore', label: '995 (Singapore)' },
    { number: '999', region: 'Malaysia', label: '999 (Malaysia)' }
  ],
  'te': [{ number: '112', region: 'India', label: '112 (India)' }],
  'uk': [{ number: '103', region: 'Ukraine', label: '103 (Ukraine)' }],
  'ur': [
    { number: '1122', region: 'Pakistan', label: '1122 (Pakistan)' },
    { number: '112', region: 'India', label: '112 (India)' }
  ],
  'uz': [{ number: '112', region: 'Uzbekistan', label: '112 (Uzbekistan)' }],
};

// Several languages list the same number for multiple countries (e.g. '911'
// across most of Central America) - without merging, each country renders as
// its own selectable row, so the dialog's RadioGroup highlights every row
// sharing that number as "selected" at once. Only genuine duplicates are
// touched; a number that appears once keeps its original hand-written label.
const consolidateByNumber = (entries: EmergencyNumberInfo[]): EmergencyNumberInfo[] => {
  const groups = new Map<string, EmergencyNumberInfo[]>();
  const order: string[] = [];

  for (const entry of entries) {
    if (!groups.has(entry.number)) {
      order.push(entry.number);
      groups.set(entry.number, []);
    }
    groups.get(entry.number)!.push(entry);
  }

  return order.map((number) => {
    const group = groups.get(number)!;
    if (group.length === 1) {
      return group[0];
    }

    const regions = group.map((g) => g.region).filter(Boolean) as string[];
    return {
      number,
      region: regions.join(', '),
      label: `${number} (${regions.join(', ')})`,
    };
  });
};

export const getEmergencyNumbers = (langCode: string = 'en'): EmergencyNumberInfo[] => {
  // Try exact match first (e.g., 'es-419' or 'pt-BR')
  if (emergencyNumbers[langCode]) {
    return consolidateByNumber(emergencyNumbers[langCode]);
  }

  // Fallback to base language code (e.g., 'en', 'es', 'vi')
  const baseCode = langCode.split('-')[0].toLowerCase();
  return consolidateByNumber(emergencyNumbers[baseCode] || emergencyNumbers['en']);
};

export const getEmergencyNumber = (langCode: string = 'en'): string => {
  const numbers = getEmergencyNumbers(langCode);
  return numbers[0].number;
};
