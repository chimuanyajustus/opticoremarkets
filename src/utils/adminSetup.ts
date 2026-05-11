import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { createUserRecord, updateUserRole } from '../services/firestoreService';

/**
 * Helper function to create an admin account
 * This should only be used in development or with proper authentication
 */
export const createAdminAccount = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  try {
    // Create Firebase Auth user
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;
    const fullName = `${firstName} ${lastName}`;

    // Create Firestore user record
    await createUserRecord(firebaseUser.uid, fullName, email);

    // Promote to admin
    await updateUserRole(firebaseUser.uid, 'admin');

    console.log(`✅ Admin account created successfully!`);
    console.log(`Email: ${email}`);
    console.log(`UID: ${firebaseUser.uid}`);

    // Sign out the admin account
    await signOut(auth);

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: 'admin',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Failed to create admin account:', message);
    throw error;
  }
};

/**
 * Helper function to promote an existing user to admin
 */
export const promoteUserToAdmin = async (uid: string) => {
  try {
    await updateUserRole(uid, 'admin');
    console.log(`✅ User ${uid} promoted to admin successfully!`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Failed to promote user:', message);
    throw error;
  }
};
