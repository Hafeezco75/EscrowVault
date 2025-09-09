'use client';

// Remove hardcoded API key for security
const API_KEY = process.env.NEXT_PUBLIC_BLOCKVISION_API_KEY || '';

export interface CoinPrice {
  tokenId: string;
  symbol: string;
  name: string;
  price: number;
  change24h?: number;
  liquidity?: number;
}

export interface CoinHolder {
  address: string;
  balance: string;
  percentage: number;
}

export interface AccountCoin {
  coinType: string;
  balance: string;
  symbol: string;
}

export interface AccountActivity {
  txHash: string;
  timestamp: number;
  type: string;
  status: string;
  gasUsed: string;
}

export class CoinPriceService {
  private static readonly BASE_URL = 'https://api.blockvision.org/v2/sui';
  private static readonly headers = {
    'accept': 'application/json',
    'x-api-key': API_KEY
  };
  
  // Fallback price data in case API fails
  private static readonly fallbackPrices: CoinPrice[] = [
    {
      tokenId: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      symbol: 'SUI',
      name: 'Sui',
      price: 4.32,
      change24h: 3.1
    },
    {
      tokenId: '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP',
      symbol: 'DEEP',
      name: 'DeepBook',
      price: 0.092,
      change24h: -0.8
    },
    {
      tokenId: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.00,
      change24h: 0.0
    }
  ];
  
  // Helper method to make API requests with retry logic
  private static async makeRequest(url: string, retries: number = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Attempting API call (attempt ${i + 1}/${retries}):`, url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: this.headers,
          // Add timeout
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        console.log(`Response status: ${response.status}`, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`HTTP error ${response.status}: ${errorText}`);
          
          // If it's a rate limit or server error, retry
          if (response.status === 429 || response.status >= 500) {
            if (i < retries - 1) {
              const delay = Math.pow(2, i) * 1000; // Exponential backoff
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        return data;
        
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        
        if (i === retries - 1) {
          throw error;
        }
        
        // Wait before retrying
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Retrieve SUI coin holders
  static async getSuiCoinHolders(limit: number = 20): Promise<CoinHolder[]> {
    try {
      const url = `${this.BASE_URL}/coin/holders/?coinType=0x0000000000000000000000000000000000000000000000000000000000000002%3A%3Asui%3A%3ASUI&limit=${limit}`;
      const data = await this.makeRequest(url);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching SUI coin holders:', error);
      return [];
    }
  }

  // Retrieve multiple coins prices
  static async getCoinPrices(show24hChange: boolean = true, showLiquidity: boolean = false): Promise<CoinPrice[]> {
    // Check if API key is available
    if (!API_KEY || API_KEY.trim() === '') {
      console.warn('BlockVision API key not found. Using fallback prices.');
      return this.fallbackPrices;
    }
    
    try {
      const tokenIds = '0x0000000000000000000000000000000000000000000000000000000000000002%3A%3Asui%3A%3ASUI%2C0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270%3A%3Adeep%3A%3ADEEP';
      const url = `${this.BASE_URL}/coin/price/list?tokenIds=${tokenIds}&show24hChange=${show24hChange}&showLiquidity=${showLiquidity}`;
      
      const data = await this.makeRequest(url);
      
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      } else {
        console.warn('No price data returned, using fallback prices');
        return this.fallbackPrices;
      }
    } catch (error) {
      console.error('Error fetching coin prices, using fallback:', error);
      return this.fallbackPrices;
    }
  }

  // Retrieve account coins owned by a given address
  static async getAccountCoins(address: string): Promise<AccountCoin[]> {
    try {
      const url = `${this.BASE_URL}/account/coins?account=${address}`;
      const data = await this.makeRequest(url);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching account coins:', error);
      return [];
    }
  }

  // Retrieve account activity logs
  static async getAccountActivities(address: string, limit: number = 20): Promise<AccountActivity[]> {
    try {
      const url = `${this.BASE_URL}/account/activities?address=${address}&limit=${limit}`;
      const data = await this.makeRequest(url);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching account activities:', error);
      return [];
    }
  }

  // Get SUI price specifically
  static async getSuiPrice(): Promise<number> {
    try {
      const prices = await this.getCoinPrices();
      const suiPrice = prices.find(price => 
        price.tokenId.includes('sui') || price.symbol === 'SUI'
      );
      return suiPrice?.price || 4.32; // fallback price
    } catch (error) {
      console.error('Error fetching SUI price:', error);
      return 4.32; // fallback price
    }
  }
}