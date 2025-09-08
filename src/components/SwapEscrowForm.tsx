'use client';

import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function SwapEscrowForm() {
  const account = useCurrentAccount();
  const { 
    swapEscrow, 
    isSwappingEscrow
  } = useVault();

  // Swap Escrow States
  const [ownerEscrowId, setOwnerEscrowId] = useState('');
  const [recipientEscrowId, setRecipientEscrowId] = useState('');

  const handleSwapEscrow = async () => {
    if (!account) return;
    try {
      await swapEscrow({ ownerEscrowId, recipientEscrowId });
      // Reset form
      setOwnerEscrowId('');
      setRecipientEscrowId('');
    } catch (error) {
      console.error('Error swapping escrow:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-6">Swap Escrow Items</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Owner Escrow ID</label>
          <input 
            type="text" 
            value={ownerEscrowId}
            onChange={(e) => setOwnerEscrowId(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter owner escrow ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Recipient Escrow ID</label>
          <input 
            type="text" 
            value={recipientEscrowId}
            onChange={(e) => setRecipientEscrowId(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter recipient escrow ID"
          />
        </div>
        
        <button 
          onClick={handleSwapEscrow}
          disabled={isSwappingEscrow || !ownerEscrowId || !recipientEscrowId}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSwappingEscrow ? 'Swapping...' : 'Swap Escrow'}
        </button>
      </div>
    </div>
  );
}