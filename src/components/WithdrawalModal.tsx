import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../hooks/useAuth';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, walletAddress: string) => Promise<void>;
  maxAmount: number;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose, onSubmit, maxAmount }) => {
  const { user, loading: authLoading } = useAuth();
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setWalletAddress('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validateAddress = (address: string) => {
    // Supports:
    // P2PKH (starts with 1): ~34 chars
    // P2SH (starts with 3): ~34 chars
    // Bech32 P2WPKH (bc1 + lowercase alphanumeric): ~42 chars
    // Bech32 P2WSH (bc1 + lowercase alphanumeric): ~62 chars
    const btcAddressRegex = /^(bc1[a-z0-9]{39,59}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/;
    return btcAddressRegex.test(address);
  };

  const handleSubmit = async () => {
    setError('');

    if (authLoading) {
      setError('Authentication is loading. Please wait and try again.');
      return;
    }

    if (!user) {
      setError('You must be logged in to submit withdrawal requests.');
      return;
    }

    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid withdrawal amount.');
      return;
    }

    if (parsedAmount > maxAmount) {
      setError('Withdrawal amount exceeds available balance.');
      return;
    }

    if (!walletAddress.trim()) {
      setError('Please paste your Bitcoin wallet address.');
      return;
    }

    if (!validateAddress(walletAddress.trim())) {
      setError('Enter a valid Bitcoin address (starts with 1, 3, or bc1).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(parsedAmount, walletAddress.trim());
      // Success is handled by parent component
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      if (errorMessage.includes('Missing or insufficient permissions')) {
        setError('Permission denied. Please try logging out and back in, or contact support.');
      } else {
        setError(`Unable to submit withdrawal request: ${errorMessage}`);
      }
      console.error('Withdrawal submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
      >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Bitcoin Withdrawal</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Request a Bitcoin Withdrawal</h2>
              </div>

              <div className="grid gap-5 rounded-3xl bg-slate-950/80 p-6 border border-white/10">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Withdrawal Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter amount in USD"
                    className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
                  />
                  <p className="mt-2 text-xs text-slate-500">Available balance: ${maxAmount.toLocaleString()}</p>
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">Bitcoin Wallet Address</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(event) => setWalletAddress(event.target.value)}
                    placeholder="Paste your BTC address"
                    className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {error && <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-200">{error}</div>}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full sm:w-auto" 
                  disabled={isSubmitting || authLoading || !user}
                >
                  {authLoading ? 'Authenticating...' : isSubmitting ? 'Submitting...' : 'Submit Withdrawal'}
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
                  Cancel
                </Button>
              </div>

              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                <p className="text-sm text-blue-100">
                  Withdrawals are processed after approval. Enter a valid Bitcoin address only; unsupported addresses may delay processing.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
  );
};

export default WithdrawalModal;
