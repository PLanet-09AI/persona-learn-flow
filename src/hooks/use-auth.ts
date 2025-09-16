import { useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userService } from '../services/firebase';
import type { User } from '../types/models';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    isLoading: true,
    error: null
  });

  const signInWithGoogle = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    
    // Reset state at the start
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      const provider = new GoogleAuthProvider();
      
      // Configure Google sign-in for optimal UX
      provider.setCustomParameters({
        prompt: 'select_account', // Always show account picker
        access_type: 'offline', // Request refresh token
        include_granted_scopes: 'true', // Include previously granted scopes
        ux_mode: 'popup', // Explicitly request popup mode
      });

      // Configure auth instance
      auth.useDeviceLanguage(); // Use user's preferred language
      
      // Calculate optimal popup dimensions based on screen size
      const width = Math.min(600, window.innerWidth - 40); // Max width of 600px or screen width - 40px
      const height = Math.min(700, window.innerHeight - 40); // Max height of 700px or screen height - 40px
      
      // Center the popup while ensuring it's fully visible
      const left = Math.max(0, Math.floor((window.innerWidth - width) / 2));
      const top = Math.max(0, Math.floor((window.innerHeight - height) / 2));

      // Create popup options
      const popupOptions = {
        width,
        height,
        left,
        top,
        menubar: 'no',
        location: 'no',
        resizable: 'no',
        scrollbars: 'yes',
        status: 'no',
        focus: true,
      };

      // Attempt sign in with enhanced error handling
      const result = await signInWithPopup(auth, provider, popupOptions)
        .catch(async (error) => {
          console.log('Sign-in attempt error:', error.code);

          if (error.code === 'auth/popup-closed-by-user') {
            // If we haven't exceeded max retries, try again
            if (retryCount < MAX_RETRIES) {
              console.log(`Retrying sign-in attempt ${retryCount + 1} of ${MAX_RETRIES}`);
              // Small delay before retry to prevent rapid-fire popups
              await new Promise(resolve => setTimeout(resolve, 500));
              return signInWithGoogle(retryCount + 1);
            } else {
              console.log('Max retries exceeded');
              setState(prev => ({ 
                ...prev, 
                isLoading: false,
                error: new Error('Sign-in process was interrupted. Please try again.')
              }));
            }
          } else if (error.code === 'auth/popup-blocked') {
            console.warn('Sign-in popup was blocked');
            setState(prev => ({ 
              ...prev, 
              isLoading: false,
              error: new Error('Please allow pop-ups for this site and try again')
            }));
          } else if (error.code === 'auth/cancelled-popup-request' || 
                     error.code === 'auth/popup-closed-by-user') {
            // Handle case where popup might have communication issues
            if (retryCount < MAX_RETRIES) {
              console.log('Popup communication issue, retrying...');
              await new Promise(resolve => setTimeout(resolve, 500));
              return signInWithGoogle(retryCount + 1);
            }
          } else {
            console.error('Google sign-in error:', error);
            setState(prev => ({ 
              ...prev, 
              isLoading: false,
              error: new Error('Unable to complete sign-in. Please try again.')
            }));
          }
          return null;
        });

      // If sign-in was cancelled or failed, return early
      if (!result) return null;

      // Sign-in successful
      console.log('Google sign-in successful:', result.user.uid);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: null
      }));
      
      return result.user;
    } catch (error) {
      // Catch any unexpected errors
      console.error('Unexpected error during Google sign-in:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: new Error('An unexpected error occurred. Please try again.')
      }));
      return null; // Return null instead of throwing
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log("Auth state changed:", firebaseUser ? "User signed in" : "No user");
        if (firebaseUser) {
          // User is signed in
          console.log("Firebase user ID:", firebaseUser.uid);
          let user = await userService.getUserById(firebaseUser.uid);
          
          if (!user) {
            console.log("Creating new user document");
            // Create user document if it doesn't exist
            const newUser: User = {
              id: firebaseUser.uid,
              role: 'student',
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || undefined,
              preferences: {},
              learningStyles: ['visual'], // Default
              createdAt: new Date(),
              lastActive: new Date()
            };
            
            await userService.createUser(newUser);
            console.log("New user document created");
            
            user = await userService.getUserById(firebaseUser.uid);
          }
          
          console.log("Setting state with user:", user);
          setState({
            user,
            firebaseUser,
            isLoading: false,
            error: null
          });
        } else {
          // User is signed out
          console.log("Setting state with no user");
          setState({
            user: null,
            firebaseUser: null,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setState({
          user: null,
          firebaseUser: null,
          isLoading: false,
          error: error as Error
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will be handled by the onAuthStateChanged listener
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Auth state change will be handled by the onAuthStateChanged listener
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
    }
  };
  
  // signInWithGoogle is now defined above

  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await firebaseSignOut(auth);
      // Auth state change will be handled by the onAuthStateChanged listener
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
    }
  };

  return {
    user: state.user,
    firebaseUser: state.firebaseUser,
    isLoading: state.isLoading,
    isAuthenticated: !!state.user,
    error: state.error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut
  };
};
