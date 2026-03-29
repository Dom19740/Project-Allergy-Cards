"use client";

import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LanguageSelectionPage = lazy(() => import("./pages/LanguageSelectionPage"));
const AllergyAlertPage = lazy(() => import("./pages/AllergyAlertPage"));
const AllergenSelectionPage = lazy(() => import("./pages/AllergenSelectionPage"));
const SelectAlertPage = lazy(() => import("./pages/SelectAlertPage"));
const EmergencyPage = lazy(() => import("./pages/EmergencyPage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <BrowserRouter>
            <Suspense 
              fallback={
                <div className="flex h-screen w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/select-allergens" element={<AllergenSelectionPage />} />
                <Route path="/select-alert" element={<SelectAlertPage />} />
                <Route path="/select-language" element={<LanguageSelectionPage />} />
                <Route path="/alert/:langCode" element={<AllergyAlertPage />} />
                <Route path="/emergency/:langCode" element={<EmergencyPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
          <Sonner position="top-center" />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;