# Changelog

All notable changes to Simple Allergy Alert are documented here, newest first. Versions correspond to `versionName` in `android/app/build.gradle`.

## [1.3.9] - 2026-08-04
- Swipe navigation added between saved allergy cards and the emergency card, with UI separation and border cues for the active card
- Several rounds of swipe-gesture fixes, including recovering to the correct card after an emergency-card swipe
- "Your Cards" action menu redesigned
- Promo-code redemption count added to admin

## [1.3.8] - 2026-07-29
- Marketing site polish: carousel, header, FAQ, legal-page, and SEO refinements
- Social links added (Facebook, Instagram)

## [1.3.7] - 2026-07-27
- Realtime Android install/purchase tracking with an offline retry queue
- Pre-launch test traffic excluded from admin totals

## [1.3.2] - [1.3.6] - 2026-07-24 - 2026-07-26
- Affiliate payout summary endpoint and admin view added
- Admin restructured into Total Traffic + Affiliate Traffic sections
- Play Store installs/purchases and web-app opens added to affiliate reporting
- GA4 metrics deduplicated by transaction ID and cut off at the current date to exclude test noise
- Marketing site merged into this repository

## [1.3.1] - 2026-07-23
- Custom allergen images added — upload from device or pull from a web search — with cropping and backup support
- Restore-purchase flow tied to backup restore
- Home-screen menu added
- Android 12-and-below splash-screen fix

## [1.3.0] - 2026-07-22
- German emergency-number verification
- SEO pass
- Chrome share and restore-purchase fixes

## [1.2.2] - [1.2.3] - 2026-07-21
- iOS card save, on-device backup, and a "Protect Your Cards" flow added to Android
- Install-source detection (Play Store vs. Safari) with copy/paste backup support
- Play Store clipboard and toast-interaction bugs fixed

## [1.2.1] - 2026-07-17
- Affiliate link tracking set up end-to-end
- Promo-code management system added
- New `/admin` dashboard moved from the marketing site into the app itself

## [1.2.0] - 2026-07-10
- "Understand Your Card" onboarding explainer added

## [1.1.4] - 2026-07-08
- Symbol table upload for Play Console crash de-obfuscation
- Allergen name added to downloaded file names

## [1.1.3] - 2026-06-18 to 2026-07-07
- Security pass: removed hardcoded secrets (Firebase config, Lemon Squeezy keys) from the client, hardened purchase-verification endpoints against forged premium flags, added CORS/security headers and API rate limiting
- Full hardcoded allergen translation dictionary rebuilt — pruned unreliable auto-translated languages (Sesotho, Zulu, Hawaiian, Hausa, Scots Gaelic, Irish, Welsh, Yoruba), added reverse-translation display on the card
- Emergency card text fully hardcoded per language instead of live-translated
- Individual allergen images made viewable by tapping a pill
- Automated translation-verification test suite added
- Free tier expanded to allow saving 1 card

> A short-lived v1.1.0–v1.1.2 branch (early June 2026) was rolled back to v1.0.6 after testing and superseded by the work above.

## [1.0.7] - 2026-06-01
- Product Hunt launch promo code
- Android `AD_ID` manifest permission for ad-attribution compliance

## [1.0.6] - 2026-05-15 to 2026-05-21
- Firebase Crashlytics and Analytics wired up for the Android app and web
- Nitro/Vite build pipeline overhauled for Capacitor compatibility (HashRouter, prerendering, custom asset copy step)
- Home screen animation pass with Framer Motion
- Saved-card limit raised to 10

## [1.0.5] - 2026-04-23
- Read Aloud added to the allergy card, first via Web Speech API, then native Text-to-Speech for offline/mobile reliability
- Dedicated Premium onboarding page with localized pricing and a promo-code unlock path

## [1.0.3] - [1.0.4] - 2026-03-12 to 2026-04-23
- Allergen selection redesigned as a card-based grid
- Onboarding made swipeable
- Emergency-number verification step added
- Allergen list expanded and reorganized
- Play Store billing integrated for a premium unlock — free vs. premium feature split (saved cards, custom alert text) introduced

## [1.0.2] - 2026-03-12
- Android home-screen widget added, with deep linking into saved cards
- Storage migrated to Capacitor Preferences
- "Save Card" added to the Emergency page
- Dedicated emergency card slot separate from the regular saved-cards list

## [1.0.1] - [1.0.2] - 2026-03-04
- Regional Spanish (Spain vs. Latin America) translation overrides
- Native share/download via Capacitor
- System status-bar theming

## [1.0] - 2026-03-03
- First versioned Android build
- Edge-to-edge layout for Android 15
- Safe-area support

## Foundation - 2025-12-27 to 2026-03-03
Pre-release buildout before Android versioning began:
- Core allergy card built: allergen selection grid, custom allergens, multi-language translation with a verified allergen dictionary
- Card actions added: share, download, print, and a "translated to [language]" attribution line
- Emergency Page created — dial button, per-country emergency numbers, share/download of the emergency card
- Saved cards (up to 3) with naming, offline access, and a swipeable carousel
- Multi-step onboarding flow, burger menu, PWA manifest for installability
