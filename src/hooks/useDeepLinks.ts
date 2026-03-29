"use client";

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, URLOpenListenerEvent } from '@capacitor/app';

export const useDeepLinks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const setupListener = async () => {
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
        const slug = event.url.split('.com').pop() || event.url.split('://').pop();
        if (slug) {
          navigate(slug);
        }
      });
    };
    setupListener();
  }, [navigate]);
};