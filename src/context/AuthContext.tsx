import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../utils/firebase';
import {
  applyActionCode,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  reload,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { createUserRecord, getUserById, updateUserVerificationStatus } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshUser: () => Promise<boolean>;
  verifyActionCode: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };
export type { AuthContextType };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(!auth);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const ensureUserRecord = async (firebaseUser: User) => {
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
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      let firestoreUser = null;
      if (firebaseUser) {
        firestoreUser = await ensureUserRecord(firebaseUser);
      }
      setUser(firebaseUser || null);
      setIsAdmin(firestoreUser?.role === 'admin');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not configured. Set your Firebase config values in .env and restart the dev server.');
      }

      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      await reload(firebaseUser);

      if (!firebaseUser.emailVerified) {
        // In development mode, allow login without email verification
        // Remove this condition in production and enable email verification
        if (import.meta.env.PROD) {
          await signOut(auth);
          setUser(null);
          throw new Error('Please verify your email before logging in.');
        }
      }

      const firestoreUser = await getUserById(firebaseUser.uid);
      setUser(firebaseUser);
      setIsAdmin(firestoreUser?.role === 'admin');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      if (!auth) {
        throw new Error('Firebase authentication is not configured. Set your Firebase config values in .env and restart the dev server.');
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      await createUserRecord(firebaseUser.uid, fullName || 'Opticore User', email);

      // Custom email delivery should be handled by a backend function.
      // Example: POST to /api/send-verification-email with email, name and verification link data.
      setUser(firebaseUser);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
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
  };

  const resendVerification = async () => {
    if (!auth || !auth.currentUser) {
      throw new Error('No authenticated user available to resend verification email.');
    }
    await sendEmailVerification(auth.currentUser);
  };

  const refreshUser = async () => {
    if (!auth || !auth.currentUser) {
      throw new Error('No authenticated user available to refresh.');
    }
    await reload(auth.currentUser);
    setUser(auth.currentUser);
    if (auth.currentUser.emailVerified) {
      await updateUserVerificationStatus(auth.currentUser.uid, true);
    }
    return auth.currentUser.emailVerified === true;
  };

  const verifyActionCode = async (code: string) => {
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        register,
        logout,
        resendVerification,
        refreshUser,
        verifyActionCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
