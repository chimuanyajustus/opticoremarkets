import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { CryptoData } from '../services/cryptoApi';

interface CryptoCardProps {
  crypto: CryptoData;
  onClick?: () => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ crypto, onClick }) => {
  const priceChange = crypto.price_change_percentage_24h;
  const isPositive = priceChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={crypto.image}
            alt={crypto.name}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <h3 className="text-white font-semibold text-lg">{crypto.name}</h3>
            <p className="text-gray-400 text-sm uppercase">{crypto.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-xl">${crypto.current_price.toLocaleString()}</p>
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Market Cap</p>
          <p className="text-white font-medium">${crypto.market_cap.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Volume (24h)</p>
          <p className="text-white font-medium">${crypto.total_volume.toLocaleString()}</p>
        </div>
      </div>

      {/* Simple sparkline visualization */}
      <div className="mt-4">
        <div className="flex items-end space-x-1 h-8">
          {crypto.sparkline_in_7d?.price?.slice(-20).map((price, index) => {
            const minPrice = Math.min(...crypto.sparkline_in_7d.price.slice(-20));
            const maxPrice = Math.max(...crypto.sparkline_in_7d.price.slice(-20));
            const height = ((price - minPrice) / (maxPrice - minPrice)) * 100;
            return (
              <div
                key={index}
                className={`w-1 rounded-sm ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default CryptoCard;