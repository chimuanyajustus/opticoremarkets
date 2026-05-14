import React, { createContext, useEffect, useState, useCallback } from 'react';
import { auth } from '../utils/firebase';
import {
  applyActionCode,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  reload,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { createUserRecord, getUserById, updateUserVerificationStatus } from '../services/firestoreService';

export interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
  verifyActionCode: (code: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const DEFAULT_AUTH_CONTEXT: AuthContextType = {
  user: null,
  isAdmin: false,
  loading: true,
  profileLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resendVerification: async () => {},
  refreshUser: async () => false,
  sendPasswordReset: async () => {},
  verifyActionCode: async () => {},
};

export const AuthContext = createContext<AuthContextType>(DEFAULT_AUTH_CONTEXT);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const ensureUserRecord = useCallback(async (firebaseUser: User) => {
    if (!firebaseUser) return null;
    try {
      let existingUser = await getUserById(firebaseUser.uid);
      if (!existingUser) {
        const fullName = firebaseUser.displayName || 'Opticore User';
        const email = firebaseUser.email || '';
        await createUserRecord(firebaseUser.uid, fullName, email);
        existingUser = await getUserById(firebaseUser.uid);
      }
      return existingUser;
    } catch (error) {
      console.error('Failed to ensure Firestore user record:', error);
      return null;
    }
  }, []);

  // Initialize auth state on component mount
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setProfileLoading(false);
      return;
    }

    let mounted = true;
    let profileTimeout: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) {
        return;
      }

      if (!firebaseUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        setProfileLoading(false);
        return;
      }

      setUser(firebaseUser);
      setIsAdmin(false);
      setLoading(false);
      setProfileLoading(true);

      profileTimeout = setTimeout(() => {
        if (!mounted) {
          return;
        }
        console.warn('Auth profile load timed out after 10 seconds. Proceeding without a confirmed admin profile.');
        setProfileLoading(false);
      }, 10000);

      const firestoreUser = await ensureUserRecord(firebaseUser);
      if (!mounted) {
        return;
      }
      setIsAdmin(firestoreUser?.role === 'admin');
      setProfileLoading(false);
      if (profileTimeout) {
        clearTimeout(profileTimeout);
        profileTimeout = null;
      }
    }, (error) => {
      console.error('Auth state changed error:', error);
      if (mounted) {
        setLoading(false);
        setProfileLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (profileTimeout) {
        clearTimeout(profileTimeout);
      }
      unsubscribe();
    };
  }, [ensureUserRecord]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not configured. Set your Firebase config values in .env and restart the dev server.');
      }

      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = credential.user;
        await reload(firebaseUser);

        if (!firebaseUser.emailVerified) {
          if (import.meta.env.PROD) {
            await signOut(auth);
            setUser(null);
            throw new Error('Please verify your email before logging in.');
          }
        }

        const firestoreUser = await getUserById(firebaseUser.uid);
        setUser(firebaseUser);
        setIsAdmin(firestoreUser?.role === 'admin');
      } catch (firebaseError: unknown) {
        // Handle Firebase-specific errors with user-friendly messages
        let errorMessage = 'Login failed. Please try again.';
        
        if (firebaseError instanceof Error) {
          const errorCode = (firebaseError as any).code;
          
          switch (errorCode) {
            case 'auth/user-not-found':
              errorMessage = 'No account found with this email address. Please register first.';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Incorrect password. Please try again.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Please enter a valid email address.';
              break;
            case 'auth/user-disabled':
              errorMessage = 'This account has been disabled. Please contact support.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many login attempts. Please try again later.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your internet connection.';
              break;
            default:
              errorMessage = firebaseError.message || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not configured. Set your Firebase config values in .env and restart the dev server.');
      }

      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = credential.user;
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

        await createUserRecord(firebaseUser.uid, fullName || 'Opticore User', email);
        setUser(firebaseUser);
        setIsAdmin(false);
      } catch (firebaseError: unknown) {
        // Handle Firebase-specific errors with user-friendly messages
        let errorMessage = 'Registration failed. Please try again.';
        
        if (firebaseError instanceof Error) {
          const errorCode = (firebaseError as any).code;
          
          switch (errorCode) {
            case 'auth/email-already-in-use':
              errorMessage = 'An account with this email already exists. Please log in instead.';
              break;
            case 'auth/weak-password':
              errorMessage = 'Password is too weak. Please use at least 6 characters.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Please enter a valid email address.';
              break;
            case 'auth/operation-not-allowed':
              errorMessage = 'Registration is currently disabled. Please try again later.';
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Network error. Please check your internet connection.';
              break;
            default:
              errorMessage = firebaseError.message || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async () => {
    if (!auth || !auth.currentUser) {
      throw new Error('No authenticated user available to resend verification email.');
    }
    await sendEmailVerification(auth.currentUser);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth || !auth.currentUser) {
      throw new Error('No authenticated user available to refresh.');
    }
    await reload(auth.currentUser);
    setUser(auth.currentUser);
    if (auth.currentUser.emailVerified) {
      await updateUserVerificationStatus(auth.currentUser.uid, true);
    }
    return auth.currentUser.emailVerified === true;
  }, []);

  const verifyActionCode = useCallback(async (code: string) => {
    if (!auth) {
      throw new Error('Firebase authentication is not configured.');
    }
    await applyActionCode(auth, code);
    if (auth.currentUser) {
      await reload(auth.currentUser);
      setUser(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        await updateUserVerificationStatus(auth.currentUser.uid, true);
      }
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!auth) {
      throw new Error('Firebase authentication is not configured. Set your Firebase config values in .env and restart the dev server.');
    }

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      await sendPasswordResetEmail(auth, email);
    } catch (firebaseError: unknown) {
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (firebaseError instanceof Error) {
        const errorCode = (firebaseError as any).code;
        
        switch (errorCode) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many reset requests. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = firebaseError.message || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAdmin,
    loading,
    profileLoading,
    login,
    register,
    logout,
    resendVerification,
    refreshUser,
    verifyActionCode,
    sendPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

