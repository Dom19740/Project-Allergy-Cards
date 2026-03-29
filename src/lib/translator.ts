"use client";

export interface SupportedLanguage {
  code: string;
  name: string;
}

export const getAllGoogleLanguages = async (): Promise<SupportedLanguage[]> => {
  try {
    const response = await fetch('/api/translate?languages=1&target=en');
    const data = await response.json();
    return data.languages || [];
  } catch (error) {
    console.error("Failed to fetch languages:", error);
    return [{ code: 'en', name: 'English' }];
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage })
    });
    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};