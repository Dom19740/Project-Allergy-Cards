import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AllergenSelectionPage from './pages/AllergenSelectionPage';
import SelectAlertPage from './pages/SelectAlertPage';
import SelectLanguagePage from './pages/SelectLanguagePage';
import AllergyCard from './pages/AllergyCard';
import EmergencyPage from './pages/EmergencyPage';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/allergen-selection" element={<AllergenSelectionPage />} />
        <Route path="/select-alert" element={<SelectAlertPage />} />
        <Route path="/select-language" element={<SelectLanguagePage />} />
        <Route path="/allergy-card" element={<AllergyCard />} />
        <Route path="/emergency" element={<EmergencyPage />} />
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;