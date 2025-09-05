import { app, auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';

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
