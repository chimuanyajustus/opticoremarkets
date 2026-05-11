import { Timestamp } from 'firebase/firestore';

export type InvestmentInterval = 'hourly' | 'daily';
export type InvestmentStatus = 'active' | 'completed';
export type InvestmentPlanName = 'Basic' | 'Standard' | 'Premium' | 'Platinum';

export interface InvestmentPlanConfig {
  id: string;
  name: InvestmentPlanName;
  percentage: number;
  interval: InvestmentInterval;
  minAmount: number;
  maxAmount: number;
  active: boolean;
  description: string;
}

export interface UserInvestment {
  id: string;
  userId: string;
  planId: string;
  planName: InvestmentPlanName;
  amount: number;
  percentage: number;
  interval: InvestmentInterval;
  startedAt: Timestamp;
  lastProfitAt: Timestamp;
  totalProfit: number;
  status: InvestmentStatus;
}

export const defaultInvestmentPlans: InvestmentPlanConfig[] = [
  {
    id: 'basic',
    name: 'Basic',
    percentage: 1.4,
    interval: 'daily',
    minAmount: 500,
    maxAmount: 9999,
    active: true,
    description: '1.4% profit every day',
  },
  {
    id: 'standard',
    name: 'Standard',
    percentage: 15,
    interval: 'hourly',
    minAmount: 10000,
    maxAmount: 19999,
    active: true,
    description: '15% profit every hour',
  },
  {
    id: 'premium',
    name: 'Premium',
    percentage: 20,
    interval: 'daily',
    minAmount: 20000,
    maxAmount: 49999,
    active: true,
    description: '20% profit every day',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    percentage: 25,
    interval: 'daily',
    minAmount: 50000,
    maxAmount: Number.POSITIVE_INFINITY,
    active: true,
    description: '25% profit every day',
  },
];
