'use client';

import { useState, useEffect } from 'react';
import { CoinPriceService, CoinPrice } from '../services/CoinPriceService';

export default function PriceTicker() {
  // Consolidated state using single useState with spread operator
  const [state, setState] = useState({
    prices: [
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
    ] as CoinPrice[],
    isLoading: false,
    error: 'API Key Missing' as string | null,
    useFallback: true
  });

  // Input change handlers
  const handleRefresh = () => {
    setState(prev => ({ ...prev, useFallback: false }));
    fetchPrices();
  };

  const fetchPrices = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      console.log('Fetching coin prices...');
      
      const coinPrices = await CoinPriceService.getCoinPrices(true, false);
      console.log('Received coin prices:', coinPrices);
      
      if (coinPrices && coinPrices.length > 0) {
        // Check if we received actual data or fallback data
        const isActualData = coinPrices.some(coin => 
          coin.price !== 4.25 && coin.price !== 0.089
        );
        
        if (isActualData) {
          setState(prev => ({
            ...prev,
            prices: coinPrices,
            error: null,
            useFallback: false
          }));
        } else {
          setState(prev => ({
            ...prev,
            prices: coinPrices,
            error: 'API Key Missing',
            useFallback: true
          }));
        }
      } else {
        throw new Error('No price data available');
      }
    } catch (error) {
      console.error('Error fetching prices in component:', error);
      setState(prev => ({
        ...prev,
        error: 'API Key Missing',
        useFallback: true
      }));
      
      // Keep the current fallback prices (already initialized)
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    // Only try to fetch if we detect an API key might be available
    const apiKey = process.env.NEXT_PUBLIC_BLOCKVISION_API_KEY;
    if (apiKey && apiKey.trim()) {
      fetchPrices();
      
      // Update prices every 60 seconds only if API key is available
      const interval = setInterval(fetchPrices, 60000);
      return () => clearInterval(interval);
    } else {
      // No API key, show fallback immediately
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'API Key Missing',
        useFallback: true
      }));
    }
  }, []);

  if (state.isLoading) {
    return (
      <div className="bg-blue-600 text-white py-2 overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="animate-pulse flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
            <span>Loading price data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden relative">
      {state.error && (
        <div className="absolute top-0 right-4 bg-yellow-500 text-black text-xs px-2 py-1 rounded-b z-10 flex items-center space-x-1">
          <span>{state.useFallback ? 'Demo Data - Add API Key' : state.error}</span>
          <button 
            onClick={handleRefresh}
            className="ml-1 hover:bg-yellow-600 px-1 rounded text-black"
            title="Try to refresh prices"
          >
            ↻
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-center">
        <div className="flex space-x-8 animate-slide-left">
          {state.prices.length > 0 ? (
            <>
              {state.prices.map((coin, index) => (
                <div key={`${coin.tokenId}-${index}`} className="flex items-center space-x-2 shrink-0">
                  <span className="font-semibold">
                    {coin.symbol || (coin.tokenId.includes('sui') ? 'SUI' : coin.tokenId.includes('deep') ? 'DEEP' : 'USDC')}
                  </span>
                  <span className="text-blue-100">
                    ${coin.price ? coin.price.toFixed(4) : '0.0000'}
                  </span>
                  {coin.change24h !== undefined && (
                    <span className={`text-xs ${
                      coin.change24h >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              ))}
              {/* Repeat for continuous scroll effect */}
              {state.prices.map((coin, index) => (
                <div key={`repeat-${coin.tokenId}-${index}`} className="flex items-center space-x-2 shrink-0 ml-8">
                  <span className="font-semibold">
                    {coin.symbol || (coin.tokenId.includes('sui') ? 'SUI' : coin.tokenId.includes('deep') ? 'DEEP' : 'USDC')}
                  </span>
                  <span className="text-blue-100">
                    ${coin.price ? coin.price.toFixed(4) : '0.0000'}
                  </span>
                  {coin.change24h !== undefined && (
                    <span className={`text-xs ${
                      coin.change24h >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="flex items-center justify-center w-full">
              <span className="text-blue-200">Price data temporarily unavailable</span>
              <button 
                onClick={handleRefresh}
                className="ml-2 hover:bg-blue-700 px-2 py-1 rounded text-white text-xs"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}