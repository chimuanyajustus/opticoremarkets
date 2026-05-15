import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';

const PrivacyPage: React.FC = () => (
  <MainLayout>
    <div className="min-vh-screen flex items-center justify-center px-4 py-12 sm:py-20">
      <Card className="max-w-3xl w-full p-6 sm:p-8">
        <h1 className="text-3xl font-semibold text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-400 leading-7">
          Opticore Markets respects your privacy. We only store information needed to keep your trading account secure and optimized.
        </p>
        <div className="mt-6 space-y-4 text-gray-300">
          <p>We do not sell or share your personal data with third parties without consent.</p>
          <p>Your account details, transaction records, and preferences are secured using modern browser storage standards.</p>
        </div>
      </Card>
    </div>
  </MainLayout>
);

export default PrivacyPage;
