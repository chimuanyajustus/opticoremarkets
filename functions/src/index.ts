import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

type InvestmentInterval = 'hourly' | 'daily';

type InvestmentStatus = 'active' | 'completed';

interface InvestmentRecord {
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  percentage: number;
  interval: InvestmentInterval;
  startedAt: admin.firestore.Timestamp;
  lastProfitAt: admin.firestore.Timestamp;
  totalProfit: number;
  status: InvestmentStatus;
}

const INTERVAL_SECONDS: Record<InvestmentInterval, number> = {
  hourly: 3600,
  daily: 86400,
};

export const distributeInvestmentProfit = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const activeInvestments = await db
      .collection('investments')
      .where('status', '==', 'active')
      .get();

    const updates: Promise<unknown>[] = [];

    activeInvestments.docs.forEach((doc) => {
      const investment = doc.data() as InvestmentRecord;
      const lastProfit = investment.lastProfitAt || investment.startedAt;
      const intervalSeconds = INTERVAL_SECONDS[investment.interval];
      const secondsSinceLast = now.seconds - lastProfit.seconds;
      const payoutsDue = Math.floor(secondsSinceLast / intervalSeconds);

      if (payoutsDue < 1) {
        return;
      }

      const profitPerInterval = investment.amount * (investment.percentage / 100);
      const totalProfitDelta = profitPerInterval * payoutsDue;
      const updatedLastProfitAt = admin.firestore.Timestamp.fromMillis(
        lastProfit.toMillis() + payoutsDue * intervalSeconds * 1000
      );

      const investmentRef = db.collection('investments').doc(doc.id);
      const userRef = db.collection('users').doc(investment.userId);

      updates.push(
        db.runTransaction(async (transaction) => {
          const userSnapshot = await transaction.get(userRef);
          if (!userSnapshot.exists) {
            return;
          }

          transaction.update(investmentRef, {
            totalProfit: admin.firestore.FieldValue.increment(totalProfitDelta),
            lastProfitAt: updatedLastProfitAt,
          });

          transaction.update(userRef, {
            balance: admin.firestore.FieldValue.increment(totalProfitDelta),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          await db.collection('transactions').add({
            uid: investment.userId,
            userEmail: userSnapshot.data()?.email || '',
            userName: userSnapshot.data()?.fullName || '',
            type: 'investment',
            asset: investment.planName,
            amount: totalProfitDelta,
            amountUsd: totalProfitDelta,
            status: 'completed',
            note: `Auto profit payout for ${investment.planName} plan`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        })
      );
    });

    await Promise.all(updates);
    return null;
  });
