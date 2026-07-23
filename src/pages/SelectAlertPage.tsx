"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Crown, RotateCcw, WifiOff, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import SaveAlertPresetDialog from '@/components/SaveAlertPresetDialog';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { useBilling } from '@/hooks/useBilling';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { DEFAULT_CUSTOM_MESSAGES } from '@/lib/customMessages';
import { getCustomAlertPresets, saveCustomAlertPreset, deleteCustomAlertPreset, MAX_CUSTOM_ALERT_PRESETS } from '@/lib/customAlertPresets';
import { CustomAlertPreset } from '@/lib/types';
import { cn } from '@/lib/utils';
import { usePageSEO } from '@/hooks/usePageSEO';

const SelectAlertPage = () => {
  usePageSEO({ title: 'Customise Alerts | Simple Allergy Alert' });

  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
  const { isPremium } = useBilling();
  const isOnline = useNetworkStatus();
  const [iAmAllergicTo, setIAmAllergicTo] = useState(DEFAULT_CUSTOM_MESSAGES.iAmAllergicTo);
  const [theyMakeMeSick, setTheyMakeMeSick] = useState(DEFAULT_CUSTOM_MESSAGES.theyMakeMeSick);
  const [presets, setPresets] = useState<CustomAlertPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      const savedAlert = await storage.get<any>(STORAGE_KEYS.CUSTOM_MESSAGES);
      if (savedAlert) {
        if (savedAlert.iAmAllergicTo !== undefined && savedAlert.iAmAllergicTo !== null) {
          setIAmAllergicTo(savedAlert.iAmAllergicTo);
        }
        if (savedAlert.theyMakeMeSick !== undefined && savedAlert.theyMakeMeSick !== null) {
          setTheyMakeMeSick(savedAlert.theyMakeMeSick);
        }
      }
    };
    loadMessages();
    getCustomAlertPresets().then(setPresets);
  }, []);

  const selectedPreset = presets.find((p) => p.id === selectedPresetId) || null;

  const matchesDefaults = iAmAllergicTo === DEFAULT_CUSTOM_MESSAGES.iAmAllergicTo
    && theyMakeMeSick === DEFAULT_CUSTOM_MESSAGES.theyMakeMeSick;

  // Autosave: while a preset is active (selected), any edit to the fields
  // writes straight through to that preset - no separate save step. Editing
  // without an active preset is normal behaviour (just local state, only
  // persisted as the active alert text when Continue is pressed).
  useEffect(() => {
    if (!selectedPreset) return;
    if (iAmAllergicTo === selectedPreset.iAmAllergicTo && theyMakeMeSick === selectedPreset.theyMakeMeSick) return;
    const updated = { ...selectedPreset, iAmAllergicTo, theyMakeMeSick };
    saveCustomAlertPreset(updated).then(setPresets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iAmAllergicTo, theyMakeMeSick, selectedPresetId]);

  const handleResetBoth = () => {
    setIAmAllergicTo(DEFAULT_CUSTOM_MESSAGES.iAmAllergicTo);
    setTheyMakeMeSick(DEFAULT_CUSTOM_MESSAGES.theyMakeMeSick);
  };

  const handleSelectPreset = (preset: CustomAlertPreset) => {
    setSelectedPresetId(preset.id);
    setIAmAllergicTo(preset.iAmAllergicTo);
    setTheyMakeMeSick(preset.theyMakeMeSick);
  };

  const handleDeletePreset = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = await deleteCustomAlertPreset(id);
    setPresets(updated);
    if (selectedPresetId === id) {
      setSelectedPresetId(null);
    }
  };

  const handleActionTileClick = () => {
    if (presets.length >= MAX_CUSTOM_ALERT_PRESETS) {
      toast.error(`You can save up to ${MAX_CUSTOM_ALERT_PRESETS} custom alerts. Delete one to add another.`);
      return;
    }
    setIsSaveDialogOpen(true);
  };

  const handleSaveNewPreset = async (name: string) => {
    const newPreset: CustomAlertPreset = {
      id: crypto.randomUUID(),
      name,
      iAmAllergicTo,
      theyMakeMeSick,
    };
    const updated = await saveCustomAlertPreset(newPreset);
    setPresets(updated);
    setSelectedPresetId(newPreset.id);
    setIsSaveDialogOpen(false);
    toast.success(`"${name}" saved.`);
  };

  const hasCustomAlertText = iAmAllergicTo !== DEFAULT_CUSTOM_MESSAGES.iAmAllergicTo || theyMakeMeSick !== DEFAULT_CUSTOM_MESSAGES.theyMakeMeSick;
  const blockedOffline = !isOnline && hasCustomAlertText;

  const handleContinue = async () => {
    if (Capacitor.isNativePlatform()) {
      FirebaseAnalytics.logEvent({
        name: 'custom_alerts_confirmed',
        params: {
          primary_text: iAmAllergicTo.substring(0, 100),
          secondary_text: theyMakeMeSick.substring(0, 100)
        }
      });
    }

    await storage.remove(STORAGE_KEYS.SESSION_TRANSLATIONS);
    
    await storage.set(
      STORAGE_KEYS.CUSTOM_MESSAGES,
      {
        iAmAllergicTo,
        theyMakeMeSick,
      },
    );
    navigate(returnTo || '/select-language');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />

      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(80px+env(safe-area-inset-top)+10px)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-grow pt-2"
        >
          <StepHeader
            title="Customise Alerts"
            description="Personalise the alert messages that will appear on the card."
          />

          {isPremium && (
            <div className="flex flex-wrap gap-2 px-2 pt-4">
              <div
                onClick={handleActionTileClick}
                className="relative flex items-center justify-center min-w-[60px] px-2 py-4 rounded-xl shadow-sm cursor-pointer transition-all duration-200 border-2 text-center bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-red-200 dark:hover:border-red-900/30"
              >
                <span className="absolute top-0.5 right-0.5 p-0.5 text-gray-400">
                  <Plus className="w-3 h-3" />
                </span>
                <span className="text-[12px] font-bold leading-tight px-1">New</span>
              </div>

              {presets.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={cn(
                      "relative flex items-center justify-center min-w-[60px] px-2 py-4 rounded-xl shadow-sm cursor-pointer transition-all duration-200 border-2 text-center",
                      isSelected
                        ? "bg-red-600 border-red-600 text-white"
                        : "bg-white dark:bg-gray-800 border-transparent text-gray-700 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-900/30"
                    )}
                  >
                    <button
                      onClick={(e) => handleDeletePreset(e, preset.id)}
                      className={cn(
                        "absolute top-0.5 right-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors",
                        isSelected ? "text-white" : "text-gray-400"
                      )}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="text-[12px] font-bold leading-tight px-1">{preset.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="w-full text-left pt-8 pb-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-2">
                  <Label
                    htmlFor="allergic-to"
                    className="text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Primary Alert
                  </Label>
                  <button
                    type="button"
                    onClick={handleResetBoth}
                    disabled={!isPremium || matchesDefaults}
                    className="flex items-center gap-1 text-xs font-bold uppercase text-red-600 hover:text-red-700 disabled:opacity-40 disabled:text-gray-400 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
                <textarea
                  id="allergic-to"
                  value={iAmAllergicTo}
                  onChange={(e) => setIAmAllergicTo(e.target.value)}
                  disabled={!isPremium}
                  placeholder="e.g. I can not eat:"
                  className="w-[calc(100%-20px)] mx-[10px] px-4 py-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 min-h-[80px] resize-y disabled:opacity-70"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="make-me-sick"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2"
                >
                  Secondary Alert
                </Label>
                <textarea
                  id="make-me-sick"
                  value={theyMakeMeSick}
                  onChange={(e) => setTheyMakeMeSick(e.target.value)}
                  disabled={!isPremium}
                  placeholder="e.g. It will make me seriously ill..."
                  className="w-[calc(100%-20px)] mx-[10px] px-4 py-3 text-base sm:text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-gray-200 min-h-[80px] resize-y disabled:opacity-70"
                />
              </div>
            </div>

            {!isPremium && (
              <button
                onClick={() => navigate('/premium-onboarding', { state: { premiumReturnTo: location.pathname } })}
                className="mt-6 w-full flex items-center justify-center gap-2 text-amber-600 font-bold text-sm hover:underline"
              >
                <Crown className="h-4 w-4" />
                Unlock Custom Alerts
              </button>
            )}
          </div>
        </motion.div>

        <SaveAlertPresetDialog
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          onSave={handleSaveNewPreset}
        />

        {blockedOffline && (
          <div className="mx-auto max-w-md mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-200 text-center shrink-0">
            <WifiOff className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Offline: Custom alert text requires an internet connection to translate. Reset them or reconnect to continue.
            </p>
          </div>
        )}

        <div className="w-full flex justify-between items-center mt-auto mb-[calc(12px+env(safe-area-inset-bottom))] pt-6 gap-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center py-3 px-8 h-auto min-w-[140px] rounded-xl bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={blockedOffline}
            variant="primary"
            className="py-3 px-8 text-lg h-auto w-[180px] rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectAlertPage;