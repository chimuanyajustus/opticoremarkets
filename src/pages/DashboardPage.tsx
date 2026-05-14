import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import CryptoCard from '../components/CryptoCard';
import DepositModal from '../components/DepositModal';
import WithdrawalModal from '../components/WithdrawalModal';
import { useAuth } from '../hooks/useAuth';
import { useToastContext } from '../hooks/useToastContext';
import { cryptoApi } from '../services/cryptoApi';
import {
  createDepositRequest,
  createWithdrawalRequest,
  onUserSnapshot,
  onUserTransactionsSnapshot,
  type FirestoreUser,
  type TransactionRecord,
} from '../services/firestoreService';
import type { CryptoData } from '../services/cryptoApi';

const DashboardPage: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { pushToast } = useToastContext();

  const BITCOIN_ADDRESS = 'bc1qyqgl7jevyxar2h6q5xv99qsnlh2knnak8vumzg';

  useEffect(() => {
    let mounted = true;

    const fetchCryptoData = async () => {
      try {
        const data = await cryptoApi.getTopCryptos(10);
        if (mounted) {
          setCryptoData(data);
          setError('');
        }
      } catch (err) {
        console.error('Failed to fetch crypto data:', err);
        if (mounted) {
          setError('Unable to load market prices. Please try again in a moment.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 25000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      Promise.resolve().then(() => {
        setUserData(null);
        setTransactions([]);
      });
      return;
    }

    const unsubscribeUser = onUserSnapshot(user.uid, (snapshot) => {
      setUserData(snapshot.exists() ? (snapshot.data() as FirestoreUser) : null);
    });

    const unsubscribeTransactions = onUserTransactionsSnapshot(user.uid, (snapshot) => {
      const userTransactions = snapshot.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<TransactionRecord, 'id'>) }));
      setTransactions(userTransactions);
    });

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [user?.uid]);

  const bitcoin = cryptoData.find((item) => item.id === 'bitcoin');
  const ethereum = cryptoData.find((item) => item.id === 'ethereum');

  const handleWithdrawRequest = async (amount: number, walletAddress: string) => {
    if (!user?.uid || !user.email) {
      pushToast('Please log in to submit withdrawal requests.', 'error');
      return;
    }

    const userName = userData?.fullName || user.displayName || 'User';

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

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Account summary</p>
              <h3 className="text-xl font-semibold text-white mt-2">Funding and balance</h3>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                <p className="text-sm text-slate-400">Wallet balance</p>
                <p className="mt-3 text-3xl font-semibold text-white">${(userData?.balance ?? 0).toLocaleString()}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                <p className="text-sm text-slate-400">Available funds</p>
                <p className="mt-3 text-3xl font-semibold text-white">${(userData?.balance ?? 0).toLocaleString()}</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                <p className="text-sm text-slate-400 mb-4">Quick actions</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDepositModalOpen(true)}
                    disabled={authLoading || !user}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-3 font-medium transition-colors border border-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={18} />
                    Deposit
                  </button>
                  <button
                    onClick={() => setIsWithdrawalModalOpen(true)}
                    disabled={authLoading || !user}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-4 py-3 font-medium transition-colors border border-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Minus size={18} />
                    Withdraw
                  </button>
                </div>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Transaction history</p>
                  <span className="text-xs text-slate-500">Latest</span>
                </div>
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400">No recent transactions yet.</div>
                  ) : (
                    transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="rounded-3xl bg-slate-900/80 p-4 border border-white/10">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-white">{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
                          <span className={`text-sm ${transaction.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>{transaction.status}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400">${transaction.amount.toLocaleString()} · {transaction.asset}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-blue-300">Live market snapshot</p>
                <h2 className="text-3xl font-bold text-white mt-2">Real-time crypto pricing</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-4 py-2 text-sm text-slate-300">
                {loading ? 'Refreshing prices...' : 'Updated every 25 seconds'}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-6 border border-white/10 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Bitcoin</p>
                  <span className={`text-sm font-semibold ${(bitcoin?.price_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {bitcoin ? `${bitcoin.price_change_percentage_24h.toFixed(2)}%` : '--'}
                  </span>
                </div>
                <div className="text-4xl font-semibold text-white">${bitcoin ? bitcoin.current_price.toLocaleString() : '--'}</div>
                <div className="mt-3 text-sm text-slate-400">24h high ${bitcoin?.high_24h?.toLocaleString() ?? '--'} • low ${bitcoin?.low_24h?.toLocaleString() ?? '--'}</div>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-6 border border-white/10 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Ethereum</p>
                  <span className={`text-sm font-semibold ${(ethereum?.price_change_percentage_24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ethereum ? `${ethereum.price_change_percentage_24h.toFixed(2)}%` : '--'}
                  </span>
                </div>
                <div className="text-4xl font-semibold text-white">${ethereum ? ethereum.current_price.toLocaleString() : '--'}</div>
                <div className="mt-3 text-sm text-slate-400">24h high ${ethereum?.high_24h?.toLocaleString() ?? '--'} • low ${ethereum?.low_24h?.toLocaleString() ?? '--'}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Market watchlist</p>
                <h3 className="text-xl font-semibold text-white">Top tradable coins</h3>
              </div>
              <div className="text-sm text-slate-400">Real-time pricing</div>
            </div>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="rounded-3xl bg-white/5 p-6 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cryptoData.slice(0, 6).map((crypto) => (
                  <CryptoCard key={crypto.id} crypto={crypto} />
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Quick actions</p>
              <h3 className="text-xl font-semibold text-white mt-2">Funding tools</h3>
            </div>
            <div className="grid gap-3">
              <Button variant="outline" className="w-full py-4 flex items-center justify-center gap-2" onClick={() => setIsDepositModalOpen(true)}>
                <Plus className="w-4 h-4" /> Request Deposit
              </Button>
              <Button variant="outline" className="w-full py-4 flex items-center justify-center gap-2" onClick={() => setIsWithdrawalModalOpen(true)}>
                <Minus className="w-4 h-4" /> Request Withdrawal
              </Button>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-5 border border-white/10">
              <p className="text-sm text-slate-400">BTC trend indicator</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-white">${bitcoin ? bitcoin.current_price.toLocaleString() : '--'}</span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${(bitcoin?.price_change_percentage_24h ?? 0) >= 0 ? 'bg-green-500/10 text-emerald-300' : 'bg-red-500/10 text-rose-300'}`}>
                  {(bitcoin?.price_change_percentage_24h ?? 0) >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {bitcoin ? `${bitcoin.price_change_percentage_24h.toFixed(2)}%` : '--'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">Recent activity</h3>
                <p className="text-sm text-slate-400">Latest trade and funding events</p>
              </div>
            </div>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <div className="rounded-3xl bg-slate-950/80 p-6 text-center text-slate-400 border border-white/10">
                  No activity recorded yet. Deposits and withdrawals will appear here after approval.
                </div>
              ) : (
                transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-3xl bg-slate-950/80 p-4 border border-white/10">
                    <div>
                      <p className="text-white font-medium">{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} • {transaction.asset}</p>
                      <p className="text-sm text-slate-400">{transaction.note || 'Completed transaction'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${transaction.amount.toLocaleString()}</p>
                      <p className={`text-sm ${transaction.type === 'deposit' ? 'text-green-400' : 'text-rose-400'}`}>{transaction.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">Watchlist summary</h3>
                <p className="text-sm text-slate-400">Tracked assets and momentum</p>
              </div>
            </div>
            <div className="space-y-3">
              {cryptoData.length === 0 ? (
                <div className="rounded-3xl bg-slate-950/80 p-6 text-center text-slate-400 border border-white/10">
                  Loading watchlist assets...
                </div>
              ) : (
                cryptoData.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-3xl bg-slate-950/80 p-4 border border-white/10">
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-sm text-slate-400">{item.symbol.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${item.current_price.toLocaleString()}</p>
                      <p className={`text-sm ${item.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-rose-400'}`}>{item.price_change_percentage_24h?.toFixed(2)}%</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {error && <div className="rounded-3xl bg-rose-500/10 border border-rose-400/20 p-4 text-sm text-rose-200">{error}</div>}
      </motion.div>
      <div className="modal-container">
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          bitcoinAddress={BITCOIN_ADDRESS}
          onRequestDeposit={handleDepositRequest}
        />
        <WithdrawalModal
          isOpen={isWithdrawalModalOpen}
          onClose={() => setIsWithdrawalModalOpen(false)}
          onSubmit={handleWithdrawRequest}
          maxAmount={userData?.balance ?? 0}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;