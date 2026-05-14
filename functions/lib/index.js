"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.distributeInvestmentProfit = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const api_1 = __importDefault(require("./api"));
admin.initializeApp();
const db = admin.firestore();
const INTERVAL_SECONDS = {
    hourly: 3600,
    daily: 86400,
    weekly: 604800,
    monthly: 2592000,
};
const getEffectiveEnd = (now, expiresAt) => {
    if (!expiresAt) {
        return now;
    }
    return expiresAt.seconds < now.seconds ? expiresAt : now;
};
const calculatePayoutsDue = (lastProfitAt, effectiveEnd, intervalSeconds) => {
    const secondsSinceLast = effectiveEnd.seconds - lastProfitAt.seconds;
    return Math.max(0, Math.floor(secondsSinceLast / intervalSeconds));
};
exports.distributeInvestmentProfit = functions.pubsub
    .schedule('every 15 minutes')
    .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const activeInvestments = await db
        .collection('investments')
        .where('status', '==', 'active')
        .get();
    const updates = [];
    activeInvestments.docs.forEach((doc) => {
        const investment = doc.data();
        const intervalSeconds = INTERVAL_SECONDS[investment.interval];
        if (!intervalSeconds || investment.amount <= 0 || investment.percentage <= 0) {
            return;
        }
        const lastProfit = investment.lastProfitAt || investment.startedAt;
        const effectiveEnd = getEffectiveEnd(now, investment.expiresAt);
        const payoutsDue = calculatePayoutsDue(lastProfit, effectiveEnd, intervalSeconds);
        if (payoutsDue < 1) {
            if (investment.expiresAt && now.seconds >= investment.expiresAt.seconds) {
                updates.push(db.runTransaction(async (transaction) => {
                    const investmentRef = db.collection('investments').doc(doc.id);
                    transaction.update(investmentRef, {
                        status: 'completed',
                    });
                }));
            }
            return;
        }
        const profitPerInterval = investment.amount * (investment.percentage / 100);
        const totalProfitDelta = parseFloat((profitPerInterval * payoutsDue).toFixed(2));
        if (totalProfitDelta <= 0) {
            return;
        }
        const updatedLastProfitAt = admin.firestore.Timestamp.fromMillis(lastProfit.toMillis() + payoutsDue * intervalSeconds * 1000);
        const shouldComplete = investment.expiresAt
            ? updatedLastProfitAt.toMillis() >= investment.expiresAt.toMillis()
            : false;
        updates.push(db.runTransaction(async (transaction) => {
            const investmentRef = db.collection('investments').doc(doc.id);
            const userRef = db.collection('users').doc(investment.userId);
            const userSnapshot = await transaction.get(userRef);
            if (!userSnapshot.exists) {
                return;
            }
            const userData = userSnapshot.data();
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
                type: 'investment_profit',
                asset: investment.planName,
                amount: totalProfitDelta,
                amountUsd: totalProfitDelta,
                status: 'completed',
                note: `Auto profit payout for ${investment.planName} plan`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            };
            transaction.set(globalTxRef, txPayload);
            transaction.set(userTxRef, txPayload);
        }));
    });
    await Promise.all(updates);
    return null;
});
exports.api = functions.https.onRequest(api_1.default);
