"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Globe, ShieldAlert, MessageSquare, Save, ChevronRight } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Globe,
      title: "100+ Languages",
      description: "Translate your allergy alerts instantly into any language."
    },
    {
      icon: ShieldAlert,
      title: "Custom Allergens",
      description: "Select from common allergens or add your own custom ones."
    },
    {
      icon: MessageSquare,
      title: "Custom Alerts",
      description: "Personalize your message for restaurants and staff."
    },
    {
      icon: Save,
      title: "Save & Share",
      description: "Keep your cards offline or share them as high-quality images."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Travel Safely.
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your allergies, translated instantly.
            </p>
          </div>

          <div className="space-y-6 py-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl shrink-0">
                  <feature.icon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <Button 
          onClick={() => navigate('/select-allergens')}
          className="w-full py-7 text-xl font-bold bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg transition-transform active:scale-95"
        >
          Get Started
          <ChevronRight className="ml-2 h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;