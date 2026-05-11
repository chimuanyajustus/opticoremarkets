const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
  sparkline_in_7d: {
    price: number[];
  };
}

export interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

export interface SearchResult {
  coins: Array<{
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    market_cap_rank: number | null;
  }>;
  exchanges: unknown[];
  icos: unknown[];
  categories: unknown[];
  nfts: unknown[];
}

class CryptoApiService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  private async fetchWithCache<T>(url: string): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(url);

    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data as T;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.cache.set(url, { data, timestamp: now });
      return data;
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }

  async getTopCryptos(limit: number = 100): Promise<CryptoData[]> {
    const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`;
    return this.fetchWithCache(url);
  }

  async getCryptoById(id: string): Promise<CryptoData> {
    const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${id}&order=market_cap_desc&per_page=1&page=1&sparkline=true&price_change_percentage=24h`;
    const data = await this.fetchWithCache<CryptoData[]>(url);
    return data[0];
  }

  async getTrendingCoins(): Promise<TrendingCoin[]> {
    const url = `${COINGECKO_API_BASE}/search/trending`;
    const data = await this.fetchWithCache<{ coins: TrendingCoin[] }>(url);
    return data.coins;
  }

  async getCryptoPrices(ids: string[]): Promise<Record<string, { usd: number; usd_24h_change: number }>> {
    const idsString = ids.join(',');
    const url = `${COINGECKO_API_BASE}/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true`;
    return this.fetchWithCache(url);
  }

  async searchCryptos(query: string): Promise<SearchResult> {
    const url = `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(query)}`;
    return this.fetchWithCache(url);
  }
}

export const cryptoApi = new CryptoApiService();