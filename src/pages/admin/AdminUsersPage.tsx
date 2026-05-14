import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Ban, CheckCircle, XCircle, Plus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  onUsersSnapshot,
  updateUserStatus as updateUserStatusInFirestore,
  updateUserRole,
  adminDeposit,
  adminWithdrawal,
  type FirestoreUser,
} from '../../services/firestoreService';
import { useToastContext } from '../../hooks/useToastContext';

const AdminUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [addFundsError, setAddFundsError] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const { pushToast } = useToastContext();

  useEffect(() => {
    // Set up real-time listener for all users
    const unsubscribe = onUsersSnapshot((snapshot) => {
      try {
        const userList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          uid: doc.id,
        })) as FirestoreUser[];
        setUsers(userList);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load users');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = async (uid: string, newStatus: string) => {
    try {
      await updateUserStatusInFirestore(uid, newStatus as 'pending' | 'approved' | 'rejected' | 'suspended');
      // Real-time listener will update the UI automatically
    } catch (err) {
      console.error('Failed to update user status:', err);
      alert('Failed to update user status');
    }
  };

  const handleAddFunds = async () => {
    if (!selectedUser) return;
    setAddFundsError('');
    const amount = Number(addAmount);

    if (!addAmount || Number.isNaN(amount) || amount <= 0) {
      setAddFundsError('Enter a valid amount to add.');
      return;
    }

    setIsAddingFunds(true);
    try {
      if (transactionType === 'deposit') {
        await adminDeposit(selectedUser.uid, selectedUser.email, selectedUser.fullName, amount);
        pushToast(`Deposited $${amount.toLocaleString()} to ${selectedUser.fullName}`, 'success');
      } else {
        await adminWithdrawal(selectedUser.uid, selectedUser.email, selectedUser.fullName, amount);
        pushToast(`Withdrew $${amount.toLocaleString()} from ${selectedUser.fullName}`, 'success');
      }
      setSelectedUser(null);
      setAddAmount('');
      setTransactionType('deposit');
    } catch (err) {
      console.error('Failed to process transaction:', err);
      setAddFundsError('Unable to process transaction. Please try again.');
    } finally {
      setIsAddingFunds(false);
    }
  };

  const closeAddFundsModal = () => {
    setSelectedUser(null);
    setAddAmount('');
    setAddFundsError('');
    setIsAddingFunds(false);
    setTransactionType('deposit');
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
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-300">Manage user accounts, balances, and permissions</p>
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 overflow-hidden"
        >
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-400">Loading users...</div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-red-400">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Verified</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Join Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">{user.fullName}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-semibold">${(user.balance ?? 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.uid, e.target.value as 'user' | 'admin')}
                          className="px-3 py-1 text-xs font-semibold rounded-full border-0 bg-slate-900 text-white"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.status}
                          onChange={(e) => handleUpdateStatus(user.uid, e.target.value)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer ${
                            user.status === 'approved'
                              ? 'bg-green-500/20 text-green-400'
                              : user.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : user.status === 'suspended'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="suspended">Suspended</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {user.emailVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {user.createdAt ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString() : '--'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Add funds"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {user.status === 'approved' ? (
                          <button
                            onClick={() => handleUpdateStatus(user.uid, 'suspended')}
                            className="text-red-400 hover:text-red-300"
                            title="Suspend user"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(user.uid, 'approved')}
                            className="text-green-400 hover:text-green-300"
                            title="Approve user"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-3xl bg-slate-950 p-6 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Manage funds for {selectedUser.fullName}</h3>
                <p className="text-sm text-slate-400">Current balance: ${selectedUser.balance?.toLocaleString() ?? 0}</p>
              </div>
              <button onClick={closeAddFundsModal} className="text-slate-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex rounded-lg bg-slate-800 p-1">
                <button
                  onClick={() => setTransactionType('deposit')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    transactionType === 'deposit'
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setTransactionType('withdrawal')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    transactionType === 'withdrawal'
                      ? 'bg-red-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Withdrawal
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Amount to {transactionType === 'deposit' ? 'deposit' : 'withdraw'}
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
                placeholder="Enter amount"
              />
              {addFundsError && <p className="text-sm text-rose-300">{addFundsError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleAddFunds}
                  disabled={isAddingFunds}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                    transactionType === 'deposit'
                      ? 'bg-emerald-500 hover:bg-emerald-400'
                      : 'bg-red-500 hover:bg-red-400'
                  }`}
                >
                  {isAddingFunds
                    ? 'Processing...'
                    : transactionType === 'deposit'
                    ? 'Deposit Funds'
                    : 'Withdraw Funds'
                  }
                </button>
                <button
                  onClick={closeAddFundsModal}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminUsersPage;