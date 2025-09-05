import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration from environment variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBKgjQnf__SzIuP-pl-SUxyDyDCbJOpLbQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ndu-ai-lms.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ndu-ai-lms",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ndu-ai-lms.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "377111671886",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:377111671886:web:a6b2e7cbc13939696f7f1f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XRP4PYG1MH"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics - only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;
