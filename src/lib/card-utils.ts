"use client";

export const shareCard = async (selectedAllergens: string[], customMessages: string[], languageCode: string) => {
  console.log("Sharing card:", { selectedAllergens, customMessages, languageCode });
};

export const downloadCard = async (selectedAllergens: string[], customMessages: string[], languageCode: string) => {
  console.log("Downloading card:", { selectedAllergens, customMessages, languageCode });
};

export const printCard = (selectedAllergens: string[], customMessages: string[], languageCode: string) => {
  console.log("Printing card:", { selectedAllergens, customMessages, languageCode });
};