import { SupportedLanguage } from "./types";

export const getAllGoogleLanguages = async (): Promise<SupportedLanguage[]> => {
  // Implementation would fetch from Google Translate API
  return [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
  ];
};

export const translateFullSentence = async (
  text: string,
  targetLanguage: SupportedLanguage
): Promise<string> => {
  try {
    const parts = text.split(/(?<=\.)/);
    const translatedParts = await Promise.all(
      parts.map(async (part) => {
        const withPeriod = part.endsWith('.') ? part : `${part}.`;
        return await translateText(withPeriod, targetLanguage);
      })
    );
    return translatedParts.join(' ');
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

const translateText = async (
  text: string,
  targetLanguage: SupportedLanguage
): Promise<string> => {
  // Implementation would use Google Translate API
  return text;
};