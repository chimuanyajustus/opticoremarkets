import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import {
  createInvestment,
  onAllInvestmentsSnapshot,
  onInvestmentPlansSnapshot,
  onUserInvestmentsSnapshot,
  onUserSnapshot,
  type FirestoreUser,
} from '../services/firestoreService';
import { defaultInvestmentPlans, type InvestmentPlanConfig, type UserInvestment } from '../types/investment';
import { useToastContext } from './useToastContext';

export const useInvestments = () => {
  const { user, isAdmin } = useAuth();
  const { pushToast } = useToastContext();
  const [plans, setPlans] = useState<InvestmentPlanConfig[]>(defaultInvestmentPlans);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [userRecord, setUserRecord] = useState<FirestoreUser | null>(null);
  const [adminInvestments, setAdminInvestments] = useState<UserInvestment[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onInvestmentPlansSnapshot((snapshot) => {
      if (snapshot.empty) {
        setPlans(defaultInvestmentPlans);
      } else {
        const fetchedPlans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as InvestmentPlanConfig[];
        setPlans(fetchedPlans.sort((a, b) => a.name.localeCompare(b.name)));
      }
      setLoadingPlans(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      Promise.resolve().then(() => {
        setUserInvestments([]);
        setUserRecord(null);
        setLoadingInvestments(false);
      });
      return;
    }

    const unsubscribeInvestments = onUserInvestmentsSnapshot(user.uid, (snapshot) => {
      const investments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserInvestment[];
      setUserInvestments(investments);
      setLoadingInvestments(false);
    });

    const unsubscribeUserRecord = onUserSnapshot(user.uid, (snapshot) => {
      setUserRecord(snapshot.exists() ? (snapshot.data() as FirestoreUser) : null);
    });

    return () => {
      unsubscribeInvestments();
      unsubscribeUserRecord();
    };
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubscribe = onAllInvestmentsSnapshot((snapshot) => {
      const investments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserInvestment[];
      setAdminInvestments(investments);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const investInPlan = async (plan: InvestmentPlanConfig, amount: number) => {
    if (!user?.uid) {
      pushToast('Please log in first.', 'error');
      return;
    }

    try {
      setProcessing(true);
      await createInvestment(user.uid, plan, amount);
      pushToast(`${plan.name} investment started for $${amount.toLocaleString()}`, 'success');
    } catch (error) {
      console.error('Investment failed', error);
      pushToast((error as Error)?.message || 'Investment failed', 'error');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const activeInvestments = useMemo(
    () => userInvestments.filter((investment) => investment.status === 'active'),
    [userInvestments]
  );

  return {
    plans,
    userInvestments,
    userRecord,
    activeInvestments,
    adminInvestments,
    loadingPlans,
    loadingInvestments,
    processing,
    investInPlan,
  };
};
