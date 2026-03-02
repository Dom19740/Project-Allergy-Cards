import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import LanguageSelectionPage from "./pages/LanguageSelectionPage";
import AllergyAlertPage from "./pages/AllergyAlertPage";
import AllergenSelectionPage from "./pages/AllergenSelectionPage";
import SelectAlertPage from "./pages/SelectAlertPage";
import EmergencyPage from "./pages/EmergencyPage";
import PageTemplate from "./pages/PageTemplate";
import { usePreloadImages } from "./hooks/usePreloadImages";

const queryClient = new QueryClient();

const AppContent = () => {
  usePreloadImages();
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/select-allergens" element={<AllergenSelectionPage />} />
      <Route path="/select-alert" element={<SelectAlertPage />} />
      <Route path="/select-language" element={<LanguageSelectionPage />} />
      <Route path="/alert/:langCode" element={<AllergyAlertPage />} />
      <Route path="/emergency/:langCode" element={<EmergencyPage />} />
      <Route path="/page-template" element={<PageTemplate />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;