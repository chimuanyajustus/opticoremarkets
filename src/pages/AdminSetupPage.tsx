import React, { useState } from 'react';
import { createAdminAccount, promoteUserToAdmin } from '../utils/adminSetup';
import Button from '../components/Button';
import Input from '../components/Input';

const AdminSetupPage: React.FC = () => {
  const [email, setEmail] = useState('chimuanyaatugwu@gmail.com');
  const [password, setPassword] = useState('superman23');
  const [firstName, setFirstName] = useState('Admin');
  const [lastName, setLastName] = useState('User');
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await createAdminAccount(email, password, firstName, lastName);
      setMessage(`✅ Admin account created! UID: ${result.uid}`);
      setUid(result.uid);
      // Clear form
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`❌ Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await promoteUserToAdmin(uid);
      setMessage(`✅ User promoted to admin! UID: ${uid}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`❌ Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-screen bg-gradient-to-br from-gray-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Setup (Development Only)</h1>

        <div className="space-y-8">
          {/* Create Admin Account */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Create Admin Account</h2>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <Input
                type="text"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Admin"
              />
              <Input
                type="text"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="User"
              />
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Admin Account'}
              </Button>
            </form>
          </div>

          {/* Promote User to Admin */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Promote User to Admin</h2>

            <form onSubmit={handlePromoteUser} className="space-y-4">
              <Input
                type="text"
                label="User UID"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="Enter user UID"
              />

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Promoting...' : 'Promote to Admin'}
              </Button>
            </form>
          </div>

          {/* Messages */}
          {message && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 text-green-400">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;
