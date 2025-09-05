# Firestore Rules for the Ndu AI Learning System

```
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
```

# Storage Rules

```
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
