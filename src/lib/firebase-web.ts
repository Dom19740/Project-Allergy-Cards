"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Capacitor } from "@capacitor/core";

/**
 * To get these values:
 * 1. Go to Firebase Console (https://console.firebase.google.com/)
 * 2. Click the Gear icon (Project Settings) > General
 * 3. Scroll down to "Your apps" and click the "</>" icon to add a Web App
 * 4. Copy the 'firebaseConfig' object and paste it here
 */
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID",
  measurementId: "REPLACE_WITH_YOUR_MEASUREMENT_ID"
};

let app;
let analytics;

// Only initialize on the web platform. 
// Native platforms (iOS/Android) are handled by the Capacitor native SDKs.
if (Capacitor.getPlatform() === 'web') {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    analytics = getAnalytics(app);
    console.log("Firebase Web Analytics initialized");
  } catch (error) {
    console.error("Firebase Web initialization failed:", error);
  }
}

export { app, analytics };