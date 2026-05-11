import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Headphones, TrendingUp, Star, ChevronDown } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import PricingCard from '../components/PricingCard';
import { useAuth } from '../hooks/useAuth';
import { defaultInvestmentPlans } from '../types/investment';

type PlatformStat = {
  label: string;
  value: string | number;
  change: string;
  prefix?: string;
  suffix?: string;
};

const platformStats: PlatformStat[] = [
  { label: 'Trusted users', value: '58K', change: '+24%' },
  { label: 'Fiat on/off ramps', value: '32', change: '+12%' },
  { label: 'Daily volume', value: '$184M', change: '+9%' },
  { label: 'Secure accounts', value: '100%', change: '+0.0%' },
];

const pricingPlans = defaultInvestmentPlans.map((plan) => ({
  name: plan.name,
  price: plan.maxAmount === Number.POSITIVE_INFINITY ? 'Custom' : `$${plan.minAmount.toLocaleString()}`,
  description: plan.description,
  features: [
    `${plan.percentage}% profit ${plan.interval}`,
    `Minimum $${plan.minAmount.toLocaleString()}`,
    plan.maxAmount === Number.POSITIVE_INFINITY ? 'Unlimited maximum amount' : `Maximum $${plan.maxAmount.toLocaleString()}`,
  ],
}));

const testimonials = [
  {
    name: 'Jordan M.',
    role: 'Quantitative trader',
    content: 'The platform combines speed, security, and market intelligence in one polished experience.',
  },
  {
    name: 'Amina K.',
    role: 'Crypto portfolio manager',
    content: 'I trust the compliant wallet controls and real-time insights for every trade.',
  },
  {
    name: 'Liam T.',
    role: 'Growth investor',
    content: 'The onboarding and funding flows are seamless, even with strict verification.',
  },
];

const faq = [
  {
    question: 'How do I fund my account?',
    answer: 'Deposit directly via bank transfer or supported crypto wallets and submit a funding request for approval.',
  },
  {
    question: 'How long does verification take?',
    answer: 'Most accounts are verified within 24 hours after document submission and email confirmation.',
  },
  {
    question: 'Can I upgrade my plan later?',
    answer: 'Yes. You can switch plans or request enterprise access through the support team at any time.',
  },
];

const features = [
  {
    title: 'Advanced analytics',
    description: 'Intelligent market signals, fast execution, and actionable insights for every trade.',
    icon: <TrendingUp className="h-6 w-6 text-white" />, 
    accent: 'from-blue-500 to-purple-500',
  },
  {
    title: 'Secure architecture',
    description: 'Bank-grade security, cold storage, and multi-layer encryption for all assets.',
    icon: <Shield className="h-6 w-6 text-white" />,
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Instant liquidity',
    description: 'Fast deposits and withdrawals with low fees, optimized for global markets.',
    icon: <Zap className="h-6 w-6 text-white" />,
    accent: 'from-fuchsia-500 to-pink-500',
  },
  {
    title: '24/7 support',
    description: 'Dedicated trading support and education for every level of investor.',
    icon: <Headphones className="h-6 w-6 text-white" />,
    accent: 'from-violet-500 to-indigo-500',
  },
];

const LandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);
  const [animatedPlatformStats, setAnimatedPlatformStats] = React.useState(platformStats);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPlatformStats((current) =>
        current.map((item) => {
          const rawValue = String(item.value).replace(/[^0-9]/g, '');
          const numeric = Number(rawValue);

          if (item.label === 'Trusted users') {
            const next = numeric >= 70 ? 58 : numeric + 1;
            return { ...item, value: `${next}K` };
          }

          if (item.label === 'Fiat on/off ramps') {
            const next = numeric >= 40 ? 32 : numeric + 1;
            return { ...item, value: `${next}` };
          }

          if (item.label === 'Daily volume') {
            const next = numeric >= 210 ? 184 : numeric + 2;
            return { ...item, value: `$${next}M` };
          }

          if (item.label === 'Secure accounts') {
            const next = numeric >= 103 ? 100 : numeric + 1;
            return { ...item, value: `${next}%` };
          }

          return item;
        })
      );
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleStartTrading = () => {
    if (isAdmin) {
      navigate('/admin');
      return;
    }

    if (user && user.emailVerified === false) {
      navigate('/verify-email');
      return;
    }

    if (user) {
      navigate('/dashboard');
      return;
    }

    navigate('/register');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <MainLayout>
      <section className="relative overflow-hidden bg-[#050610]">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_26%),radial-gradient(circle_at_20%_20%,_rgba(168,85,247,0.14),_transparent_22%),linear-gradient(180deg,_rgba(5,7,16,0.96),_rgba(7,9,22,0.98)_80%)]" />
          
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full filter blur-3xl"
            animate={{
              y: [0, 50, 0],
              x: [-20, 20, -20],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full filter blur-3xl"
            animate={{
              y: [0, -40, 0],
              x: [20, -20, 20],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full filter blur-3xl"
            animate={{
              y: [0, 40, 0],
              x: [-30, 30, -30],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200 backdrop-blur-sm shadow-lg shadow-blue-500/10">
                <span className="inline-flex h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 mr-2" />
                Premium trading tools for modern investors
              </div>

              <div className="max-w-2xl">
                <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-white">
                  Trade with confidence on a premium crypto and options platform.
                </h1>
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  Advanced charts, real-time signals, and secure accounts built for high-performance traders.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Button size="lg" className="shadow-glow" onClick={handleStartTrading}>
                  Start trading
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {animatedPlatformStats.slice(0, 4).map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                  >
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm shadow-lg shadow-slate-900/20 hover:border-blue-400/50 transition-all duration-300 relative group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
                      <div className="relative z-10">
                        <div className="text-sm uppercase tracking-[0.24em] text-slate-400">{item.label}</div>
                        <div className="mt-3 text-2xl font-semibold text-white">
                          {item.prefix || ''}{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}{item.suffix || ''}
                        </div>
                        <div className="mt-1 text-sm text-green-400 font-medium">{item.change}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-950/50 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.32em] text-blue-300">Platform overview</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Built for traders who demand speed and clarity.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-400">
              Powerful analytics, secure accounts, and simplified trading workflows designed for crypto and options markets.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="space-y-4 p-6 bg-slate-950/80 border-white/10 h-full hover:border-blue-400/50 transition-all duration-300 relative overflow-hidden group">
                  {/* Animated background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                  
                  <div className="relative z-10">
                    <motion.div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.accent}`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-950/70 border-t border-slate-800 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full filter blur-3xl"
          animate={{
            y: [0, 40, 0],
            x: [20, -20, 20],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm uppercase tracking-[0.32em] text-blue-300"
            >
              Pricing plans
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-semibold text-white"
            >
              Choose the plan that fits your trading style.
            </motion.h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -12, scale: 1.02 }}
              >
                <PricingCard {...plan} onSelect={handleGetStarted} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.32em] text-blue-300">Client success</p>
            <h2 className="mt-4 text-4xl font-semibold text-white">Trusted by traders around the world.</h2>
          </div>

          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <Card className="p-10 bg-slate-950/80 border-white/10">
              <div className="flex items-center justify-center gap-2 mb-6 text-amber-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5" />
                ))}
              </div>
              <blockquote className="text-xl leading-9 text-slate-200 italic">
                “{testimonials[currentTestimonial].content}”
              </blockquote>
              <div className="mt-8 text-center">
                <div className="text-lg font-semibold text-white">{testimonials[currentTestimonial].name}</div>
                <div className="text-sm text-slate-400">{testimonials[currentTestimonial].role}</div>
              </div>
            </Card>
          </motion.div>

          <div className="mt-8 flex justify-center gap-3">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                type="button"
                onClick={() => setCurrentTestimonial(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`h-3 w-3 rounded-full transition ${index === currentTestimonial ? 'bg-blue-400' : 'bg-slate-700'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-950/70 border-t border-slate-800 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-blue-500/20 to-cyan-500/20 rounded-full filter blur-3xl"
          animate={{
            y: [0, -40, 0],
            x: [20, -20, 20],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm uppercase tracking-[0.32em] text-blue-300"
            >
              Frequently asked questions
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-4xl font-semibold text-white"
            >
              Everything you need to know before you trade.
            </motion.h2>
          </div>
          <div className="space-y-4">
            {faq.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="p-6 bg-slate-950/80 border-white/10 hover:border-blue-400/50 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                  <div className="relative z-10">
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-white">
                        {item.question}
                        <motion.div
                          animate={{ rotate: 0 }}
                          className="group-open:rotate-180"
                        >
                          <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-200" />
                        </motion.div>
                      </summary>
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 text-slate-400 leading-7"
                      >
                        {item.answer}
                      </motion.p>
                    </details>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;