// Mock data for the fintech platform

export const mockStats = [
  { label: 'Total Users', value: 125000, change: '+12%' },
  { label: 'Active Traders', value: 45000, change: '+8%' },
  { label: 'Total Volume', value: 2500000000, change: '+15%', prefix: '$' },
  { label: 'Success Rate', value: 98.5, change: '+0.5%', suffix: '%' },
];

export const mockFeatures = [
  {
    title: 'Advanced Trading',
    description: 'Access to multiple markets with real-time data and advanced charting tools.',
    icon: 'TrendingUp',
  },
  {
    title: 'Secure Platform',
    description: 'Bank-level security with encryption and multi-factor authentication.',
    icon: 'Shield',
  },
  {
    title: 'Fast Transactions',
    description: 'Lightning-fast deposits and withdrawals with minimal fees.',
    icon: 'Zap',
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock customer support from our expert team.',
    icon: 'Headphones',
  },
];

export const mockPricingPlans = [
  {
    name: 'Starter',
    price: 0,
    features: ['Basic trading', 'Limited charts', 'Email support'],
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    features: ['Advanced trading', 'Full charts', 'Priority support', 'API access'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    features: ['All Pro features', 'Custom integrations', 'Dedicated manager', 'White-label'],
    popular: false,
  },
];

export const mockTestimonials = [
  {
    name: 'John Doe',
    role: 'Professional Trader',
    content: 'This platform has revolutionized my trading experience. The interface is intuitive and the tools are powerful.',
    avatar: '/avatars/john.jpg',
  },
  {
    name: 'Jane Smith',
    role: 'Crypto Investor',
    content: 'I love the dark theme and smooth animations. It makes trading feel premium and professional.',
    avatar: '/avatars/jane.jpg',
  },
  {
    name: 'Mike Johnson',
    role: 'Day Trader',
    content: 'The charts are amazing and the performance is top-notch. Highly recommend!',
    avatar: '/avatars/mike.jpg',
  },
];

export const mockFAQ = [
  {
    question: 'How do I get started?',
    answer: 'Simply create an account, verify your identity, and start trading. Our onboarding process is quick and easy.',
  },
  {
    question: 'Is my money safe?',
    answer: 'Yes, we use bank-level security measures including encryption, cold storage, and regular security audits.',
  },
  {
    question: 'What markets can I trade?',
    answer: 'We offer trading in cryptocurrencies, forex, commodities, and indices with competitive spreads.',
  },
  {
    question: 'How do I withdraw funds?',
    answer: 'Withdrawals can be made instantly to your linked bank account or crypto wallet with no hidden fees.',
  },
];

export const mockPortfolio = {
  balance: 15420.50,
  change: 2.5,
  changeAmount: 378.50,
};

export const mockProfitLoss = [
  { label: 'Today', value: 1250.75, change: 5.2 },
  { label: 'This Week', value: 8750.00, change: 12.8 },
  { label: 'This Month', value: 24500.50, change: 18.3 },
];

export const mockChartData = [
  { time: '00:00', price: 45000 },
  { time: '04:00', price: 45200 },
  { time: '08:00', price: 44800 },
  { time: '12:00', price: 45500 },
  { time: '16:00', price: 45300 },
  { time: '20:00', price: 45800 },
  { time: '24:00', price: 46200 },
];

export const mockWatchlist = [
  { symbol: 'BTC/USD', price: 45123.45, change: 2.5 },
  { symbol: 'ETH/USD', price: 2456.78, change: -1.2 },
  { symbol: 'ADA/USD', price: 0.45, change: 8.7 },
  { symbol: 'DOT/USD', price: 12.34, change: -3.1 },
  { symbol: 'LINK/USD', price: 15.67, change: 4.2 },
];

export const mockRecentTrades = [
  { id: 1, symbol: 'BTC/USD', type: 'Buy', amount: 0.5, price: 45000, time: '10:30 AM' },
  { id: 2, symbol: 'ETH/USD', type: 'Sell', amount: 2.0, price: 2450, time: '09:45 AM' },
  { id: 3, symbol: 'ADA/USD', type: 'Buy', amount: 1000, price: 0.44, time: '08:20 AM' },
  { id: 4, symbol: 'DOT/USD', type: 'Sell', amount: 50, price: 12.50, time: '07:15 AM' },
];

export const mockWallet = {
  total: 15420.50,
  available: 12000.00,
  inOrders: 3420.50,
};

export const mockActivityData = [
  { date: '2024-01-01', profit: 500 },
  { date: '2024-01-02', profit: 750 },
  { date: '2024-01-03', profit: 300 },
  { date: '2024-01-04', profit: 1200 },
  { date: '2024-01-05', profit: 900 },
  { date: '2024-01-06', profit: 600 },
  { date: '2024-01-07', profit: 1100 },
];