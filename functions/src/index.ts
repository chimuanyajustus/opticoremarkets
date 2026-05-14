import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import apiApp from './api';

admin.initializeApp();
const db = admin.firestore();

type InvestmentInterval = 'hourly' | 'daily' | 'weekly' | 'monthly';

type InvestmentStatus = 'active' | 'completed';

interface InvestmentRecord {
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  percentage: number;
  interval: InvestmentInterval;
  durationDays?: number;
  startedAt: admin.firestore.Timestamp;
  expiresAt?: admin.firestore.Timestamp;
  lastProfitAt: admin.firestore.Timestamp;
  totalProfit: number;
  accumulatedProfit?: number;
  status: InvestmentStatus;
}

const INTERVAL_SECONDS: Record<InvestmentInterval, number> = {
  hourly: 3600,
  daily: 86400,
  weekly: 604800,
  monthly: 2592000,
};

const getEffectiveEnd = (
  now: admin.firestore.Timestamp,
  expiresAt?: admin.firestore.Timestamp
): admin.firestore.Timestamp => {
  if (!expiresAt) {
    return now;
  }

  return expiresAt.seconds < now.seconds ? expiresAt : now;
};

const calculatePayoutsDue = (
  lastProfitAt: admin.firestore.Timestamp,
  effectiveEnd: admin.firestore.Timestamp,
  intervalSeconds: number
) => {
  const secondsSinceLast = effectiveEnd.seconds - lastProfitAt.seconds;
  return Math.max(0, Math.floor(secondsSinceLast / intervalSeconds));
};

export const distributeInvestmentProfit = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const activeInvestments = await db
      .collection('investments')
      .where('status', '==', 'active')
      .get();

    const updates: Promise<unknown>[] = [];

    activeInvestments.docs.forEach((doc) => {
      const investment = doc.data() as InvestmentRecord;
      const intervalSeconds = INTERVAL_SECONDS[investment.interval];

      if (!intervalSeconds || investment.amount <= 0 || investment.percentage <= 0) {
        return;
      }

      const lastProfit = investment.lastProfitAt || investment.startedAt;
      const effectiveEnd = getEffectiveEnd(now, investment.expiresAt);
      const payoutsDue = calculatePayoutsDue(lastProfit, effectiveEnd, intervalSeconds);

      if (payoutsDue < 1) {
        if (investment.expiresAt && now.seconds >= investment.expiresAt.seconds) {
          updates.push(
            db.runTransaction(async (transaction) => {
              const investmentRef = db.collection('investments').doc(doc.id);
              transaction.update(investmentRef, {
                status: 'completed',
              });
            })
          );
        }
        return;
      }

      const profitPerInterval = investment.amount * (investment.percentage / 100);
      const totalProfitDelta = parseFloat((profitPerInterval * payoutsDue).toFixed(2));
      if (totalProfitDelta <= 0) {
        return;
      }

      const updatedLastProfitAt = admin.firestore.Timestamp.fromMillis(
        lastProfit.toMillis() + payoutsDue * intervalSeconds * 1000
      );

      const shouldComplete = investment.expiresAt
        ? updatedLastProfitAt.toMillis() >= investment.expiresAt.toMillis()
        : false;

      updates.push(
        db.runTransaction(async (transaction) => {
          const investmentRef = db.collection('investments').doc(doc.id);
          const userRef = db.collection('users').doc(investment.userId);
          const userSnapshot = await transaction.get(userRef);
          if (!userSnapshot.exists) {
            return;
          }

          const userData = userSnapshot.data() as { email?: string; fullName?: string };
          const userEmail = userData.email || '';
          const userName = userData.fullName || '';

          const globalTxRef = db.collection('transactions').doc();
          const userTxRef = db.collection('users').doc(investment.userId).collection('transactions').doc();

          transaction.update(investmentRef, {
            totalProfit: admin.firestore.FieldValue.increment(totalProfitDelta),
            accumulatedProfit: admin.firestore.FieldValue.increment(totalProfitDelta),
            lastProfitAt: updatedLastProfitAt,
            status: shouldComplete ? 'completed' : investment.status,
          });

          transaction.update(userRef, {
            balance: admin.firestore.FieldValue.increment(totalProfitDelta),
            totalReturns: admin.firestore.FieldValue.increment(totalProfitDelta),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          const txPayload = {
            userId: investment.userId,
            uid: investment.userId,
            userEmail,
            userName,
            investmentId: doc.id,
            type: 'investment_profit' as const,
            asset: investment.planName,
            amount: totalProfitDelta,
            amountUsd: totalProfitDelta,
            status: 'completed' as const,
            note: `Auto profit payout for ${investment.planName} plan`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          };

          transaction.set(globalTxRef, txPayload);
          transaction.set(userTxRef, txPayload);
        })
      );
    });

    await Promise.all(updates);
    return null;
  });

export const api = functions.https.onRequest(apiApp);
