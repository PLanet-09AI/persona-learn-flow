import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// For server-side environments that support environment variables
// Initialize Firebase Admin if it hasn't been already
if (!getApps().length) {
  // Check if running in an environment with credentials file path
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID || 'ndu-ai-learning-system'}.firebaseio.com`
    });
  } else {
    // Fallback to direct credential if needed (not recommended for production)
    try {
      const serviceAccount = require('../../config/firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://ndu-ai-learning-system.firebaseio.com",
        projectId: "ndu-ai-learning-system"
      });
    } catch (error) {
      console.error("Failed to initialize Firebase Admin SDK:", error);
    }
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

// Utility functions for server-side operations
export const verifyIdToken = async (token: string) => {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
};

export const getUser = async (uid: string) => {
  try {
    const user = await adminAuth.getUser(uid);
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const createUser = async (email: string, password: string, displayName: string) => {
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });
    return userRecord;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const deleteUser = async (uid: string) => {
  try {
    await adminAuth.deleteUser(uid);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export default admin;
