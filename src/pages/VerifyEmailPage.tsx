import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

const VerifyEmailPage: React.FC = () => {
  const { user, resendVerification, refreshUser, verifyActionCode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const oobCode = new URLSearchParams(location.search).get('oobCode');
  const [message, setMessage] = useState('Check your email to verify your account before logging in.');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const actionCode = params.get('oobCode');

    if (!actionCode) {
      return;
    }

    void (async () => {
      setBusy(true);
      setError('');
      setMessage('Verifying email link...');

      try {
        await verifyActionCode(actionCode);
        setMessage('Verification link applied. Click the button below to confirm your email.');
        setError('');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to verify the email link.';
        setError(message);
        setMessage('');
      } finally {
        setBusy(false);
      }
    })();
  }, [location.search, verifyActionCode]);

  const handleResend = async () => {
    setError('');
    setMessage('');
    setBusy(true);

    try {
      await resendVerification();
      setMessage('Verification email sent successfully!');
      setCountdown(60);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleVerificationCheck = async () => {
    setError('');
    setMessage('');

    if (!user) {
      navigate('/login');
      return;
    }

    setBusy(true);

    try {
      const verified = await refreshUser();
      if (verified) {
        navigate('/login');
      } else {
        setError('Email not verified yet. Please check your inbox and click the link.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to check verification status.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  if (!user && !oobCode) {
    return <Navigate to="/login" replace />;
  }

  if (user?.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-vh-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-3">Verify Your Email</h1>
          <p className="text-gray-300">
            A verification message was sent to <strong>{user?.email || 'your email'}</strong>. Check your inbox and click the email link to complete verification.
          </p>
        </div>

        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleVerificationCheck}
                disabled={busy}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Checking...' : "I've Verified My Email"}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={busy || countdown > 0}
                className="rounded-2xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Working...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
              </button>
            </div>
          {message && <p className="text-green-400 text-sm">{message}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="pt-3 border-t border-white/10 text-sm text-slate-400">
            <p>If the link does not work, check your inbox again or request a new verification email.</p>
            <p className="mt-2">
              Already verified? <Link to="/login" className="text-blue-400 hover:text-blue-300">Return to login</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
