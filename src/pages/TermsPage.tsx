import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';

const TermsPage: React.FC = () => (
  <MainLayout>
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <Card className="max-w-3xl w-full">
        <h1 className="text-3xl font-semibold text-white mb-4">Terms of Service</h1>
        <p className="text-gray-400 leading-7">
          Read our terms and conditions to understand how TradePro keeps your account safe and connected.
        </p>
        <div className="mt-6 space-y-4 text-gray-300">
          <p>By using TradePro, you agree that your account data and interaction history are protected by our policies.</p>
          <p>Keep your login secure, use strong passwords, and contact support if you suspect unauthorized access.</p>
        </div>
      </Card>
    </div>
  </MainLayout>
);

export default TermsPage;
