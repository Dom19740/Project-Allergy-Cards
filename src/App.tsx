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

// Lazy load pages
const Home = lazy(() => import("./pages/Home").default);
const NotFound = lazy(() => import("./pages/NotFound").default);
const LanguageSelectionPage = lazy(() => import("./pages/LanguageSelectionPage").default);
const AllergyAlertPage = lazy(() => import("./pages/AllergyAlertPage").default);
const AllergenSelectionPage = lazy(() => import("./pages/AllergenSelectionPage").default);
const SelectAlertPage = lazy(() => import("./pages/SelectAlertPage").default);
const EmergencyPage = lazy(() => import("./pages/EmergencyPage").default);
const PageTemplate = lazy(() => import("./pages/PageTemplate").default);
const Onboarding = lazy(() => import("./pages/Onboarding").default);

const queryClient = new QueryClient();

// ... rest of the file remains the same