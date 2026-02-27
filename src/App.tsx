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
import PageTemplate from "./pages/PageTemplate"; // Import the new PageTemplate

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/select-allergens" element={<AllergenSelectionPage />} />
          <Route path="/select-language" element={<LanguageSelectionPage />} />
          <Route path="/alert/:langCode" element={<AllergyAlertPage />} />
          <Route path="/page-template" element={<PageTemplate />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;