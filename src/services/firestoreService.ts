import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  getDoc,
  getDocs,
  type DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import type { InvestmentPlanConfig } from '../types/investment';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface FirestoreUser {
  uid: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  status: UserStatus;
  balance: number;
  totalReturns: number;
  emailVerified: boolean;
  verificationStatus: 'pending' | 'verified';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  asset: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  asset: string;
  walletAddress: string;
  network: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  type: 'withdrawal';
  createdAt: Timestamp;
  processedAt?: Timestamp;
  transactionId?: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  uid?: string;
  userEmail: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'investment' | 'investment_profit' | 'admin_funding' | 'admin_withdrawal';
  asset: string;
  amount: number;
  amountUsd: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Timestamp;
  timestamp?: Timestamp;
  investmentId?: string;
  note?: string;
}

const usersCollection = collection(db, 'users');
const depositsCollection = collection(db, 'depositRequests');
const withdrawalsCollection = collection(db, 'withdrawals');
const transactionsCollection = collection(db, 'transactions');
const investmentPlansCollection = collection(db, 'investmentPlans');
const investmentsCollection = collection(db, 'investments');

export const createUserRecord = async (
  uid: string,
  fullName: string,
  email: string
): Promise<void> => {
  try {
    console.log('[firestoreService] createUserRecord: Creating user document for UID:', uid, 'Email:', email);
    const userRef = doc(usersCollection, uid);
    await setDoc(userRef, {
      uid,
      fullName,
      email,
      role: 'user',
      status: 'pending',
      balance: 0,
      totalReturns: 0,
      emailVerified: false,
      verificationStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('[firestoreService] createUserRecord: User document created successfully');
  } catch (error) {
    console.error('[firestoreService] createUserRecord: Error creating user document:', error);
    if (error instanceof Error) {
      console.error('[firestoreService] createUserRecord: Error details:', error.message);
    }
    throw error;
  }
};

export const updateUserStatus = async (uid: string, status: UserStatus): Promise<void> => {
  const userRef = doc(usersCollection, uid);
  await updateDoc(userRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const updateUserVerificationStatus = async (uid: string, verified: boolean): Promise<void> => {
  const userRef = doc(usersCollection, uid);
  await updateDoc(userRef, {
    emailVerified: verified,
    verificationStatus: verified ? 'verified' : 'pending',
    updatedAt: serverTimestamp(),
  });
};

export const incrementUserBalance = async (uid: string, amount: number): Promise<void> => {
  const userRef = doc(usersCollection, uid);
  await updateDoc(userRef, {
    balance: increment(amount),
    updatedAt: serverTimestamp(),
  });
};

export const adminDeposit = async (
  uid: string,
  userEmail: string,
  userName: string,
  amount: number,
  asset: string = 'USD'
): Promise<void> => {
  // Update user balance
  await incrementUserBalance(uid, amount);
  
  // Create transaction in global collection (for admin records)
  await createTransactionRecord(uid, userEmail, userName, 'deposit', asset, amount, amount, 'completed', 'Admin deposit');
  
  // Create transaction in user subcollection (for user dashboard)
  await createUserTransaction(uid, {
    type: 'admin_funding',
    amount,
    asset,
    status: 'completed',
    description: 'Admin deposit to account',
  });
};

export const adminWithdrawal = async (
  uid: string,
  userEmail: string,
  userName: string,
  amount: number,
  asset: string = 'USD'
): Promise<void> => {
  await incrementUserBalance(uid, -amount);
  await createTransactionRecord(uid, userEmail, userName, 'withdrawal', asset, amount, amount, 'completed', 'Admin withdrawal');
  
  // Create transaction in user subcollection (for user dashboard)
  await createUserTransaction(uid, {
    type: 'admin_withdrawal',
    amount,
    asset,
    status: 'completed',
    description: 'Admin withdrawal from account',
  });
};

export const createDepositRequest = async (
  uid: string,
  userEmail: string,
  userName: string,
  amount: number,
  asset: string
): Promise<void> => {
  if (!uid || !userEmail) {
    throw new Error('User authentication required to submit a deposit request.');
  }

  try {
    await addDoc(depositsCollection, {
      userId: uid,
      uid,
      userEmail,
      userName,
      amount,
      asset,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    await createUserTransaction(uid, {
      userId: uid,
      uid,
      type: 'deposit',
      amount,
      asset,
      status: 'pending',
      description: 'Deposit request pending admin approval',
    }).catch((error) => {
      console.warn('Deposit request created, but failed to create user transaction:', error);
    });
  } catch (error) {
    console.error('Firestore deposit request error:', error);
    throw error;
  }
};

export const createWithdrawalRequest = async (
  uid: string,
  userEmail: string,
  userName: string,
  amount: number,
  walletAddress: string,
  network: string = 'BTC'
): Promise<void> => {
  if (!uid || !userEmail) {
    throw new Error('User authentication required to submit a withdrawal request.');
  }

  try {
    await addDoc(withdrawalsCollection, {
      userId: uid,
      uid,
      userEmail,
      userName,
      amount,
      asset: network,
      walletAddress,
      network,
      status: 'pending',
      type: 'withdrawal',
      createdAt: serverTimestamp(),
    });

    await createUserTransaction(uid, {
      userId: uid,
      uid,
      type: 'withdrawal',
      amount,
      asset: network,
      status: 'pending',
      description: `Withdrawal request to ${walletAddress.substring(0, 8)}... pending admin approval`,
    }).catch((error) => {
      console.warn('Withdrawal request created, but failed to create user transaction:', error);
    });
  } catch (error) {
    console.error('Firestore withdrawal request error:', error);
    throw new Error('Failed to create withdrawal request. Please check your permissions and try again.');
  }
};

export const createTransactionRecord = async (
  uid: string,
  userEmail: string,
  userName: string,
  type: 'deposit' | 'withdrawal' | 'trade' | 'investment' | 'investment_profit' | 'admin_funding' | 'admin_withdrawal',
  asset: string,
  amount: number,
  amountUsd: number,
  status: 'completed' | 'pending' | 'failed',
  note?: string,
  investmentId?: string
): Promise<void> => {
  const transactionData: any = {
    userId: uid,
    uid,
    userEmail,
    userName,
    type,
    asset,
    amount,
    amountUsd,
    status,
    note: note || '',
    createdAt: serverTimestamp(),
    timestamp: serverTimestamp(),
  };

  // Only include investmentId if it's provided
  if (investmentId) {
    transactionData.investmentId = investmentId;
  }

  await addDoc(transactionsCollection, transactionData);
};

export const createUserTransaction = async (
  uid: string,
  data: {
    userId?: string;
    uid?: string;
    type: 'deposit' | 'withdrawal' | 'trade' | 'investment' | 'investment_profit' | 'admin_funding' | 'admin_withdrawal';
    amount: number;
    asset: string;
    status: 'completed' | 'pending' | 'failed';
    description: string;
    balanceAfter?: number;
    investmentId?: string;
    note?: string;
  }
): Promise<void> => {
  const userTransactionsRef = collection(db, 'users', uid, 'transactions');
  await addDoc(userTransactionsRef, {
    userId: uid,
    uid,
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const createInvestment = async (
  userId: string,
  plan: InvestmentPlanConfig,
  amount: number
): Promise<void> => {
  // Validate input
  if (amount <= 0) {
    throw new Error('Investment amount must be greater than zero.');
  }

  if (amount < plan.minAmount) {
    throw new Error(`Investment amount must be at least $${plan.minAmount.toLocaleString()}.`);
  }

  if (plan.maxAmount !== Number.POSITIVE_INFINITY && amount > plan.maxAmount) {
    throw new Error(`Investment amount cannot exceed $${plan.maxAmount.toLocaleString()}.`);
  }

  // Fetch user data for balance check and transaction info
  const userRef = doc(usersCollection, userId);
  const userSnapshot = await getDoc(userRef);
  
  if (!userSnapshot.exists()) {
    throw new Error('User not found.');
  }

  const userData = userSnapshot.data() as FirestoreUser;
  const currentBalance = userData.balance ?? 0;

  if (currentBalance < amount) {
    throw new Error('Insufficient balance for investment.');
  }

  // Use safe fallback for durationDays to prevent undefined in Firestore
  const safeDurationDays = plan.durationDays ?? 30;
  
  const expiresAt = Timestamp.fromMillis(
    Date.now() + safeDurationDays * 24 * 60 * 60 * 1000
  );

  // Create investment document first (simpler permission model)
  const investmentRef = doc(investmentsCollection);
  
  // Sanitize object to remove undefined values before setDoc
  const investmentData = {
    userId: userId ?? undefined,
    planId: plan.id ?? undefined,
    planName: plan.name ?? undefined,
    amount: amount ?? undefined,
    roiPercent: plan.percentage ?? undefined,
    percentage: plan.percentage ?? undefined,
    interval: plan.interval ?? undefined,
    durationDays: safeDurationDays,
    startedAt: serverTimestamp(),
    expiresAt,
    lastProfitAt: serverTimestamp(),
    accumulatedProfit: 0,
    totalProfit: 0,
    status: 'active' as const,
  };
  
  // Remove undefined values to prevent Firestore "Unsupported field value: undefined" errors
  const cleanInvestmentData = Object.fromEntries(
    Object.entries(investmentData).filter(([, value]) => value !== undefined)
  );
  
  console.log('Creating investment with payload:', cleanInvestmentData);
  
  await setDoc(investmentRef, cleanInvestmentData);

  // Update user balance
  await updateDoc(userRef, {
    balance: increment(-amount),
    updatedAt: serverTimestamp(),
  });

  // Create transaction record
  await createTransactionRecord(
    userId,
    userData.email,
    userData.fullName,
    'investment',
    plan.name,
    amount,
    amount,
    'completed',
    `Started ${plan.name} plan investment`,
    investmentRef.id
  );
};

export const onInvestmentPlansSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
  errorCallback?: (error: Error) => void
) => {
  const q = query(investmentPlansCollection, orderBy('name', 'asc'));
  return onSnapshot(q, callback, (error) => errorCallback?.(error as Error));
};

export const onUserInvestmentsSnapshot = (
  userId: string,
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
  errorCallback?: (error: Error) => void
) => {
  const q = query(investmentsCollection, where('userId', '==', userId), orderBy('startedAt', 'desc'));
  return onSnapshot(q, callback, (error) => errorCallback?.(error as Error));
};

export const onAllInvestmentsSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
  errorCallback?: (error: Error) => void
) => {
  const q = query(investmentsCollection, orderBy('startedAt', 'desc'));
  return onSnapshot(q, callback, (error) => errorCallback?.(error as Error));
};

export const onUsersSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
  errorCallback?: (error: Error) => void
) => {
  const q = query(usersCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback, (error) => errorCallback?.(error as Error));
};

export const updateInvestmentPlanConfig = async (
  planId: string,
  updates: Partial<InvestmentPlanConfig>
): Promise<void> => {
  const planRef = doc(investmentPlansCollection, planId);
  await updateDoc(planRef, updates);
};

export const ensureDefaultInvestmentPlans = async (
  plans: InvestmentPlanConfig[]
): Promise<void> => {
  const existingSnapshot = await getDocs(investmentPlansCollection);
  if (!existingSnapshot.empty) {
    return;
  }

  const writes = plans.map((plan) => {
    const planRef = doc(investmentPlansCollection, plan.id);
    return setDoc(planRef, plan);
  });

  await Promise.all(writes);
};

export const onDepositRequestsSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
  errorCallback?: (error: Error) => void
) => {
  const q = query(depositsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback, (error) => errorCallback?.(error as Error));
};

export const onWithdrawalRequestsSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
  errorCallback?: (error: Error) => void
) => {
  const q = query(withdrawalsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback, (error) => errorCallback?.(error as Error));
};

export const onTransactionsSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
  errorCallback?: (error: Error) => void
) => {
  const q = query(transactionsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback, (error) => errorCallback?.(error as Error));
};

export const onUserTransactionsSnapshot = (
  uid: string,
  callback: (snapshot: QuerySnapshot<DocumentData>) => void,
  errorCallback?: (error: Error) => void
) => {
  const userTransactionsRef = collection(db, 'users', uid, 'transactions');
  const q = query(userTransactionsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback, (error) => errorCallback?.(error as Error));
};

export const approveDepositRequest = async (requestId: string, amount: number, uid: string, userEmail: string, userName: string, asset: string): Promise<void> => {
  const requestRef = doc(depositsCollection, requestId);
  const requestSnapshot = await getDoc(requestRef);
  if (requestSnapshot.exists() && requestSnapshot.data().status === 'pending') {
    await updateDoc(requestRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
    await incrementUserBalance(uid, amount);
    await createTransactionRecord(uid, userEmail, userName, 'deposit', asset, amount, amount, 'completed', 'Deposit approved by admin');
    await createUserTransaction(uid, {
      type: 'deposit',
      amount,
      asset,
      status: 'completed',
      description: 'Deposit approved by admin',
    });
  }
};

export const rejectDepositRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(depositsCollection, requestId);
  await updateDoc(requestRef, {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });
};

export const rejectWithdrawalRequest = async (requestId: string, userId?: string, transactionId?: string): Promise<void> => {
  const requestRef = doc(withdrawalsCollection, requestId);
  await updateDoc(requestRef, {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });

  if (userId && transactionId) {
    await updateDoc(
      doc(db, 'users', userId, 'transactions', transactionId),
      {
        status: 'rejected',
      }
    );

    await updateDoc(doc(db, 'transactions', transactionId), {
      status: 'rejected',
    });
  }
};

export const updateUserRole = async (uid: string, role: 'user' | 'admin'): Promise<void> => {
  try {
    console.log('[firestoreService] updateUserRole: Updating role for UID:', uid, 'to:', role);
    const userRef = doc(usersCollection, uid);
    await updateDoc(userRef, {
      role,
      updatedAt: serverTimestamp(),
    });
    console.log('[firestoreService] updateUserRole: Role updated successfully');
  } catch (error) {
    console.error('[firestoreService] updateUserRole: Error updating role:', error);
    if (error instanceof Error) {
      console.error('[firestoreService] updateUserRole: Error details:', error.message);
    }
    throw error;
  }
};

export const approveWithdrawalRequest = async (
  requestId: string,
  amount: number,
  uid: string,
  userEmail: string,
  userName: string,
  network: string
): Promise<void> => {
  const requestRef = doc(withdrawalsCollection, requestId);
  const requestSnapshot = await getDoc(requestRef);
  if (requestSnapshot.exists() && requestSnapshot.data().status === 'pending') {
    await updateDoc(requestRef, {
      status: 'approved',
      processedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await incrementUserBalance(uid, -amount);
    await createTransactionRecord(uid, userEmail, userName, 'withdrawal', network, amount, amount, 'completed', 'Withdrawal approved by admin');
    await createUserTransaction(uid, {
      type: 'withdrawal',
      amount,
      asset: network,
      status: 'completed',
      description: 'Withdrawal approved by admin',
    });
  }
};

export const onUserSnapshot = (
  uid: string,
  callback: (snapshot: DocumentSnapshot<DocumentData>) => void,
  errorCallback?: (error: Error) => void
) => {
  const userRef = doc(usersCollection, uid);
  return onSnapshot(userRef, callback, (error) => errorCallback?.(error as Error));
};

export const getUserById = async (uid: string) => {
  try {
    console.log('[firestoreService] getUserById: Fetching user document for UID:', uid);
    const userRef = doc(usersCollection, uid);
    const snapshot = await getDoc(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.data() as FirestoreUser;
      console.log('[firestoreService] getUserById: User found. Role:', userData.role, 'Email:', userData.email);
      return userData;
    } else {
      console.log('[firestoreService] getUserById: User document does not exist for UID:', uid);
      return null;
    }
  } catch (error) {
    console.error('[firestoreService] getUserById: Error fetching user:', error);
    if (error instanceof Error) {
      console.error('[firestoreService] getUserById: Error details:', error.message);
    }
    throw error;
  }
};
