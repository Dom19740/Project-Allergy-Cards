"use client";

import { CustomMessages } from './types';

export const DEFAULT_CUSTOM_MESSAGES: CustomMessages = {
  iAmAllergicTo: "I can not eat:",
  theyMakeMeSick: "They make me very sick and I could die",
};

export const resolveCustomMessages = (saved: Partial<CustomMessages> | null | undefined): CustomMessages => ({
  iAmAllergicTo: saved?.iAmAllergicTo !== undefined && saved?.iAmAllergicTo !== null
    ? saved.iAmAllergicTo
    : DEFAULT_CUSTOM_MESSAGES.iAmAllergicTo,
  theyMakeMeSick: saved?.theyMakeMeSick !== undefined && saved?.theyMakeMeSick !== null
    ? saved.theyMakeMeSick
    : DEFAULT_CUSTOM_MESSAGES.theyMakeMeSick,
});

// A cached translation is only valid for the exact custom alert text and
// allergen selection it was produced from - caching by language code alone
// let stale (pre-edit) translations silently reappear after a custom
// message or allergen list changed.
export const computeContentSignature = (customMessages: CustomMessages, selectedAllergenIds: string[]): string =>
  JSON.stringify({
    iAmAllergicTo: customMessages.iAmAllergicTo,
    theyMakeMeSick: customMessages.theyMakeMeSick,
    allergenIds: [...selectedAllergenIds].sort(),
  });
