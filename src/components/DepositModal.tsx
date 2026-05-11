import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, X } from 'lucide-react';
import * as QRCode from 'qrcode';
import Button from './Button';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  bitcoinAddress: string;
  onRequestDeposit?: (amount: number) => Promise<void>;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, bitcoinAddress, onRequestDeposit }) => {
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, bitcoinAddress, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch((err: unknown) => console.error('Error generating QR code:', err));
    }
  }, [isOpen, bitcoinAddress]);

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bitcoinAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDepositSubmit = async () => {
    if (!onRequestDeposit) {
      return;
    }

    setError('');
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid deposit amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRequestDeposit(parsedAmount);
    } catch (err) {
      console.error('Deposit request failed:', err);
      setError('Unable to submit deposit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Bitcoin Deposit</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Send Bitcoin to Your Wallet</h2>
          </div>

          <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-950/80 p-6 border border-white/10">
            {/* QR Code */}
            <div className="rounded-xl bg-white p-4">
              <canvas ref={canvasRef} />
            </div>

            {/* Bitcoin Address */}
            <div className="w-full">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Bitcoin Address</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bitcoinAddress}
                  readOnly
                  className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm font-mono text-white outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center justify-center rounded-xl px-4 py-3 transition-colors ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }`}
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              {copied && (
                <p className="mt-2 text-xs text-emerald-400">✓ Copied to clipboard</p>
              )}
            </div>
          </div>

          {onRequestDeposit && (
            <div className="rounded-3xl bg-slate-950/80 p-6 border border-white/10">
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Deposit amount</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Enter deposit amount"
                className="w-full rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
              />
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
            <p className="text-sm text-blue-100">
              Send only Bitcoin to this address. Other cryptocurrencies will not be received. Deposits typically appear within 1-3 confirmations.
            </p>
          </div>

          {error && <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-200">{error}</div>}

          <div className="space-y-3">
            {onRequestDeposit ? (
              <Button onClick={handleDepositSubmit} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Requesting deposit...' : 'Request Deposit'}
              </Button>
            ) : (
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            )}
            {onRequestDeposit && (
              <Button variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DepositModal;
