import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('Service Worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);