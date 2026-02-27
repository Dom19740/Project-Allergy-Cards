"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ALLERGEN_OPTIONS } from '@/lib/allergens';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AllergenSelectionPage = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customAllergen, setCustomAllergen] = useState("");
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedAllergens');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedIds(parsed.ids || []);
        setCustomAllergens(parsed.customList || []);
      } catch (e) {
        console.error("Failed to parse saved allergens", e);
      }
    }
  }, []);

  const toggleAllergen = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addCustomAllergen = () => {
    if (!customAllergen.trim()) return;
    if (customAllergens.includes(customAllergen.trim())) {
      toast.error("Allergen already added");
      return;
    }
    setCustomAllergens(prev => [...prev, customAllergen.trim()]);
    setSelectedIds(prev => [...prev, customAllergen.trim()]);
    setCustomAllergen("");
  };

  const removeCustomAllergen = (name: string) => {
    setCustomAllergens(prev => prev.filter(a => a !== name));
    setSelectedIds(prev => prev.filter(id => id !== name));
  };

  const handleNext = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one allergen");
      return;
    }
    localStorage.setItem('selectedAllergens', JSON.stringify({
      ids: selectedIds,
      customList: customAllergens
    }));
    navigate('/select-alert');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-md mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Select Allergens</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {ALLERGEN_OPTIONS.map((allergen) => (
          <button
            key={allergen.id}
            onClick={() => toggleAllergen(allergen.id)}
            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
              selectedIds.includes(allergen.id)
                ? 'border-red-500 bg-red-50'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <img src={allergen.image} alt={allergen.name} className="w-12 h-12 mb-2 object-contain" />
            <span className="text-sm font-medium">{allergen.name}</span>
          </button>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Other Allergens</h2>
        <div className="flex gap-2 mb-4">
          <Input
            value={customAllergen}
            onChange={(e) => setCustomAllergen(e.target.value)}
            placeholder="Add custom allergen..."
            onKeyPress={(e) => e.key === 'Enter' && addCustomAllergen()}
          />
          <Button onClick={addCustomAllergen} size="icon" className="bg-red-600 hover:bg-red-700">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {customAllergens.map((name) => (
            <div key={name} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-sm">{name}</span>
              <button onClick={() => removeCustomAllergen(name)} className="ml-2 text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleNext}
        className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white rounded-xl mt-auto"
      >
        Next
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default AllergenSelectionPage;