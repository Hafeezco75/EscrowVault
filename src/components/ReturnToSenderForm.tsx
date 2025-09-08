'use client';

import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function ReturnToSenderForm() {
  const account = useCurrentAccount();
  const { 
    returnToSender, 
    isReturningToSender
  } = useVault();

  // Return to Sender States
  const [escrowId, setEscrowId] = useState('');
  const [tableId, setTableId] = useState('');
  const [lockedKey, setLockedKey] = useState('');

  const handleReturnToSender = async () => {
    if (!account) return;
    try {
      await returnToSender({ escrowId, tableId, lockedKey });
      // Reset form
      setEscrowId('');
      setTableId('');
      setLockedKey('');
    } catch (error) {
      console.error('Error returning escrow to sender:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-6">Return Escrow to Sender</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Escrow ID</label>
          <input 
            type="text" 
            value={escrowId}
            onChange={(e) => setEscrowId(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter escrow ID"
          />
        </div>
        
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
          <label className="block text-sm font-medium mb-1">Locked Key</label>
          <input 
            type="text" 
            value={lockedKey}
            onChange={(e) => setLockedKey(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter locked key"
          />
        </div>
        
        <button 
          onClick={handleReturnToSender}
          disabled={isReturningToSender || !escrowId || !tableId || !lockedKey}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isReturningToSender ? 'Returning...' : 'Return to Sender'}
        </button>
      </div>
    </div>
  );
}