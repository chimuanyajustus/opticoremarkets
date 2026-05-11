import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  onUsersSnapshot,
  onDepositRequestsSnapshot,
  onWithdrawalRequestsSnapshot,
  onTransactionsSnapshot,
  approveDepositRequest,
  rejectDepositRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  type DepositRequest,
  type WithdrawalRequest,
  type FirestoreUser,
} from '../../services/firestoreService';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeTrades: 0,
  });
  const [recentDeposits, setRecentDeposits] = useState<DepositRequest[]>([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: string, read: boolean}>>([]);

  // Fetch deposit requests in real-time
  const mergeNotifications = (newNotifications: Array<{id: string; message: string; type: string; read: boolean}>) => {
    setNotifications((prev) => {
      const seenIds = new Set(prev.map((notification) => notification.id));
      return [...prev, ...newNotifications.filter((notification) => !seenIds.has(notification.id))];
    });
  };

  useEffect(() => {
    const unsubscribe = onDepositRequestsSnapshot((snapshot) => {
      const deposits = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .slice(0, 5) as DepositRequest[];
      
      setRecentDeposits(deposits);
      
      // Update notifications for pending deposits
      const pendingDeposits = snapshot.docs.filter(doc => doc.data().status === 'pending');
      mergeNotifications(pendingDeposits.map(doc => ({
        id: doc.id,
        message: `New deposit request of ${doc.data().amount} ${doc.data().asset} from ${doc.data().userEmail}`,
        type: 'deposit',
        read: false,
      })));
    });

    return () => unsubscribe();
  }, []);

  // Fetch withdrawal requests in real-time
  useEffect(() => {
    const unsubscribe = onWithdrawalRequestsSnapshot((snapshot) => {
      const withdrawals = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .slice(0, 5) as WithdrawalRequest[];

      setRecentWithdrawals(withdrawals);

      const pendingWithdrawals = snapshot.docs.filter(doc => doc.data().status === 'pending');
      mergeNotifications(pendingWithdrawals.map(doc => ({
        id: doc.id,
        message: `New withdrawal request of ${doc.data().amount} ${doc.data().asset} from ${doc.data().userEmail}`,
        type: 'withdrawal',
        read: false,
      })));
    });

    return () => unsubscribe();
  }, []);

  // Fetch user count in real-time
  useEffect(() => {
    const unsubscribe = onUsersSnapshot((snapshot) => {
      const totalUsers = snapshot.size;
      const totalDeposits = snapshot.docs.reduce((sum: number, doc) => {
        return sum + ((doc.data() as FirestoreUser).balance || 0);
      }, 0);

      setStats(prev => ({
        ...prev,
        totalUsers,
        totalDeposits,
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onWithdrawalRequestsSnapshot((snapshot) => {
      const totalWithdrawals = snapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + ((data.amount && data.status === 'approved') ? data.amount : 0);
      }, 0);

      setStats(prev => ({
        ...prev,
        totalWithdrawals,
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onTransactionsSnapshot((snapshot) => {
      const activeTrades = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.type === 'trade' && data.status === 'completed';
      }).length;

      setStats(prev => ({
        ...prev,
        activeTrades,
      }));
    });

    return () => unsubscribe();
  }, []);

  const handleApproveDeposit = async (deposit: DepositRequest) => {
    try {
      await approveDepositRequest(deposit.id, deposit.amount, deposit.uid, deposit.userEmail, deposit.userName, deposit.asset);
    } catch (error) {
      console.error('Failed to approve deposit request:', error);
    }
  };

  const handleRejectDeposit = async (id: string) => {
    try {
      await rejectDepositRequest(id);
    } catch (error) {
      console.error('Failed to reject deposit request:', error);
    }
  };

  const handleApproveWithdrawal = async (withdrawal: WithdrawalRequest) => {
    try {
      await approveWithdrawalRequest(withdrawal.id, withdrawal.amount, withdrawal.uid, withdrawal.userEmail, withdrawal.userName, withdrawal.asset);
    } catch (error) {
      console.error('Failed to approve withdrawal request:', error);
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    try {
      await rejectWithdrawalRequest(id);
    } catch (error) {
      console.error('Failed to reject withdrawal request:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage users, deposits, and platform analytics</p>
        </motion.div>

        {/* Notifications */}
        {notifications.filter(n => !n.read).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-400 mr-2">🔔</span>
                <span className="text-yellow-400 font-medium">New Notifications</span>
              </div>
              <div className="space-x-2">
                {notifications.filter(n => !n.read).map(notification => (
                  <div key={notification.id} className="inline-block">
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded"
                    >
                      Mark Read
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {notifications.filter(n => !n.read).map(notification => (
              <p key={notification.id} className="text-yellow-200 mt-2">{notification.message}</p>
            ))}
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'from-blue-500 to-blue-600' },
            { title: 'Total Deposits', value: `$${stats.totalDeposits.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-green-600' },
            { title: 'Total Withdrawals', value: `$${stats.totalWithdrawals.toLocaleString()}`, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
            { title: 'Active Trades', value: stats.activeTrades.toString(), icon: Activity, color: 'from-orange-500 to-orange-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/admin/users">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-left"
            >
              <h3 className="text-lg font-bold mb-1">Manage Users</h3>
              <p className="text-blue-100 text-sm">View and edit user accounts</p>
            </motion.button>
          </Link>

          <Link to="/admin/investments">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-left"
            >
              <h3 className="text-lg font-bold mb-1">Investment Plans</h3>
              <p className="text-green-100 text-sm">Manage plan rates and active investments</p>
            </motion.button>
          </Link>

          <Link to="/admin/analytics">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-left"
            >
              <h3 className="text-lg font-bold mb-1">Analytics</h3>
              <p className="text-purple-100 text-sm">View platform statistics</p>
            </motion.button>
          </Link>
        </div>

        {/* Recent Deposits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Recent Deposit Requests</h2>

          {recentDeposits.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No deposit requests</div>
          ) : (
            <div className="space-y-4">
              {recentDeposits.map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {deposit.asset[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{deposit.userEmail}</p>
                      <p className="text-gray-400 text-sm">{deposit.asset} • {deposit.amount} {deposit.asset}</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <p className="text-white font-semibold">${deposit.amount.toLocaleString()}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                          deposit.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : deposit.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {deposit.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {deposit.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                      </span>
                    </div>

                    {deposit.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleApproveDeposit(deposit)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectDeposit(deposit.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Withdrawals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20 mt-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Recent Withdrawal Requests</h2>

          {recentWithdrawals.length === 0 ? (
            <div className="text-center text-gray-400 py-4">No withdrawal requests</div>
          ) : (
            <div className="space-y-4">
              {recentWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {withdrawal.asset[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium">{withdrawal.userEmail}</p>
                      <p className="text-gray-400 text-sm">{withdrawal.asset} • {withdrawal.amount} {withdrawal.asset}</p>
                      {withdrawal.walletAddress && (
                        <p className="mt-1 text-xs text-slate-400 break-all">{withdrawal.walletAddress}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <p className="text-white font-semibold">${withdrawal.amount.toLocaleString()}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                          withdrawal.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : withdrawal.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {withdrawal.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {withdrawal.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </span>
                    </div>

                    {withdrawal.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleApproveWithdrawal(withdrawal)}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(withdrawal.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminDashboardPage;