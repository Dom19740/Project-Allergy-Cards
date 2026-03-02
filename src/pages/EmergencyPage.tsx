"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Phone } from 'lucide-react';
import FixedHeader from '@/components/FixedHeader';

const EMERGENCY_MESSAGES: Record<string, { title: string; body: string; action: string }> = {
  en: {
    title: "ATTENTION",
    body: "I am having a medical emergency. I need help immediately. Please call emergency services.",
    action: "Call Emergency Services"
  },
  es: {
    title: "ATENCIÓN",
    body: "Tengo una emergencia médica. Necesito ayuda de inmediato. Por favor, llame a los servicios de emergencia.",
    action: "Llamar a Emergencias"
  },
  fr: {
    title: "ATTENTION",
    body: "J'ai une urgence médicale. J'ai besoin d'aide immédiatement. Veuillez appeler les services d'urgence.",
    action: "Appeler les Secours"
  },
  de: {
    title: "ACHTUNG",
    body: "Ich habe einen medizinischen Notfall. Ich brauche sofort Hilfe. Bitte rufen Sie den Rettungsdienst.",
    action: "Notruf rufen"
  },
  it: {
    title: "ATTENZIONE",
    body: "Ho un'emergenza medica. Ho bisogno di aiuto immediatamente. Per favore, chiama i servizi di emergenza.",
    action: "Chiama Emergenza"
  },
  pt: {
    title: "ATENÇÃO",
    body: "Estou tendo uma emergência médica. Preciso de ajuda imediatamente. Por favor, ligue para os serviços de emergência.",
    action: "Ligar para Emergência"
  },
  ja: {
    title: "注意",
    body: "医療上の緊急事態です。すぐに助けが必要です。救急車を呼んでください。",
    action: "緊急通報"
  },
  zh: {
    title: "注意",
    body: "我遇到了医疗紧急情况。我需要立即获得帮助。请拨打急救电话。",
    action: "呼叫急救"
  }
};

const EmergencyPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('targetLanguage');
    if (storedLang) {
      setLanguage(storedLang);
    }
  }, []);

  const message = EMERGENCY_MESSAGES[language] || EMERGENCY_MESSAGES['en'];

  return (
    <div className="flex flex-col min-h-screen bg-red-50 dark:bg-red-950">
      <FixedHeader />
      
      <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto px-6 pt-[140px] pb-10">
        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8">
          <div className="bg-red-600 p-6 rounded-full animate-pulse">
            <AlertTriangle className="h-16 w-16 text-white" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-red-700 dark:text-red-400 tracking-tighter">
              {message.title}
            </h1>
            <div className="space-y-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {message.body}
              </p>
            </div>
          </div>

          <div className="w-full pt-8">
            <Button 
              variant="destructive" 
              className="w-full py-8 text-2xl font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3"
              onClick={() => window.open('tel:112')}
            >
              <Phone className="h-8 w-8" />
              {message.action}
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;