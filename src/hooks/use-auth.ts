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
  
  const signInWithGoogle = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Auth state change will be handled by the onAuthStateChanged listener
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
    }
  };

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
