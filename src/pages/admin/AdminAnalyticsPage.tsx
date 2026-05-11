import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  onUsersSnapshot,
  onDepositRequestsSnapshot,
  onWithdrawalRequestsSnapshot,
  onTransactionsSnapshot,
  type DepositRequest,
  type WithdrawalRequest,
} from '../../services/firestoreService';

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  asset: string;
  status: string;
  timestamp: any;
  userEmail?: string;
}

const AdminAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: '$0',
    totalWithdrawals: '$0',
    activeTrades: 0,
    totalVolume: '$0',
  });
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch users data
  useEffect(() => {
    const unsubscribe = onUsersSnapshot((snapshot) => {
      const totalUsers = snapshot.size;

      setStats(prev => ({
        ...prev,
        totalUsers,
      }));
    });

    return () => unsubscribe();
  }, []);

  // Fetch deposit requests
  useEffect(() => {
    const unsubscribe = onDepositRequestsSnapshot((snapshot) => {
      const depositsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as DepositRequest[];

      const totalDeposits = depositsData.reduce((sum, dep) => sum + (dep.amount || 0), 0);
      setDeposits(depositsData.slice(0, 10));
      setStats(prev => ({
        ...prev,
        totalDeposits: `$${totalDeposits.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      }));
    });

    return () => unsubscribe();
  }, []);

  // Fetch withdrawal requests
  useEffect(() => {
    const unsubscribe = onWithdrawalRequestsSnapshot((snapshot) => {
      const withdrawalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WithdrawalRequest[];

      const totalWithdrawals = withdrawalsData.reduce((sum, wd) => sum + (wd.amount || 0), 0);
      setWithdrawals(withdrawalsData.slice(0, 10));
      setStats(prev => ({
        ...prev,
        totalWithdrawals: `$${totalWithdrawals.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      }));
    });

    return () => unsubscribe();
  }, []);

  // Fetch transactions
  useEffect(() => {
    const unsubscribe = onTransactionsSnapshot((snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];

      const totalVolume = transactionsData.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      setTransactions(transactionsData.slice(0, 20));
      setStats(prev => ({
        ...prev,
        totalVolume: `$${totalVolume.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
        activeTrades: transactionsData.filter(tx => tx.status === 'pending' || tx.status === 'active').length,
      }));
    });

    return () => unsubscribe();
  }, []);

  const companyStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toString(),
      icon: Users,
      description: 'Registered user accounts',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Deposits',
      value: stats.totalDeposits,
      icon: DollarSign,
      description: 'All user deposits received',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Withdrawals',
      value: stats.totalWithdrawals,
      icon: TrendingUp,
      description: 'All user withdrawals processed',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Active Trades',
      value: stats.activeTrades.toString(),
      icon: Activity,
      description: 'Currently active positions',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const platformInsights = [
    {
      title: 'Platform Volume',
      value: stats.totalVolume,
      subtitle: 'Total trading volume',
      icon: BarChart3,
    },
    {
      title: 'Pending Deposits',
      value: deposits.filter(d => d.status === 'pending').length.toString(),
      subtitle: 'Awaiting approval',
      icon: DollarSign,
    },
    {
      title: 'Pending Withdrawals',
      value: withdrawals.filter(w => w.status === 'pending').length.toString(),
      subtitle: 'Awaiting processing',
      icon: TrendingUp,
    },
    {
      title: 'Transaction Count',
      value: transactions.length.toString(),
      subtitle: 'All platform transactions',
      icon: Activity,
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
          <h1 className="text-3xl font-bold text-white mb-2">Company Analytics</h1>
          <p className="text-gray-300">Real-time platform metrics and performance overview.</p>
        </motion.div>

        {/* Company Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {companyStats.map((stat, index) => {
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
                      className={`rounded-2xl bg-gradient-to-br ${stat.color} p-3 text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-3 text-sm text-slate-400">{stat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Platform Insights */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Platform Insights</h2>
            <div className="space-y-4">
              {platformInsights.slice(0, 2).map((item, index) => {
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
            <h2 className="text-xl font-semibold text-white mb-4">Request Status</h2>
            <div className="space-y-4">
              {platformInsights.slice(2).map((item, index) => {
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

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Asset</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                  >
                    <td className="px-4 py-3 text-sm text-white">{tx.userEmail || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 capitalize">{tx.type}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">${tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 uppercase">{tx.asset}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'completed'
                            ? 'bg-green-500/20 text-green-300'
                            : tx.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No transactions yet
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;
