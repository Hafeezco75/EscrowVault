'use client';

import { useVault } from '../hooks/useVault';
import { useEscrowVault } from '../hooks/useEscrowVault';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Vault } from '../services/VaultService';

export default function UserStatistics() {
  const { vaults } = useVault();
  const { escrowVaults } = useEscrowVault();
  const account = useCurrentAccount();

  // Debug logging
  console.log('UserStatistics Debug:', {
    account: account?.address,
    vaults,
    escrowVaults,
    vaultsLength: Array.isArray(vaults) ? vaults.length : 'not array',
    escrowVaultsLength: Array.isArray(escrowVaults) ? escrowVaults.length : 'not array'
  });

  // Safely calculate statistics with fallbacks
  const totalVaults = Array.isArray(vaults) ? vaults.length : 0;
  const totalEscrows = Array.isArray(escrowVaults) ? escrowVaults.length : 0;
  const lockedVaults = Array.isArray(vaults) ? vaults.filter((v: Vault) => v && v.locked === true).length : 0;
  const unlockedVaults = Array.isArray(vaults) ? vaults.filter((v: Vault) => v && v.locked === false).length : 0;
  const totalAssets = Array.isArray(vaults) ? vaults.reduce((sum: number, vault: Vault) => {
    if (vault && vault.assets && Array.isArray(vault.assets)) {
      return sum + vault.assets.length;
    }
    return sum;
  }, 0) : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm">📊 Your Statistics</h2>
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Real-time from blockchain
        </div>
      </div>
      
      {!account ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <span className="text-6xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Connected</h3>
          <p className="text-sm text-gray-600">Connect your wallet to view your statistics.</p>
        </div>
      ) : totalVaults === 0 && totalEscrows === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <span className="text-8xl drop-shadow-lg">🏦</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 drop-shadow-sm">Ready to Create Vault?</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Start your secure blockchain journey by creating your vault. Your statistics will appear here once you begin.
          </p>
          <a 
            href="/create" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition-all duration-300"
          >
            🔒 Create Vault
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl drop-shadow-lg">🏦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700 drop-shadow-sm">Total Vaults</p>
                  <p className="text-3xl font-bold text-blue-900 drop-shadow-sm">{totalVaults}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl drop-shadow-lg">🔓</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700 drop-shadow-sm">Unlocked Vaults</p>
                  <p className="text-3xl font-bold text-green-900 drop-shadow-sm">{unlockedVaults}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl drop-shadow-lg">🔒</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-700 drop-shadow-sm">Locked Vaults</p>
                  <p className="text-3xl font-bold text-red-900 drop-shadow-sm">{lockedVaults}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl drop-shadow-lg">🤝</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700 drop-shadow-sm">Escrow Vaults</p>
                  <p className="text-3xl font-bold text-purple-900 drop-shadow-sm">{totalEscrows}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💎</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-600">Total Assets</p>
                  <p className="text-2xl font-bold text-yellow-900">{totalAssets}</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-indigo-600">Success Rate</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {totalVaults > 0 ? Math.round((unlockedVaults / totalVaults) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {account && (
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center drop-shadow-sm">
                <span className="mr-3 text-2xl">👤</span>
                Wallet Information
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Address:</span> 
                  <span className="font-mono bg-white px-3 py-2 rounded-lg text-xs ml-3 shadow-inner border border-gray-200">
                    {account.address.substring(0, 12)}...{account.address.substring(account.address.length - 12)}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Status:</span> 
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-3 shadow-lg border border-green-200">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    Connected
                  </span>
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}