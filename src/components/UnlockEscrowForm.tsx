'use client';

import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function UnlockEscrowForm() {
  const account = useCurrentAccount();
  const { 
    unlockEscrow, 
    isUnlockingEscrow
  } = useVault();

  // Unlock Escrow States
  const [tableId, setTableId] = useState('');
  const [objectId, setObjectId] = useState('');

  const handleUnlockEscrow = async () => {
    if (!account) return;
    try {
      await unlockEscrow({ tableId, objectId });
      // Reset form
      setTableId('');
      setObjectId('');
    } catch (error) {
      console.error('Error unlocking escrow:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-6">Unlock Escrow Vault</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Table ID</label>
          <input 
            type="text" 
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter table ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Object ID</label>
          <input 
            type="text" 
            value={objectId}
            onChange={(e) => setObjectId(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter object ID"
          />
        </div>
        
        <button 
          onClick={handleUnlockEscrow}
          disabled={isUnlockingEscrow || !tableId || !objectId}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isUnlockingEscrow ? 'Unlocking...' : 'Unlock Escrow'}
        </button>
      </div>
    </div>
  );
}