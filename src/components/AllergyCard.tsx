"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardActions from './CardActions';
import AllergyCardContent from './AllergyCardContent';

interface AllergyCardProps {
  selectedAllergens: string[];
  languageCode: string;
  alertMessages?: any;
  isSharing?: boolean;
  isDownloading?: boolean;
  onShare?: () => void;
  onDownload?: () => void;
}

const AllergyCard: React.FC<AllergyCardProps> = ({
  selectedAllergens,
  languageCode,
  alertMessages = {
    iAmAllergicTo: "I can not eat:",
    theyMakeMeSick: "They make me very sick and I could die"
  },
  isSharing = false,
  isDownloading = false,
  onShare = () => {},
  onDownload = () => {},
}) => {
  const navigate = useNavigate();

  const handleEmergency = () => {
    navigate('/emergency');
  };

  const handleToggleMenu = () => {
    navigate('/select-allergens');
  };

  const allergensData = {
    ids: selectedAllergens,
    custom: []
  };

  return (
    <div className="flex flex-col items-center w-full">
      <AllergyCardContent 
        allergens={allergensData}
        language={languageCode}
        alertMessages={alertMessages}
      />
      
      <div className="mt-6 w-full">
        <CardActions
          onShare={onShare}
          onDownload={onDownload}
          onPrint={() => window.print()}
          onSave={() => {}}
          onToggleMenu={handleToggleMenu}
          onEmergency={handleEmergency}
          isSharing={isSharing}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  );
};

export default AllergyCard;