"use client";

/**
 * Temporarily disable premium billing and entitlements.
 * Set this back to true to restore all existing premium behavior.
 */
export const PREMIUM_FEATURES_ENABLED = false;

export const applyPremiumFeatureAccess = (isPremium: boolean): boolean =>
  !PREMIUM_FEATURES_ENABLED || isPremium;

/**
 * List of language codes available for free users.
 */
export const FREE_LANGUAGES = ['en', 'it', 'es-ES', 'fr', 'de', 'zh-CN'];

/**
 * Premium feature limits
 */
export const PREMIUM_LIMITS = {
  MAX_SAVED_CARDS: 10,
  FREE_MAX_SAVED_CARDS: 1,
};