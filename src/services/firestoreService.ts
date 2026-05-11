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
  runTransaction,
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
  emailVerified: boolean;
  verificationStatus: 'pending' | 'verified';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
}

export interface DepositRequest {
  id: string;
  uid: string;
  userEmail: string;
  userName: string;
  amount: number;
  asset: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface WithdrawalRequest {
  id: string;
  uid: string;
  userEmail: string;
  userName: string;
  amount: number;
  asset: string;
  walletAddress?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface TransactionRecord {
  id: string;
  uid: string;
  userEmail: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'investment';
  asset: string;
  amount: number;
  amountUsd: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Timestamp;
  timestamp?: Timestamp;
  note?: string;
}

const usersCollection = collection(db, 'users');
const depositsCollection = collection(db, 'depositRequests');
const withdrawalsCollection = collection(db, 'withdrawalRequests');
const transactionsCollection = collection(db, 'transactions');
const investmentPlansCollection = collection(db, 'investmentPlans');
const investmentsCollection = collection(db, 'investments');

export const createUserRecord = async (
  uid: string,
  fullName: string,
  email: string
): Promise<void> => {
  const userRef = doc(usersCollection, uid);
  await setDoc(userRef, {
    uid,
    fullName,
    email,
    role: 'user',
    status: 'pending',
    balance: 0,
    emailVerified: false,
    verificationStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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

export const createDepositRequest = async (
  uid: string,
  userEmail: string,
  userName: string,
  amount: number,
  asset: string
): Promise<void> => {
  await addDoc(depositsCollection, {
    uid,
    userEmail,
    userName,
    amount,
    asset,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

export const createWithdrawalRequest = async (
  uid: string,
  userEmail: string,
  userName: string,
  amount: number,
  asset: string,
  walletAddress: string
): Promise<void> => {
  await addDoc(withdrawalsCollection, {
    uid,
    userEmail,
    userName,
    amount,
    asset,
    walletAddress,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

export const createTransactionRecord = async (
  uid: string,
  userEmail: string,
  userName: string,
  type: 'deposit' | 'withdrawal' | 'trade' | 'investment',
  asset: string,
  amount: number,
  amountUsd: number,
  status: 'completed' | 'pending' | 'failed',
  note?: string
): Promise<void> => {
  await addDoc(transactionsCollection, {
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
  });
};

export const createInvestment = async (
  userId: string,
  plan: InvestmentPlanConfig,
  amount: number
): Promise<void> => {
  const userRef = doc(usersCollection, userId);
  const investmentRef = doc(investmentsCollection);

  const userData = await runTransaction<{
    balance: number;
    email: string;
    fullName: string;
  }>(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);
    if (!userSnapshot.exists()) {
      throw new Error('User not found.');
    }

    const currentUserData = userSnapshot.data() as {
      balance: number;
      email: string;
      fullName: string;
    };
    const currentBalance = currentUserData.balance ?? 0;

    if (amount <= 0) {
      throw new Error('Investment amount must be greater than zero.');
    }

    if (currentBalance < amount) {
      throw new Error('Insufficient balance for investment.');
    }

    if (amount < plan.minAmount) {
      throw new Error(`Investment amount must be at least $${plan.minAmount.toLocaleString()}.`);
    }

    if (plan.maxAmount !== Number.POSITIVE_INFINITY && amount > plan.maxAmount) {
      throw new Error(`Investment amount cannot exceed $${plan.maxAmount.toLocaleString()}.`);
    }

    transaction.update(userRef, {
      balance: increment(-amount),
      updatedAt: serverTimestamp(),
    });

    transaction.set(investmentRef, {
      userId,
      planId: plan.id,
      planName: plan.name,
      amount,
      percentage: plan.percentage,
      interval: plan.interval,
      startedAt: serverTimestamp(),
      lastProfitAt: serverTimestamp(),
      totalProfit: 0,
      status: 'active',
    });

    return currentUserData;
  });

  await createTransactionRecord(
    userId,
    userData.email,
    userData.fullName,
    'investment',
    plan.name,
    amount,
    amount,
    'completed',
    `Started ${plan.name} plan investment`
  );
};

export const onInvestmentPlansSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void
) => {
  const q = query(investmentPlansCollection, orderBy('name', 'asc'));
  return onSnapshot(q, callback);
};

export const onUserInvestmentsSnapshot = (
  userId: string,
  callback: (snapshot: QuerySnapshot<DocumentData>) => void
) => {
  const q = query(investmentsCollection, where('userId', '==', userId), orderBy('startedAt', 'desc'));
  return onSnapshot(q, callback);
};

export const onAllInvestmentsSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void
) => {
  const q = query(investmentsCollection, orderBy('startedAt', 'desc'));
  return onSnapshot(q, callback);
};

export const onUsersSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void
) => {
  const q = query(usersCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback);
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
  callback: (snapshot: QuerySnapshot<DocumentData>) => void
) => {
  const q = query(depositsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback);
};

export const onWithdrawalRequestsSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void
) => {
  const q = query(withdrawalsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback);
};

export const onTransactionsSnapshot = (
  callback: (snapshot: QuerySnapshot<DocumentData>) => void
) => {
  const q = query(transactionsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, callback);
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
  }
};

export const rejectDepositRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(depositsCollection, requestId);
  await updateDoc(requestRef, {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });
};

export const rejectWithdrawalRequest = async (requestId: string): Promise<void> => {
  const requestRef = doc(withdrawalsCollection, requestId);
  await updateDoc(requestRef, {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  });
};

export const updateUserRole = async (uid: string, role: 'user' | 'admin'): Promise<void> => {
  const userRef = doc(usersCollection, uid);
  await updateDoc(userRef, {
    role,
    updatedAt: serverTimestamp(),
  });
};

export const approveWithdrawalRequest = async (
  requestId: string,
  amount: number,
  uid: string,
  userEmail: string,
  userName: string,
  asset: string
): Promise<void> => {
  const requestRef = doc(withdrawalsCollection, requestId);
  const requestSnapshot = await getDoc(requestRef);
  if (requestSnapshot.exists() && requestSnapshot.data().status === 'pending') {
    await updateDoc(requestRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
    await incrementUserBalance(uid, -amount);
    await createTransactionRecord(uid, userEmail, userName, 'withdrawal', asset, amount, amount, 'completed', 'Withdrawal approved by admin');
  }
};

export const onUserSnapshot = (
  uid: string,
  callback: (snapshot: DocumentSnapshot<DocumentData>) => void
) => {
  const userRef = doc(usersCollection, uid);
  return onSnapshot(userRef, callback);
};

export const getUserById = async (uid: string) => {
  const userRef = doc(usersCollection, uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? (snapshot.data() as FirestoreUser) : null;
};
