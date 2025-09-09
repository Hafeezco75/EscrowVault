'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
interface Transaction {
  id: string;
  type: string;
  timestamp: number;
  status: 'success' | 'failed';
  details: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const account = useCurrentAccount();
  const client = useSuiClient();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!account?.address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // In a real app, you would fetch actual transaction history from the blockchain
        // This is a placeholder implementation
        const response = await client.queryTransactionBlocks({
          filter: {
            FromAddress: account.address
          },
          options: {
            showEffects: true,
            showInput: true
          },
          limit: 10
        });

        // Transform the response into our Transaction interface
        const formattedTransactions: Transaction[] = response.data.map((tx, index) => {
          // This is simplified - in a real app you would parse the actual transaction data
          return {
            id: tx.digest,
            type: 'Vault Operation',
            timestamp: Date.now() - index * 3600000, // Mock timestamps
            status: 'success',
            details: `Transaction ${index + 1}`
          };
        });

        setTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [account?.address, client]);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">Loading transaction history...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Transaction ID</th>
            <th scope="col" className="px-6 py-3">Type</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white truncate max-w-xs">
                {tx.id.substring(0, 8)}...{tx.id.substring(tx.id.length - 8)}
              </td>
              <td className="px-6 py-4">{tx.type}</td>
              <td className="px-6 py-4">{new Date(tx.timestamp).toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${tx.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {tx.status}
                </span>
              </td>
              <td className="px-6 py-4">{tx.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}