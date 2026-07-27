import { Suspense, lazy, useEffect, Component, ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePreloadImages } from "./hooks/usePreloadImages";
import { Loader2 } from "lucide-react";
import { storage, STORAGE_KEYS } from "./lib/storage";
import { useDeepLinks } from "./hooks/useDeepLinks";
import { usePendingBackupRestore } from "./hooks/usePendingBackupRestore";
import { initBilling } from "./lib/billing";
import { captureAffiliateRef, consumeInstallReferrerRef } from "./lib/affiliate";
import { sendTrackEvent, sendOrQueueTrackEvent, getOrCreatePersistedEventId } from "./lib/trackEvent";
import { useTrackEventQueueFlush } from "./hooks/useTrackEventQueueFlush";
import { BillingProvider } from "./hooks/useBilling";
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import "./lib/firebase-web"; // Initialize Firebase for Web

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LanguageSelectionPage = lazy(() => import("./pages/LanguageSelectionPage"));
const AllergyAlertPage = lazy(() => import("./pages/AllergyAlertPage"));
const AllergenSelectionPage = lazy(() => import("./pages/AllergenSelectionPage"));
const SelectAlertPage = lazy(() => import("./pages/SelectAlertPage"));
const EmergencyPage = lazy(() => import("./pages/EmergencyPage"));
const PageTemplate = lazy(() => import("./pages/PageTemplate"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PremiumOnboarding = lazy(() => import("./pages/PremiumOnboarding"));
import PremiumSuccess from "./pages/PremiumSuccess";

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Something went wrong.</p>
          <p className="text-sm text-red-600 font-mono break-all max-w-md">{err.message}</p>
          <button
            className="text-sm text-red-600 underline"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
  </div>
);

const AppContent = () => {
  usePreloadImages();
  useDeepLinks();
  usePendingBackupRestore();
  useTrackEventQueueFlush();

  useEffect(() => {
    // Initialize billing system
    initBilling();

    // Reduce the chance Safari auto-evicts saved cards after inactivity.
    if (Capacitor.getPlatform() === 'web' && navigator.storage?.persist) {
      navigator.storage.persist();
    }

    // Affiliate ref capture must not depend on Firebase Analytics succeeding
    // - an ad blocker or missing config can make every FirebaseAnalytics call
    // below throw, and this write is the load-bearing one for payout
    // tracking, so it runs synchronously and unconditionally up front.
    const urlRef = new URLSearchParams(window.location.search).get('ref');
    const ref = captureAffiliateRef();

    const initFirebase = async () => {
      try {
        // Enable analytics for all platforms (Web uses the JS SDK initialized above)
        await FirebaseAnalytics.setEnabled({ enabled: true });

        // Crashlytics is native-only
        if (Capacitor.isNativePlatform()) {
          await FirebaseCrashlytics.setEnabled({ enabled: true });
        }

        // Log app open event for all platforms
        await FirebaseAnalytics.logEvent({
          name: 'app_open',
          params: { platform: Capacitor.getPlatform() }
        });

        // Only log a fresh "landing" event when ?ref= is actually present on
        // this pageload, not on every subsequent app open.
        if (ref && urlRef) {
          await FirebaseAnalytics.setUserProperty({ key: 'acquisition_ref', value: ref });
          await FirebaseAnalytics.logEvent({ name: 'campaign_landing', params: { ref } });

          // Parallel real-time pipeline alongside GA4/Firebase (unaffected
          // above) - lets the admin dashboard show web opens within seconds
          // instead of GA4's ~24-48h processing lag.
          if (Capacitor.getPlatform() === 'web') {
            void sendTrackEvent({ event: 'landing', ref, platform: 'web', eventId: crypto.randomUUID() });
          }
        }

        // Android has no ?ref= in its cold-start URL - MainActivity.java reads
        // the Play Install Referrer instead and drops it into Capacitor
        // storage. That native read can still be in flight on the very first
        // cold start, so retry once after a short delay before giving up; a
        // later app open will pick it up regardless since the native side
        // only ever writes it once per install.
        if (Capacitor.getPlatform() === 'android') {
          let installRef = await consumeInstallReferrerRef();
          if (!installRef) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            installRef = await consumeInstallReferrerRef();
          }

          if (installRef) {
            await FirebaseAnalytics.setUserProperty({ key: 'acquisition_ref', value: installRef });
            await FirebaseAnalytics.logEvent({ name: 'campaign_landing', params: { ref: installRef } });

            // Same real-time Redis pipeline as the web landing case above.
            // eventId is persisted (not re-generated) so that if this POST
            // fails offline, the retry queue's flush later reuses the exact
            // same id - installRef itself is only ever available this one
            // time (consumeInstallReferrerRef() clears the native-written
            // key after this read), so the queue is the only retry path.
            const installEventId = await getOrCreatePersistedEventId('installTrackEventId');
            await sendOrQueueTrackEvent({ event: 'install', ref: installRef, platform: 'android', eventId: installEventId });
          }
        }
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    };

    initFirebase();

    const migrate = async () => {
      const hasMigrated = await storage.get(STORAGE_KEYS.HAS_MIGRATED);
      if (hasMigrated) return;

      const keysToMigrate = [
        'savedAllergyCards',
        'selectedAllergens',
        'customAlertMessages',
        'selectedLanguageCode',
        'currentSessionTranslations'
      ];

      for (const key of keysToMigrate) {
        const value = localStorage.getItem(key);
        if (value) {
          await storage.set(key, value);
        }
      }

      await storage.set(STORAGE_KEYS.HAS_MIGRATED, 'true');
    };

    migrate();
  }, []);
  
  return (
    <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/premium-onboarding" element={<PremiumOnboarding />} />
        <Route path="/premium-success" element={<PremiumSuccess />} />
        <Route path="/select-allergens" element={<AllergenSelectionPage />} />
        <Route path="/select-alert" element={<SelectAlertPage />} />
        <Route path="/select-language" element={<LanguageSelectionPage />} />
        <Route path="/alert/:langCode" element={<AllergyAlertPage />} />
        <Route path="/emergency/:langCode" element={<EmergencyPage />} />
        <Route path="/page-template" element={<PageTemplate />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BillingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner
          duration={2000}
          position="top-center"
          offset={{ top: "calc(env(safe-area-inset-top) + 90px)" }}
          mobileOffset={{ top: "calc(env(safe-area-inset-top) + 90px)" }}
        />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </BillingProvider>
  </QueryClientProvider>
);

export default App;