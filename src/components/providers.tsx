'use client'; 

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'; 
import { getFullnodeUrl } from '@mysten/sui/client'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import { ThemeProvider } from '../context/ThemeContext';
import '@mysten/dapp-kit/dist/index.css'; 

// Package and Object IDs for the Escrow Vault smart contract
export const PACKAGE_ID = '0x491e3252f4524253a7c0d06d326b1ce51e7a8b4136b03211988ad631e11d8d6b';
export const OBJECT_ID = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'; // Replace with actual object ID
export const CLOCK_ID = '0x6'; // Standard clock object ID

const { networkConfig } = createNetworkConfig({ 
  testnet: { url: getFullnodeUrl('testnet') }, 
  mainnet: { url: getFullnodeUrl('mainnet') }, 
  localnet: { url: getFullnodeUrl('localnet') }, 
}); 

const queryClient = new QueryClient({ 
  defaultOptions: { 
    queries: { 
      staleTime: 1000 * 60 * 5, // 5 minutes 
      refetchOnWindowFocus: false, 
    }, 
  }, 
});


export function SuiProviders({ children }: { children: React.ReactNode }) { 
  return ( 
    <QueryClientProvider client={queryClient}> 
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet"> 
        <WalletProvider autoConnect={true} enableUnsafeBurner={false}> 
          <ThemeProvider>
            {children}
          </ThemeProvider> 
        </WalletProvider> 
      </SuiClientProvider> 
    </QueryClientProvider> 
  );
}