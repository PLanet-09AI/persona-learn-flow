// This script can be used to deploy Firestore and Storage rules
// You must have Firebase CLI installed (npm install -g firebase-tools)
// and be logged in (firebase login)

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Project directory
const projectDir = path.resolve(__dirname);

// Create directory for Firebase configuration
if (!fs.existsSync(path.join(projectDir, 'firebase-config'))) {
  fs.mkdirSync(path.join(projectDir, 'firebase-config'));
}

// Write Firestore rules
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Common function to check if the user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Function to check if the user is accessing their own data
    function isUserOwned(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Function to check if user is an admin
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read and write their own documents only
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow read: if isUserOwned(userId) || isAdmin();
      allow update: if isUserOwned(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Learning Profiles
    match /learningProfiles/{profileId} {
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow read: if isUserOwned(resource.data.userId) || isAdmin();
      allow update: if isUserOwned(resource.data.userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Content artifacts
    match /contentArtifacts/{contentId} {
      // Anyone authenticated can read content
      allow read: if isAuthenticated();
      // Only the creator or admin can create/update content
      allow create: if isAuthenticated() && request.resource.data.createdBy == request.auth.uid;
      allow update: if isUserOwned(resource.data.createdBy) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Quizzes
    match /quizzes/{quizId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.createdBy == request.auth.uid;
      allow update: if isUserOwned(resource.data.createdBy) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Quiz attempts
    match /attempts/{attemptId} {
      allow read: if isUserOwned(resource.data.userId) || isAdmin();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isUserOwned(resource.data.userId);
      allow delete: if isAdmin();
    }
    
    // Analytics events
    match /analyticsEvents/{eventId} {
      allow read: if isUserOwned(resource.data.userId) || isAdmin();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if false; // Analytics events should not be updated
      allow delete: if isAdmin();
    }
    
    // Chat sessions
    match /chatSessions/{sessionId} {
      allow read: if isUserOwned(resource.data.userId) || isAdmin();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isUserOwned(resource.data.userId);
      allow delete: if isUserOwned(resource.data.userId) || isAdmin();
    }
    
    // Fields (subjects)
    match /fields/{fieldId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
`;

const storageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Common function to check if the user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Function to check if the user is accessing their own data
    function isUserOwned(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Function to check if user is an admin
    function isAdmin() {
      return isAuthenticated() && 
        firestore.exists(/databases/(default)/documents/users/$(request.auth.uid)) &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // User profile images
    match /users/{userId}/profile/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isUserOwned(userId) || isAdmin();
    }
    
    // Content related files
    match /content/{contentId}/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (
        // Check if content belongs to this user or user is admin
        firestore.exists(/databases/(default)/documents/contentArtifacts/$(contentId)) &&
        (
          firestore.get(/databases/(default)/documents/contentArtifacts/$(contentId)).data.createdBy == request.auth.uid ||
          isAdmin()
        )
      );
    }
    
    // General resources
    match /resources/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
`;

const firebaseJson = `
{
  "firestore": {
    "rules": "firebase-config/firestore.rules",
    "indexes": "firebase-config/firestore.indexes.json"
  },
  "storage": {
    "rules": "firebase-config/storage.rules"
  }
}
`;

const firestoreIndexes = `
{
  "indexes": [
    {
      "collectionGroup": "contentArtifacts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "fieldId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "contentArtifacts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdBy",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "attempts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "analyticsEvents",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "chatSessions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "updatedAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
`;

// Write files
fs.writeFileSync(path.join(projectDir, 'firebase-config', 'firestore.rules'), firestoreRules);
fs.writeFileSync(path.join(projectDir, 'firebase-config', 'storage.rules'), storageRules);
fs.writeFileSync(path.join(projectDir, 'firebase.json'), firebaseJson);
fs.writeFileSync(path.join(projectDir, 'firebase-config', 'firestore.indexes.json'), firestoreIndexes);

console.log('Firebase configuration files created!');
console.log('To deploy rules, run: firebase deploy --only firestore:rules,storage');
