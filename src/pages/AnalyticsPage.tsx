import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, BarChart3, PieChart, ArrowUpRight, ArrowDownLeft, Plus, Minus } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../hooks/useAuth';
import { useInvestments } from '../hooks/useInvestments';
import { onUserSnapshot, onUserTransactionsSnapshot, createDepositRequest, createWithdrawalRequest, type TransactionRecord, type FirestoreUser } from '../services/firestoreService';
import { useToastContext } from '../hooks/useToastContext';
import DepositModal from '../components/DepositModal';
import WithdrawalModal from '../components/WithdrawalModal';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { activeInvestments } = useInvestments();
  const { pushToast } = useToastContext();
  
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setUserData(null);
      setTransactions([]);
      return;
    }

    const unsubscribeUser = onUserSnapshot(user.uid, (snapshot) => {
      setUserData(snapshot.exists() ? (snapshot.data() as FirestoreUser) : null);
    });

    const unsubscribeTransactions = onUserTransactionsSnapshot(user.uid, (snapshot) => {
      const userTransactions = snapshot.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<TransactionRecord, 'id'>) })) as TransactionRecord[];
      setTransactions(userTransactions);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [user?.uid]);

  const handleDepositRequest = async (amount: number) => {
    if (!user?.uid || !user.email) {
      pushToast('Please log in to submit deposit requests.', 'error');
      return;
    }

    const userName = userData?.fullName || user.displayName || 'User';

    try {
      await createDepositRequest(user.uid, user.email, userName, amount, 'BTC');
      pushToast('Deposit request submitted successfully.', 'success');
      setIsDepositModalOpen(false);
    } catch (err) {
      console.error('Failed to submit deposit request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      pushToast(`Unable to submit deposit request: ${errorMessage}`, 'error');
    }
  };

  const handleWithdrawRequest = async (amount: number, walletAddress: string) => {
    if (!user?.uid || !user.email) {
      pushToast('Please log in to submit withdrawal requests.', 'error');
      return;
    }

    if (!userData) {
      pushToast('Loading user data. Please wait and try again.', 'error');
      return;
    }

    const userName = userData.fullName || user.displayName || 'User';

    try {
      await createWithdrawalRequest(user.uid, user.email, userName, amount, walletAddress, 'BTC');
      pushToast('Withdrawal request submitted successfully.', 'success');
      setIsWithdrawalModalOpen(false);
    } catch (err) {
      console.error('Failed to submit withdrawal request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      pushToast(`Unable to submit withdrawal request: ${errorMessage}`, 'error');
    }
  };

  const userBalance = useMemo(() => {
    return userData?.balance ?? 0;
  }, [userData]);

  const totalInvested = useMemo(() => {
    return activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  }, [activeInvestments]);

  const totalProfit = useMemo(() => {
    return activeInvestments.reduce((sum, inv) => sum + inv.totalProfit, 0);
  }, [activeInvestments]);

  const projectedPendingProfit = useMemo(() => {
    const nowSeconds = Math.floor(Date.now() / 1000);

    return activeInvestments.reduce((sum, inv) => {
      const lastProfitAtSeconds = inv.lastProfitAt?.seconds ?? inv.startedAt?.seconds ?? 0;
      let intervalSeconds = 86400;

      if (inv.interval === 'hourly') intervalSeconds = 3600;
      else if (inv.interval === 'weekly') intervalSeconds = 604800;
      else if (inv.interval === 'monthly') intervalSeconds = 2592000;

      const secondsSinceLast = Math.max(0, nowSeconds - lastProfitAtSeconds);
      const payoutsDue = Math.floor(secondsSinceLast / intervalSeconds);

      if (payoutsDue < 1) {
        return sum;
      }

      const profitPerInterval = inv.amount * (inv.percentage / 100);
      return sum + profitPerInterval * payoutsDue;
    }, 0);
  }, [activeInvestments]);

  const roi = useMemo(() => {
    if (totalInvested === 0) return 0;
    return ((totalProfit / totalInvested) * 100).toFixed(2);
  }, [totalInvested, totalProfit]);

  const projectedRoi = useMemo(() => {
    if (totalInvested === 0) return 0;
    return (((totalProfit + projectedPendingProfit) / totalInvested) * 100).toFixed(2);
  }, [totalInvested, totalProfit, projectedPendingProfit]);

  const roiDisplay = projectedPendingProfit > 0 ? `${projectedRoi}% (projected)` : `${roi}%`;

  const totalTransactions = transactions.length;
  const lastActivityDate = transactions[0]?.createdAt?.toDate?.()?.toLocaleDateString() ?? '-';

  // User account analytics stats
  const accountStats = [
    {
      title: 'Account Balance',
      value: `$${userBalance.toLocaleString()}`,
      icon: Wallet,
      description: 'Your total available balance',
      change: '+0%',
      positive: true,
    },
    {
      title: 'Active Investments',
      value: activeInvestments.length.toString(),
      icon: TrendingUp,
      description: 'Number of active investments',
      change: activeInvestments.length > 0 ? '+' + activeInvestments.length : '0',
      positive: activeInvestments.length > 0,
    },
    {
      title: 'Total Returns',
      value: `$${(userData?.totalReturns ?? totalProfit).toLocaleString()}`,
      icon: ArrowUpRight,
      description: 'Profit from all investments',
      change: (userData?.totalReturns ?? totalProfit) > 0 ? `+${(userData?.totalReturns ?? totalProfit)}` : '+0%',
      positive: (userData?.totalReturns ?? totalProfit) > 0,
    },
    {
      title: 'Account Status',
      value: userData?.status === 'approved' ? 'Verified' : 'Pending',
      icon: BarChart3,
      description: 'Your account verification status',
      change: userData?.status === 'approved' ? 'Verified' : 'Pending',
      positive: userData?.status === 'approved',
    },
  ];

  const userInsights = [
    {
      title: 'Total Invested',
      value: `$${totalInvested.toLocaleString()}`,
      subtitle: 'Capital currently deployed',
      icon: Wallet,
    },
    {
      title: 'Current ROI',
      value: roiDisplay,
      subtitle: 'Return on investment',
      icon: TrendingUp,
    },
    {
      title: 'Pending Withdrawals',
      value: '$0.00',
      subtitle: 'Funds awaiting transfer',
      icon: ArrowDownLeft,
    },
    {
      title: 'Portfolio Distribution',
      value: activeInvestments.length > 0 ? 'Mixed' : 'Empty',
      subtitle: 'Asset allocation overview',
      icon: PieChart,
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Your Account Analytics</h1>
          <p className="text-gray-300">Monitor your personal investment performance and account metrics.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {accountStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl hover:border-blue-400/50 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{stat.title}</p>
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="rounded-2xl bg-slate-950/90 p-3 text-blue-300"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-400">{stat.description}</p>
                  <div className={`mt-3 text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-gray-400'}`}>
                    {stat.change}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Investment Summary</h2>
            <div className="space-y-4">
              {userInsights.slice(0, 2).map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="rounded-3xl bg-slate-950/80 p-4 border border-white/10 hover:border-blue-400/30 transition-all duration-300 relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-3xl" />
                    <div className="relative z-10 flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-400" />
                        <p className="text-white font-medium">{item.title}</p>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded">Live</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.subtitle}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Account Details</h2>
            <div className="space-y-4">
              {userInsights.slice(2).map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="rounded-3xl bg-slate-950/80 p-4 border border-white/10 hover:border-purple-400/30 transition-all duration-300 relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 rounded-3xl" />
                    <div className="relative z-10 flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-purple-400" />
                        <p className="text-white font-medium">{item.title}</p>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded">Active</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.subtitle}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Account Activity</h2>
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-950/80 p-5 border border-white/10 hover:border-blue-400/30 transition-all duration-300 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-3xl" />
              <div className="relative z-10">
                <p className="text-sm text-slate-400">Total Transactions</p>
                <p className="mt-3 text-3xl font-semibold text-white">{totalTransactions}</p>
                <p className="mt-2 text-sm text-slate-400">All deposits, withdrawals, and trades</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-950/80 p-5 border border-white/10 hover:border-purple-400/30 transition-all duration-300 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 rounded-3xl" />
              <div className="relative z-10">
                <p className="text-sm text-slate-400">Last Activity</p>
                <p className="mt-3 text-lg font-semibold text-white">{lastActivityDate}</p>
                <p className="mt-2 text-sm text-slate-400">Your most recent account action</p>
              </div>
            </motion.div>
          </div>
          <div className="grid gap-3">
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
            >
              <Plus className="w-4 h-4" />
              Submit Deposit Request
            </button>
            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-500/20 border border-rose-500/30 px-4 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/30 transition"
            >
              <Minus className="w-4 h-4" />
              Submit Withdrawal Request
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Transaction History</h2>
            <span className="text-xs text-slate-500">Latest 10 transactions</span>
          </div>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400">No transactions yet.</div>
            ) : (
              transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="rounded-3xl bg-slate-900/80 p-4 border border-white/10 hover:border-blue-400/30 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-white">{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
                    <span className={`text-sm font-semibold ${transaction.type === 'deposit' ? 'text-emerald-400' : transaction.type === 'withdrawal' ? 'text-rose-400' : 'text-blue-400'}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">${transaction.amount.toLocaleString()} · {transaction.asset} · {transaction.createdAt?.toDate?.()?.toLocaleDateString()}</p>
                  {transaction.note && <p className="mt-1 text-xs text-slate-500">{transaction.note}</p>}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        bitcoinAddress="bc1qyqgl7jevyxar2h6q5xv99qsnlh2knnak8vumzg"
        onRequestDeposit={handleDepositRequest}
      />

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSubmit={handleWithdrawRequest}
        maxAmount={userBalance}
      />
    </DashboardLayout>
  );
};

export default AnalyticsPage;
