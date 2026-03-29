// Ensure newCard matches SavedCard shape
const newCard: SavedCard = {
  id: isEmergency ? 'emergency-slot' : crypto.randomUUID(),
  selectedAllergens,
  customMessages,
  languageCode,
  createdAt: new Date().toISOString(),
};