import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reset request for', email);
    alert('Password reset link sent to your email.');
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <Card className="max-w-md w-full">
          <h1 className="text-3xl font-semibold text-white mb-4">Forgot Password</h1>
          <p className="text-gray-400 mb-6">Enter your email and we will send a reset link.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" className="w-full">
              Send Reset Link
            </Button>
          </form>
          <div className="mt-6 text-center text-gray-400">
            <Link to="/login" className="text-blue-400 hover:text-blue-300">
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
