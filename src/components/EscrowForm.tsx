'use client';

import { useState } from 'react';
import { useVault } from '../hooks/useVault';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function EscrowForm() {
  const account = useCurrentAccount();
  const { 
    createEscrow, 
    isCreatingEscrow
  } = useVault();

  // Create Escrow States
  const [key, setKey] = useState('');
  const [recipientExchangeKey, setRecipientExchangeKey] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleCreateEscrow = async () => {
    if (!account) return;
    try {
      await createEscrow({ key, recipientExchangeKey, recipient });
      // Reset form
      setKey('');
      setRecipientExchangeKey('');
      setRecipient('');
    } catch (error) {
      console.error('Error creating escrow:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-6">Create Escrow Vault</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Key</label>
          <input 
            type="text" 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter key"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Recipient Exchange Key</label>
          <input 
            type="text" 
            value={recipientExchangeKey}
            onChange={(e) => setRecipientExchangeKey(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter recipient exchange key"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Recipient Address</label>
          <input 
            type="text" 
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter recipient address"
          />
        </div>
        
        <button 
          onClick={handleCreateEscrow}
          disabled={isCreatingEscrow || !key || !recipientExchangeKey || !recipient}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isCreatingEscrow ? 'Creating...' : 'Create Escrow'}
        </button>
      </div>
    </div>
  );
}