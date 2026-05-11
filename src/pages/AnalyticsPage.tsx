import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wallet, BarChart3, PieChart, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

const AnalyticsPage: React.FC = () => {
  // User account analytics stats
  const accountStats = [
    {
      title: 'Account Balance',
      value: '$0.00',
      icon: Wallet,
      description: 'Your total available balance',
      change: '+0%',
      positive: true,
    },
    {
      title: 'Active Investments',
      value: '0',
      icon: TrendingUp,
      description: 'Number of active investments',
      change: '0',
      positive: false,
    },
    {
      title: 'Total Returns',
      value: '$0.00',
      icon: ArrowUpRight,
      description: 'Profit from all investments',
      change: '+0%',
      positive: true,
    },
    {
      title: 'Account Status',
      value: 'Active',
      icon: BarChart3,
      description: 'Your account verification status',
      change: 'Verified',
      positive: true,
    },
  ];

  const userInsights = [
    {
      title: 'Total Invested',
      value: '$0.00',
      subtitle: 'Capital currently deployed',
      icon: Wallet,
    },
    {
      title: 'Current ROI',
      value: '0%',
      subtitle: 'Return on investment',
      icon: TrendingUp,
    },
    {
      title: 'Pending Withdrawals',
      value: '$0.00',
      subtitle: 'Funds awaiting transfer',
      icon: ArrowDownLeft,
    },
    {
      title: 'Portfolio Distribution',
      value: 'Mixed',
      subtitle: 'Asset allocation overview',
      icon: PieChart,
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Your Account Analytics</h1>
          <p className="text-gray-300">Monitor your personal investment performance and account metrics.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {accountStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl hover:border-blue-400/50 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{stat.title}</p>
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="rounded-2xl bg-slate-950/90 p-3 text-blue-300"
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <p className="text-3xl font-semibold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-400">{stat.description}</p>
                  <div className={`mt-3 text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-gray-400'}`}>
                    {stat.change}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Investment Summary</h2>
            <div className="space-y-4">
              {userInsights.slice(0, 2).map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="rounded-3xl bg-slate-950/80 p-4 border border-white/10 hover:border-blue-400/30 transition-all duration-300 relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-3xl" />
                    <div className="relative z-10 flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-400" />
                        <p className="text-white font-medium">{item.title}</p>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded">Live</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.subtitle}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Account Details</h2>
            <div className="space-y-4">
              {userInsights.slice(2).map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="rounded-3xl bg-slate-950/80 p-4 border border-white/10 hover:border-purple-400/30 transition-all duration-300 relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 rounded-3xl" />
                    <div className="relative z-10 flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-purple-400" />
                        <p className="text-white font-medium">{item.title}</p>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-900/50 px-2 py-1 rounded">Active</span>
                    </div>
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.subtitle}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Account Activity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-950/80 p-5 border border-white/10 hover:border-blue-400/30 transition-all duration-300 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-3xl" />
              <div className="relative z-10">
                <p className="text-sm text-slate-400">Total Transactions</p>
                <p className="mt-3 text-3xl font-semibold text-white">0</p>
                <p className="mt-2 text-sm text-slate-400">All deposits, withdrawals, and trades</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-3xl bg-slate-950/80 p-5 border border-white/10 hover:border-purple-400/30 transition-all duration-300 relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 rounded-3xl" />
              <div className="relative z-10">
                <p className="text-sm text-slate-400">Last Activity</p>
                <p className="mt-3 text-lg font-semibold text-white">-</p>
                <p className="mt-2 text-sm text-slate-400">Your most recent account action</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
