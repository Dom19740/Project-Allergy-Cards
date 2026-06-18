import { Suspense, lazy, useEffect, Component, ReactNode } from "react";
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

  useEffect(() => {
    // Initialize billing system
    initBilling();

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
        <Sonner duration={2000} />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </BillingProvider>
  </QueryClientProvider>
);

export default App;