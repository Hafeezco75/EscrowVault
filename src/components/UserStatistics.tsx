'use client';

import { useVault } from '../hooks/useVault';
import { useCurrentAccount } from '@mysten/dapp-kit';

export default function UserStatistics() {
  const { vaults } = useVault();
  const account = useCurrentAccount();

  // Calculate statistics
  const totalVaults = vaults.length;
  const lockedVaults = vaults.filter(v => v.locked).length;
  const unlockedVaults = vaults.filter(v => !v.locked).length;
  const totalAssets = vaults.reduce((sum, vault) => sum + vault.assets.length, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4">Your Statistics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Vaults</p>
          <p className="text-2xl font-bold">{totalVaults}</p>
        </div>
        
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Unlocked Vaults</p>
          <p className="text-2xl font-bold">{unlockedVaults}</p>
        </div>
        
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Locked Vaults</p>
          <p className="text-2xl font-bold">{lockedVaults}</p>
        </div>
        
        <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Assets</p>
          <p className="text-2xl font-bold">{totalAssets}</p>
        </div>
      </div>
      
      {account && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Wallet Information</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            <span className="font-medium">Address:</span> {account.address.substring(0, 10)}...{account.address.substring(account.address.length - 10)}
          </p>
        </div>
      )}
    </div>
  );
}