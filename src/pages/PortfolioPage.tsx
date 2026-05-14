import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Search, Sparkles, Plus, Minus } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useInvestments } from '../hooks/useInvestments';
import { useAuth } from '../hooks/useAuth';
import { onUserTransactionsSnapshot, createDepositRequest, createWithdrawalRequest, type TransactionRecord } from '../services/firestoreService';
import { useToastContext } from '../hooks/useToastContext';
import Modal from '../components/Modal';
import DepositModal from '../components/DepositModal';
import WithdrawalModal from '../components/WithdrawalModal';
import type { InvestmentPlanConfig } from '../types/investment';

const PortfolioPage: React.FC = () => {
  const {
    plans,
    userRecord,
    activeInvestments,
    loadingPlans,
    loadingInvestments,
    processing,
    investInPlan,
  } = useInvestments();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlanConfig | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const { pushToast } = useToastContext();

  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      return;
    }

    const unsubscribe = onUserTransactionsSnapshot(user.uid, (snapshot) => {
      const userTransactions = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<TransactionRecord, 'id'>) }));
      setTransactions(userTransactions);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const userBalance = useMemo(() => {
    return userRecord?.balance ?? 0;
  }, [userRecord]);

  const investmentsSummary = useMemo(() => {
    const active = activeInvestments.length;
    const totalProfit = activeInvestments.reduce((sum, inv) => sum + inv.totalProfit, 0);
    const totalAmount = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    return { active, totalProfit, totalAmount };
  }, [activeInvestments]);

  const filteredPlans = plans.filter((plan) => {
    const name = plan.name ? plan.name.toString().toLowerCase() : '';
    const description = plan.description ? plan.description.toString().toLowerCase() : '';
    const query = searchTerm.toLowerCase();
    return name.includes(query) || description.includes(query);
  });

  const handleOpenModal = (plan: InvestmentPlanConfig) => {
    setSelectedPlan(plan);
    setInvestmentAmount('');
    setIsModalOpen(true);
  };

  const handleWithdrawRequest = async (amount: number, walletAddress: string) => {
    if (!user?.uid || !user.email) {
      pushToast('Please log in to submit withdrawal requests.', 'error');
      return;
    }

    const userName = userRecord?.fullName || user.displayName || 'User';

    try {
      await createWithdrawalRequest(user.uid, user.email, userName, amount, 'BTC', walletAddress);
      pushToast('Withdrawal request submitted successfully.', 'success');
      setIsWithdrawalModalOpen(false);
    } catch (err) {
      console.error('Failed to submit withdrawal request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      pushToast(`Unable to submit withdrawal request: ${errorMessage}`, 'error');
    }
  };

  const handleDepositRequest = async (amount: number) => {
    if (!user?.uid || !user.email) {
      pushToast('Please log in to submit deposit requests.', 'error');
      return;
    }

    const userName = userRecord?.fullName || user.displayName || 'User';

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

  const handleSubmitInvestment = async () => {
    if (!selectedPlan) return;
    const amount = Number(investmentAmount.replace(/[^0-9.]/g, ''));
    await investInPlan(selectedPlan, amount);
    setIsModalOpen(false);
    setInvestmentAmount('');
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Investments</h1>
          <p className="text-gray-300">Choose a plan and grow your balance with hourly or daily compounding.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/10">
            <p className="text-sm uppercase tracking-[0.32em] text-blue-300 mb-3">Available Balance</p>
            <p className="text-4xl font-bold text-white">${userBalance.toLocaleString()}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
              >
                <Plus className="w-4 h-4" />
                Deposit
              </button>
              <button
                onClick={() => setIsWithdrawalModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-rose-500/20 border border-rose-500/30 px-3 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/30 transition"
              >
                <Minus className="w-4 h-4" />
                Withdraw
              </button>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/10">
            <p className="text-sm uppercase tracking-[0.32em] text-blue-300 mb-3">Active Investments</p>
            <p className="text-4xl font-bold text-white">{investmentsSummary.active}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/10">
            <p className="text-sm uppercase tracking-[0.32em] text-blue-300 mb-3">Total Invested</p>
            <p className="text-4xl font-bold text-white">${investmentsSummary.totalAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Investment Plans</h2>
              <p className="text-gray-400">Pick a plan aligned to your deposit size and payout cadence.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search plans..."
                className="w-full rounded-2xl border border-white/15 bg-slate-950/40 py-3 pl-11 pr-4 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {loadingPlans ? (
              <div className="col-span-full rounded-3xl bg-white/10 p-8 text-center text-gray-400">Loading plans...</div>
            ) : (
              filteredPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className={`rounded-3xl border border-white/10 p-6 shadow-xl transition-all duration-200 ${
                    plan.active ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/80' : 'bg-slate-950/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                      <p className="text-sm text-gray-400">{plan.description}</p>
                    </div>
                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
                      {plan.interval}
                    </span>
                  </div>
                  <div className="mb-6">
                    <p className="text-5xl font-bold text-white">{plan.percentage}%</p>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Profit</p>
                  </div>
                  <div className="space-y-3 mb-6 text-sm text-gray-300">
                    <p>Min: ${plan.minAmount.toLocaleString()}</p>
                    <p>Max: {plan.maxAmount === Number.POSITIVE_INFINITY ? 'Unlimited' : `$${plan.maxAmount.toLocaleString()}`}</p>
                  </div>
                  <button
                    disabled={!plan.active || userBalance < plan.minAmount}
                    onClick={() => handleOpenModal(plan)}
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 ${plan.active && userBalance >= plan.minAmount ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-slate-600 cursor-not-allowed'}`}
                  >
                    {plan.active ? (userBalance >= plan.minAmount ? 'Invest Now' : 'Insufficient balance') : 'Paused'}
                  </button>
                  {plan.active && userBalance < plan.minAmount && (
                    <p className="mt-3 text-xs text-rose-400">Requires at least ${plan.minAmount.toLocaleString()} balance.</p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Active Investments</h2>
          <div className="grid gap-6">
            {loadingInvestments ? (
              <div className="rounded-3xl bg-white/10 p-8 text-center text-gray-400">Loading investments...</div>
            ) : activeInvestments.length === 0 ? (
              <div className="rounded-3xl bg-white/10 p-8 text-center text-gray-400">No active investments yet.</div>
            ) : (
              activeInvestments.map((investment) => (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.28em] text-blue-300">{investment.planName}</p>
                      <p className="text-3xl font-semibold text-white">${investment.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">Profit earned: ${investment.totalProfit.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                      <span className="rounded-2xl bg-white/5 px-4 py-2">Status: {investment.status}</span>
                      <span className="rounded-2xl bg-white/5 px-4 py-2">Interval: {investment.interval}</span>
                      <span className="rounded-2xl bg-white/5 px-4 py-2">Rate: {investment.percentage}%</span>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Active Investment</span>
                    </div>
                      <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-2 text-sm text-blue-200">Started {investment.startedAt?.toDate?.()?.toLocaleDateString() ?? 'Unknown'}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Transaction History</h2>
            <span className="text-xs text-slate-500">All activities</span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl">
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400">No transactions yet.</div>
              ) : (
                transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="rounded-3xl bg-slate-900/80 p-4 border border-white/10">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white">{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
                      <span className={`text-sm ${transaction.type === 'deposit' ? 'text-emerald-400' : transaction.type === 'withdrawal' ? 'text-rose-400' : 'text-blue-400'}`}>{transaction.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">${transaction.amount.toLocaleString()} · {transaction.asset} · {transaction.createdAt?.toDate?.()?.toLocaleDateString()}</p>
                    {transaction.note && <p className="mt-1 text-xs text-slate-500">{transaction.note}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-4 text-gray-300">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Investment Summary</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-gray-400">Active plans</p>
              <p className="mt-2 text-2xl font-semibold text-white">{investmentsSummary.active}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-gray-400">Total invested</p>
              <p className="mt-2 text-2xl font-semibold text-white">${investmentsSummary.totalAmount.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-5">
              <p className="text-sm text-gray-400">Total profit</p>
              <p className="mt-2 text-2xl font-semibold text-white">${investmentsSummary.totalProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedPlan ? `Invest in ${selectedPlan.name}` : 'Invest'}>
        {selectedPlan ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">{selectedPlan.description}</p>
              <p className="text-sm text-gray-300">Min: ${selectedPlan.minAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-300">Max: {selectedPlan.maxAmount === Number.POSITIVE_INFINITY ? 'Unlimited' : `$${selectedPlan.maxAmount.toLocaleString()}`}</p>
              <p className="text-sm text-gray-300">Available balance: ${userBalance.toLocaleString()}</p>
            </div>
            <label className="block text-sm font-medium text-gray-200">Investment amount</label>
            <input
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              type="number"
              min={selectedPlan.minAmount}
              max={selectedPlan.maxAmount === Number.POSITIVE_INFINITY ? undefined : selectedPlan.maxAmount}
              placeholder="Enter amount"
              className="w-full rounded-2xl border border-white/15 bg-slate-950/90 px-4 py-3 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
            <button
              disabled={processing}
              onClick={handleSubmitInvestment}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {processing ? 'Investing...' : 'Confirm Investment'}
            </button>
          </div>
        ) : (
          <p className="text-gray-400">Select a plan to continue.</p>
        )}
      </Modal>

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

export default PortfolioPage;
