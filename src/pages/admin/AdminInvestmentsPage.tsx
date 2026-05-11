import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  ensureDefaultInvestmentPlans,
  onAllInvestmentsSnapshot,
  onInvestmentPlansSnapshot,
  updateInvestmentPlanConfig,
} from '../../services/firestoreService';
import { defaultInvestmentPlans, type InvestmentPlanConfig, type UserInvestment } from '../../types/investment';

const AdminInvestmentsPage: React.FC = () => {
  const [plans, setPlans] = useState<InvestmentPlanConfig[]>(defaultInvestmentPlans);
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  useEffect(() => {
    const initPlans = async () => {
      await ensureDefaultInvestmentPlans(defaultInvestmentPlans);
    };
    initPlans();

    const unsubscribePlans = onInvestmentPlansSnapshot((snapshot) => {
      const planData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as InvestmentPlanConfig));
      if (planData.length) {
        setPlans(planData);
      }
    });

    const unsubscribeInvestments = onAllInvestmentsSnapshot((snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserInvestment));
      setInvestments(docs);
      setLoading(false);
    });

    return () => {
      unsubscribePlans();
      unsubscribeInvestments();
    };
  }, []);

  const handleTogglePlan = async (plan: InvestmentPlanConfig) => {
    setSavingPlanId(plan.id);
    try {
      await updateInvestmentPlanConfig(plan.id, { active: !plan.active });
    } catch (error) {
      console.error('Failed to toggle plan', error);
    } finally {
      setSavingPlanId(null);
    }
  };

  const handleUpdatePercentage = async (planId: string, percentage: number) => {
    setSavingPlanId(planId);
    try {
      await updateInvestmentPlanConfig(planId, { percentage });
    } catch (error) {
      console.error('Failed to update percentage', error);
    } finally {
      setSavingPlanId(null);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Investments</h1>
          <p className="text-gray-300">Manage investment plans and monitor all active deposits.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{plan.name}</p>
                  <p className="text-4xl font-bold text-white">{plan.percentage}%</p>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>
                <button
                  disabled={savingPlanId === plan.id}
                  onClick={() => handleTogglePlan(plan)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold text-white transition ${
                    plan.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {plan.active ? 'Pause' : 'Activate'}
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-4 text-gray-300">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Min amount</p>
                  <p className="mt-2 text-lg font-semibold text-white">${plan.minAmount.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-4 text-gray-300">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Max amount</p>
                  <p className="mt-2 text-lg font-semibold text-white">{plan.maxAmount === Number.POSITIVE_INFINITY ? 'Unlimited' : `$${plan.maxAmount.toLocaleString()}`}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <input
                  type="number"
                  defaultValue={plan.percentage}
                  min={0}
                  max={100}
                  onBlur={(e) => handleUpdatePercentage(plan.id, Number(e.target.value))}
                  className="w-24 rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
                <span className="text-sm text-gray-400">Update percentage</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6 text-gray-300">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">All Active Investments</h2>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white/10 p-8 text-center text-gray-400">Loading investments...</div>
          ) : investments.length === 0 ? (
            <div className="rounded-3xl bg-white/10 p-8 text-center text-gray-400">No active investments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Profit</th>
                    <th className="px-4 py-3">Interval</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {investments.map((investment) => (
                    <tr key={investment.id} className="hover:bg-white/5">
                      <td className="px-4 py-4">{investment.userId}</td>
                      <td className="px-4 py-4">{investment.planName}</td>
                      <td className="px-4 py-4">${investment.amount.toLocaleString()}</td>
                      <td className="px-4 py-4">${investment.totalProfit.toLocaleString()}</td>
                      <td className="px-4 py-4 capitalize">{investment.interval}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-200">
                          {investment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminInvestmentsPage;
