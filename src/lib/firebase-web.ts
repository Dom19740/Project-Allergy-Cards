"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Capacitor } from "@capacitor/core";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZIOqkQ8f4XmW3e7unOJ6CVxlvs2qkkww",
  authDomain: "simple-allergy-alert.firebaseapp.com",
  projectId: "simple-allergy-alert",
  storageBucket: "simple-allergy-alert.firebasestorage.app",
  messagingSenderId: "878638647949",
  appId: "1:878638647949:web:5de959895d621a5871b0c4",
  measurementId: "G-6F57EBJDZ7"
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