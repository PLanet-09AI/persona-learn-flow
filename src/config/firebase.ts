import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration from environment variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBCE7nTnzEDkPOPwVkYkZC7QCbpAnT50AQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ndu-ai-learning-system.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ndu-ai-learning-system",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ndu-ai-learning-system.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "71646856792",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:71646856792:web:d5f83e4a79f96f3999b699",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PH7JRWCL19"
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
