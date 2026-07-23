import { storage, STORAGE_KEYS } from '@/lib/storage';
import { CustomAlertPreset } from '@/lib/types';

export const MAX_CUSTOM_ALERT_PRESETS = 10;

export async function getCustomAlertPresets(): Promise<CustomAlertPreset[]> {
  return (await storage.get<CustomAlertPreset[]>(STORAGE_KEYS.CUSTOM_ALERT_PRESETS)) || [];
}

export async function saveCustomAlertPreset(preset: CustomAlertPreset): Promise<CustomAlertPreset[]> {
  const presets = await getCustomAlertPresets();
  const index = presets.findIndex((p) => p.id === preset.id);
  const updated = index >= 0
    ? presets.map((p) => (p.id === preset.id ? preset : p))
    : [...presets, preset];
  await storage.set(STORAGE_KEYS.CUSTOM_ALERT_PRESETS, updated);
  return updated;
}

export async function deleteCustomAlertPreset(id: string): Promise<CustomAlertPreset[]> {
  const presets = await getCustomAlertPresets();
  const updated = presets.filter((p) => p.id !== id);
  await storage.set(STORAGE_KEYS.CUSTOM_ALERT_PRESETS, updated);
  return updated;
}
