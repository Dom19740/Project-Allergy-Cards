"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = import.meta.env.VITE_FIREBASE_CONFIG
  ? JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)
  : null;

let app;
let analytics;

if (Capacitor.getPlatform() === 'web' && firebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Firebase Web initialization failed:", error);
  }
}

export { app, analytics };