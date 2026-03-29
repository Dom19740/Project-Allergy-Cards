// Type the retrieved card explicitly
const emergencyCard = await storage.get<SavedCard>(STORAGE_KEYS.SAVED_EMERGENCY_CARD);
if (emergencyCard) {
  setSelectedAllergens(emergencyCard.selectedAllergens);
  setCustomMessages(emergencyCard.customMessages);
  setLanguageCode(emergencyCard.languageCode);
}