import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AllergenSelectionPage from './pages/AllergenSelectionPage';
import SelectAlertPage from './pages/SelectAlertPage';
import LanguageSelectionPage from './pages/LanguageSelectionPage';
import AllergyAlertPage from './pages/AllergyAlertPage';
import EmergencyPage from './pages/EmergencyPage';
import { Toaster } from 'sonner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select-allergens" element={<AllergenSelectionPage />} />
        <Route path="/select-alert" element={<SelectAlertPage />} />
        <Route path="/select-language" element={<LanguageSelectionPage />} />
        <Route path="/alert/:langCode" element={<AllergyAlertPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;