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
      console.log('[AuthContext] ensureUserRecord: Fetching user record for UID:', firebaseUser.uid);
      let existingUser = await getUserById(firebaseUser.uid);
      console.log('[AuthContext] ensureUserRecord: Existing user found:', existingUser ? 'Yes' : 'No');
      
      if (!existingUser) {
        const fullName = firebaseUser.displayName || 'Opticore User';
        const email = firebaseUser.email || '';
        console.log('[AuthContext] ensureUserRecord: Creating new user record for:', email);
        await createUserRecord(firebaseUser.uid, fullName, email);
        existingUser = await getUserById(firebaseUser.uid);
        console.log('[AuthContext] ensureUserRecord: New user record created and verified:', existingUser ? 'Success' : 'Failed');
      }
      
      if (existingUser) {
        console.log('[AuthContext] ensureUserRecord: User role:', existingUser.role);
      }
      
      return existingUser;
    } catch (error) {
      console.error('[AuthContext] Failed to ensure Firestore user record:', error);
      if (error instanceof Error) {
        console.error('[AuthContext] Error details:', error.message, error.code);
      }
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

      console.log('[AuthContext] Auth state changed. User:', firebaseUser ? firebaseUser.email : 'null');

      if (!firebaseUser) {
        console.log('[AuthContext] No Firebase user, clearing auth state');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        setProfileLoading(false);
        return;
      }

      console.log('[AuthContext] Firebase user authenticated:', firebaseUser.email);
      setUser(firebaseUser);
      setIsAdmin(false);
      setLoading(false);
      setProfileLoading(true);

      // Increase timeout for mobile networks (20 seconds)
      const PROFILE_TIMEOUT_MS = 20000;
      profileTimeout = setTimeout(() => {
        if (!mounted) {
          return;
        }
        console.warn('[AuthContext] Auth profile load timed out after', PROFILE_TIMEOUT_MS / 1000, 'seconds. Proceeding without a confirmed admin profile.');
        setProfileLoading(false);
      }, PROFILE_TIMEOUT_MS);

      try {
        console.log('[AuthContext] Fetching Firestore user profile...');
        const firestoreUser = await ensureUserRecord(firebaseUser);
        
        if (!mounted) {
          console.log('[AuthContext] Component unmounted, skipping state update');
          return;
        }
        
        if (firestoreUser) {
          const adminStatus = firestoreUser.role === 'admin';
          console.log('[AuthContext] Firestore user profile loaded. Admin status:', adminStatus);
          setIsAdmin(adminStatus);
        } else {
          console.warn('[AuthContext] Firestore user profile is null');
          setIsAdmin(false);
        }
        
        setProfileLoading(false);
        if (profileTimeout) {
          clearTimeout(profileTimeout);
          profileTimeout = null;
        }
      } catch (profileError) {
        console.error('[AuthContext] Error loading Firestore profile:', profileError);
        if (mounted) {
          setProfileLoading(false);
        }
      }
    }, (error) => {
      console.error('[AuthContext] Auth state listener error:', error);
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
    console.log('[AuthContext] Login attempt for:', email);
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not configured. Set your Firebase config values in .env and restart the dev server.');
      }

      try {
        console.log('[AuthContext] Signing in with Firebase...');
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = credential.user;
        console.log('[AuthContext] Firebase sign-in successful. UID:', firebaseUser.uid);
        
        await reload(firebaseUser);
        console.log('[AuthContext] Firebase user reloaded');

        if (!firebaseUser.emailVerified) {
          console.log('[AuthContext] Email not verified. Production:', import.meta.env.PROD);
          if (import.meta.env.PROD) {
            await signOut(auth);
            setUser(null);
            throw new Error('Please verify your email before logging in.');
          }
        }

        console.log('[AuthContext] Fetching Firestore user data...');
        const firestoreUser = await getUserById(firebaseUser.uid);
        console.log('[AuthContext] Firestore user data:', firestoreUser ? { uid: firestoreUser.uid, email: firestoreUser.email, role: firestoreUser.role } : 'null');
        
        setUser(firebaseUser);
        const isAdminUser = firestoreUser?.role === 'admin';
        setIsAdmin(isAdminUser);
        console.log('[AuthContext] Login successful. Admin:', isAdminUser);
      } catch (firebaseError: unknown) {
        // Handle Firebase-specific errors with user-friendly messages
        let errorMessage = 'Login failed. Please try again.';
        const errorCode = (firebaseError as any)?.code;
        
        console.error('[AuthContext] Login error code:', errorCode, 'Error:', firebaseError);
        
        if (firebaseError instanceof Error) {
          
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
        
        console.error('[AuthContext] Final error message:', errorMessage);
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

