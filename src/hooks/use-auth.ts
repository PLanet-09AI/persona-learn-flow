import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
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

  // Check for redirect result on mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in via redirect
          console.log('Redirect sign-in successful');
        }
      } catch (error) {
        console.error('Redirect sign-in error:', error);
        setState(prev => ({
          ...prev,
          error: error as Error
        }));
      }
    };

    handleRedirectResult();
  }, []);

  const signInWithGoogle = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    
    // Reset state at the start
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      // Use the pre-configured provider from firebase config
      // This avoids the "Expected a class definition" error
      
      // Configure auth instance
      auth.useDeviceLanguage(); // Use user's preferred language

      // Detect if we're in production (Netlify) or development
      const isProduction = window.location.hostname !== 'localhost' && 
                          window.location.hostname !== '127.0.0.1';

      if (isProduction) {
        // Use redirect for production (more reliable with COOP policies)
        console.log('Using redirect authentication for production');
        await signInWithRedirect(auth, googleProvider);
        // The redirect will happen, no return value
        return null;
      }

      // Use popup for development (better DX)
      const result = await signInWithPopup(auth, googleProvider)
        .catch(async (error) => {
          // If popup fails in production, fallback to redirect
          if (error.code === 'auth/popup-blocked' || 
              error.message.includes('Cross-Origin-Opener-Policy')) {
            console.log('Popup blocked, falling back to redirect');
            await signInWithRedirect(auth, googleProvider);
            return null;
          }
          
          if (error.code === 'auth/popup-closed-by-user') {
            // If we haven't exceeded max retries, try again
            if (retryCount < MAX_RETRIES) {
              // Small delay before retry to prevent rapid-fire popups
              await new Promise(resolve => setTimeout(resolve, 500));
              return signInWithGoogle(retryCount + 1);
            } else {
              setState(prev => ({ 
                ...prev, 
                isLoading: false,
                error: new Error('Sign-in process was interrupted. Please try again.')
              }));
            }
          } else if (error.code === 'auth/cancelled-popup-request') {
            // Handle case where popup might have communication issues
            if (retryCount < MAX_RETRIES) {
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          let user = await userService.getUserById(firebaseUser.uid);
          
          if (!user) {
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
            
            user = await userService.getUserById(firebaseUser.uid);
          }
          
          setState({
            user,
            firebaseUser,
            isLoading: false,
            error: null
          });
        } else {
          // User is signed out
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
