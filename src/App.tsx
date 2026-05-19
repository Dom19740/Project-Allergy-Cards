import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePreloadImages } from "./hooks/usePreloadImages";
import { Loader2 } from "lucide-react";
import { storage, STORAGE_KEYS } from "./lib/storage";
import { useDeepLinks } from "./hooks/useDeepLinks";
import { initBilling } from "./lib/billing";
import { BillingProvider } from "./hooks/useBilling";
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';

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

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
  </div>
);

const AppContent = () => {
  console.log('--- APP STARTUP ---');
  console.log('Platform:', Capacitor.getPlatform());
  
  usePreloadImages();
  useDeepLinks();

  useEffect(() => {
    // Heartbeat log to verify Logcat is working
    const interval = setInterval(() => {
      console.log('Heartbeat - App is alive:', new Date().toLocaleTimeString());
    }, 3000);

    // Initialize billing system
    initBilling();

    // Initialize Firebase if on native platform
    if (Capacitor.isNativePlatform()) {
      const initFirebase = async () => {
        console.log('Firebase: Starting initialization...');
        try {
          await FirebaseAnalytics.setEnabled({ enabled: true });
          console.log('Firebase: Analytics enabled');
          
          await FirebaseCrashlytics.setEnabled({ enabled: true });
          console.log('Firebase: Crashlytics enabled');
          
          await FirebaseAnalytics.logEvent({
            name: 'app_open_debug',
            params: { platform: 'android', debug_mode: 'true' }
          });
          console.log('Firebase: Test event logged successfully');
        } catch (error) {
          console.error('Firebase: Initialization error:', error);
        }
      };
      initFirebase();
    }

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
      console.log('Migration: LocalStorage to Preferences completed');
    };

    migrate();

    return () => clearInterval(interval);
  }, []);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/premium-onboarding" element={<PremiumOnboarding />} />
        <Route path="/select-allergens" element={<AllergenSelectionPage />} />
        <Route path="/select-alert" element={<SelectAlertPage />} />
        <Route path="/select-language" element={<LanguageSelectionPage />} />
        <Route path="/alert/:langCode" element={<AllergyAlertPage />} />
        <Route path="/emergency/:langCode" element={<EmergencyPage />} />
        <Route path="/page-template" element={<PageTemplate />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BillingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner duration={2000} />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </BillingProvider>
  </QueryClientProvider>
);

export default App;