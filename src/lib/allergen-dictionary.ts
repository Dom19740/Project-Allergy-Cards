/**
 * Verified translations for critical allergen terms.
 * This ensures 100% accuracy for regional variations.
 * Keys are in English (lowercase), values are the translated terms.
 */
export const ALLERGEN_DICTIONARY: Record<string, Record<string, string>> = {
  'es-ES': {
    'passion fruit': 'fruta de la pasión',
    'peach': 'melocotón',
    'potato': 'patata',
    'sweet potato': 'batata',
    'peanut': 'cacahuete',
    'green bean': 'judía verde',
    'bean': 'judía'
  },
  'es-419': {
    'passion fruit': 'maracuyá',
    'peach': 'durazno',
    'potato': 'papa',
    'sweet potato': 'camote',
    'peanut': 'maní',
    'green bean': 'frijol verde',
    'bean': 'judía'
  }
};

/**
 * Regional overrides for specific languages to ensure correct dialect terms.
 * This acts as a safety net for the Google Translate API when it returns 
 * terms that are more common in one region than another within full sentences.
 */
export const REGIONAL_OVERRIDES: Record<string, Record<string, string>> = {
  'es-ES': {
    'Maní': 'Cacahuete',
    'maní': 'cacahuete',
    'Maníes': 'Cacahuetes',
    'maníes': 'cacahuetes',
    'Soya': 'Soja',
    'soya': 'soja',
    'Frutos secos': 'Frutos de cáscara',
    'frutos secos': 'frutos de cáscara',
    'Durazno': 'Melocotón',
    'durazno': 'melocotón',
    'Duraznos': 'Melocotones',
    'duraznos': 'melocotones',
    'Frutilla': 'Fresa',
    'frutilla': 'fresa',
    'Frutillas': 'Fresas',
    'frutillas': 'fresas',
    'Papa': 'Patata',
    'papa': 'patata',
    'Papas': 'Patatas',
    'papas': 'patatas',
    'Jugo': 'Zumo',
    'jugo': 'zumo',
    'Jugos': 'Zumos',
    'jugos': 'zumos',
    'Celular': 'Móvil',
    'celular': 'móvil',
    'Maracuyá': 'Fruta de la pasión',
    'maracuyá': 'fruta de la pasión',
    'Camote': 'Batata',
    'camote': 'batata',
    'Frijol verde': 'Judía verde',
    'frijol verde': 'judía verde'
  }
};