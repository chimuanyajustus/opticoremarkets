import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Button from './Button';

interface PricingCardProps {
  name: string;
  price: string | number;
  features: string[];
  popular?: boolean;
  onSelect?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ name, price, features, popular = false, onSelect }) => {
  return (
    <motion.div
      className={`relative bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 ${
        popular ? 'border-blue-500/50 shadow-lg shadow-blue-500/20' : 'border-gray-700/50'
      }`}
      whileHover={{ y: -5 }}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
        <div className="text-3xl font-bold text-white">
          ${price}
          <span className="text-lg text-gray-400">/month</span>
        </div>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-300">
            <Check size={16} className="text-green-400 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        variant={popular ? 'primary' : 'outline'}
        className="w-full"
        onClick={onSelect}
      >
        Get Started
      </Button>
    </motion.div>
  );
};

export default PricingCard;