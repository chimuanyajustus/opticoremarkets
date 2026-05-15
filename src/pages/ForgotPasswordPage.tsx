import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitCount, setSubmitCount] = useState(0);
  const maxSubmitAttempts = 3;

  // Validate email format
  const isValidEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Check for spam submissions
    if (submitCount >= maxSubmitAttempts) {
      setStatus('error');
      setErrorMessage('Too many reset attempts. Please try again in 15 minutes.');
      return;
    }

    // Validate email
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setSubmitCount(prev => prev + 1);

    try {
      await sendPasswordReset(email);
      setStatus('success');
      setSuccessMessage(`Password reset email sent to ${email}. Please check your inbox and spam folder.`);
      setEmail('');

      // Reset form after 5 seconds
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
      }, 5000);
    } catch (error: unknown) {
      setStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Failed to send password reset email. Please try again.';
      setErrorMessage(errorMsg);
    }
  };

  const isSubmitting = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <MainLayout>
      <div className="min-vh-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050610] via-[#0a0e1a] to-[#050610]" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-bl from-blue-500/30 to-purple-500/30 rounded-full filter blur-3xl"
          animate={{
            y: [-50, 50, -50],
            x: [50, -50, 50],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full filter blur-3xl"
          animate={{
            y: [50, -50, 50],
            x: [-50, 50, -50],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full relative z-10"
        >
          <Card className="relative overflow-hidden group">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
            
            <div className="relative z-10 p-5 sm:p-8">
              {!isSuccess ? (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                    <p className="text-gray-400 text-sm">
                      No problem. Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </motion.div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Input
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        required
                        className={isError && email ? 'border-red-500/50' : ''}
                      />
                      {isError && email && !isValidEmail(email) && (
                        <p className="text-red-400 text-xs mt-1">Please enter a valid email address</p>
                      )}
                    </motion.div>

                    {/* Error Message */}
                    {isError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-red-400/10 border border-red-400/20"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{errorMessage}</p>
                      </motion.div>
                    )}

                    {/* Spam Prevention Warning */}
                    {submitCount > 0 && submitCount < maxSubmitAttempts && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-gray-400 text-center"
                      >
                        Reset attempt {submitCount} of {maxSubmitAttempts}
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    >
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isSubmitting || submitCount >= maxSubmitAttempts}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <LoadingSpinner size="sm" color="white" />
                            <span>Sending Reset Link...</span>
                          </div>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 text-center"
                  >
                    <p className="text-gray-400 text-sm">
                      Remember your password?{' '}
                      <Link
                        to="/login"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Back to login
                      </Link>
                    </p>
                  </motion.div>
                </>
              ) : (
                // Success State
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-400/10 border border-green-400/20 rounded-lg p-4 mb-6"
                  >
                    <p className="text-green-400 text-sm">{successMessage}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3"
                  >
                    <p className="text-gray-400 text-sm">
                      Click the link in your email to reset your password. The link will expire in 24 hours.
                    </p>
                    
                    <div className="pt-4">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Return to login
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
