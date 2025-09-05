// This file should be run with Node.js to test the Firebase connection
console.log('Starting Firebase connection test...');

// Import Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

// Firebase configuration (hard-coded for this test)
const firebaseConfig = {
  apiKey: "AIzaSyBKgjQnf__SzIuP-pl-SUxyDyDCbJOpLbQ",
  authDomain: "ndu-ai-lms.firebaseapp.com",
  projectId: "ndu-ai-lms",
  storageBucket: "ndu-ai-lms.firebasestorage.app",
  messagingSenderId: "377111671886",
  appId: "1:377111671886:web:a6b2e7cbc13939696f7f1f",
  measurementId: "G-XRP4PYG1MH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase app initialized:', app.name);

// Check authentication state
console.log('Checking authentication state...');
const unsubscribe = onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('No user is signed in.');
  }
});

// Test Firestore connection
const testFirestore = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to fetch a document from any collection
    const collectionsQuery = query(collection(db, 'users'), limit(1));
    const snapshot = await getDocs(collectionsQuery);
    
    if (snapshot.empty) {
      console.log('Firestore connected successfully, but no documents found in users collection.');
    } else {
      console.log('Firestore connected successfully, found documents in users collection.');
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting to Firestore:', error);
    return false;
  } finally {
    // Clean up auth listener
    unsubscribe();
  }
};

// Run the test
testFirestore()
  .then((success) => {
    if (success) {
      console.log('Firebase connection test completed successfully.');
    } else {
      console.log('Firebase connection test failed.');
    }
  })
  .catch((error) => {
    console.error('Unexpected error during Firebase test:', error);
  });
