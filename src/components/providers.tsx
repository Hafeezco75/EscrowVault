'use client'; 

import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'; 
import { getFullnodeUrl } from '@mysten/sui/client'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 
import '@mysten/dapp-kit/dist/index.css'; 

// Package and Object IDs for the Escrow Vault smart contract
export const PACKAGE_ID = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; // Replace with actual package ID
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
        <WalletProvider> 
          {children} 
        </WalletProvider> 
      </SuiClientProvider> 
    </QueryClientProvider> 
  );
}