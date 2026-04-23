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
  usePreloadImages();
  useDeepLinks();

  useEffect(() => {
    // Initialize billing system
    initBilling();

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
      console.log('Migration to Preferences completed');
    };

    migrate();
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