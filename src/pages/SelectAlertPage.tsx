"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import FixedHeader from '@/components/FixedHeader';
import StepHeader from '@/components/StepHeader';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { cn } from '@/lib/utils';

const ALERT_TYPES = [
  {
    id: 'standard',
    title: 'Standard Alert',
    description: 'A clear statement of your allergies and a request for safe food preparation.',
    icon: Info,
    color: 'blue'
  },
  {
    id: 'severe',
    title: 'Severe Allergy',
    description: 'Emphasizes the severity of your allergy and the risk of cross-contamination.',
    icon: AlertTriangle,
    color: 'amber'
  },
  {
    id: 'emergency',
    title: 'Emergency Card',
    description: 'A critical alert for medical emergencies, stating you need immediate help.',
    icon: ShieldAlert,
    color: 'red'
  }
];

const SelectAlertPage = () => {
  const navigate = useNavigate();
  const [selectedAlert, setSelectedAlert] = useState<string>('standard');

  useEffect(() => {
    const loadData = async () => {
      const storedAlert = await storage.get<string>(STORAGE_KEYS.SELECTED_ALERT_TYPE);
      if (storedAlert) {
        setSelectedAlert(storedAlert);
      }
    };
    loadData();
  }, []);

  const handleContinue = async () => {
    await storage.set(STORAGE_KEYS.SELECTED_ALERT_TYPE, selectedAlert);
    navigate('/select-languages');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-4 pt-[calc(env(safe-area-inset-top)+10px)]">
        <div className="flex-grow pt-2">
          <StepHeader 
            title="Select Alert Type"
            description="Choose the type of message you want to display on your card."
          />
          
          <div className="space-y-4 pt-6">
            {ALERT_TYPES.map((alert) => {
              const isSelected = selectedAlert === alert.id;
              const Icon = alert.icon;
              
              return (
                <div 
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert.id)}
                  className={cn(
                    "p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start space-x-4",
                    isSelected 
                      ? "bg-white dark:bg-gray-800 border-red-600 shadow-md" 
                      : "bg-white dark:bg-gray-800 border-transparent shadow-sm hover:border-gray-200 dark:hover:border-gray-700"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-xl shrink-0",
                    alert.color === 'blue' ? "bg-blue-100 text-blue-600" :
                    alert.color === 'amber' ? "bg-amber-100 text-amber-600" :
                    "bg-red-100 text-red-600"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{alert.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {alert.description}
                    </p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center",
                    isSelected ? "border-red-600 bg-red-600" : "border-gray-300 dark:border-gray-600"
                  )}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-auto mb-[50px] pt-8 gap-4 shrink-0">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="py-3 px-8 text-lg h-auto bg-red-600 text-white hover:bg-red-700 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center"
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectAlertPage;