'use client';

import { useVault } from "../../hooks/useVault";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";
import Link from "next/link";
import UserStatistics from "../../components/UserStatistics";
import TransactionHistory from "../../components/TransactionHistory";
import EscrowForm from "../../components/EscrowForm";
import UnlockEscrowForm from "../../components/UnlockEscrowForm";
import SwapEscrowForm from "../../components/SwapEscrowForm";
import ReturnToSenderForm from "../../components/ReturnToSenderForm";

export default function Dashboard() {
  const { vaults, lockVault, unlockVault, swapAssets, isConnected, refetchVaults } = useVault();
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState('vaults'); // 'vaults', 'escrow', or 'history'
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [assetId, setAssetId] = useState('');
  const [targetAssetType, setTargetAssetType] = useState('');

  const handleLockVault = async (vaultId: string) => {
    try {
      await lockVault(vaultId);
      await refetchVaults();
    } catch (error) {
      console.error('Error locking vault:', error);
    }
  };

  const handleUnlockVault = async (vaultId: string) => {
    try {
      await unlockVault(vaultId);
      await refetchVaults();
    } catch (error) {
      console.error('Error unlocking vault:', error);
    }
  };

  const handleSwapAssets = async () => {
    if (!selectedVault || !assetId || !targetAssetType) return;
    
    try {
      await swapAssets({ vaultId: selectedVault, assetId, targetAssetType });
      setIsSwapping(false);
      setAssetId('');
      setTargetAssetType('');
      await refetchVaults();
    } catch (error) {
      console.error('Error swapping assets:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen p-8 pb-20 sm:p-20">
        <div className="max-w-6xl mx-auto mt-10 text-center">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
            <p>Please connect your wallet to view your vaults.</p>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-6xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* User Statistics */}
        <UserStatistics />
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button 
                onClick={() => setActiveTab('vaults')} 
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'vaults' ? 'text-pink-500 border-pink-500' : 'border-transparent hover:text-gray-300 hover:border-gray-600 text-white'}`}
              >
                Vaults
              </button>
            </li>
            <li className="mr-2">
              <button 
                onClick={() => setActiveTab('escrow')} 
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'escrow' ? 'text-pink-500 border-pink-500' : 'border-transparent hover:text-gray-300 hover:border-gray-600 text-white'}`}
              >
                Escrow
              </button>
            </li>
            <li className="mr-2">
              <button 
                onClick={() => setActiveTab('history')} 
                className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'history' ? 'text-pink-500 border-pink-500' : 'border-transparent hover:text-gray-300 hover:border-gray-600 text-white'}`}
              >
                History
              </button>
            </li>
          </ul>
        </div>
        
        {/* Vaults Tab */}
        {activeTab === 'vaults' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaults.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any vaults yet.</p>
                  <Link 
                    href="/" 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Create Your First Vault
                  </Link>
                </div>
              ) : (
                vaults.map((vault) => (
                  <div key={vault.id} className="bg-gray-900 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-2 truncate" title={vault.id}>Vault ID: {vault.id.substring(0, 8)}...</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Status: <span className={`font-semibold ${vault.locked ? 'text-red-500' : 'text-green-500'}`}>
                        {vault.locked ? 'Locked' : 'Unlocked'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Assets: {vault.assets.length}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {vault.locked ? (
                        <button 
                          onClick={() => handleUnlockVault(vault.id)}
                          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
                        >
                          Unlock
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleLockVault(vault.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Lock
                        </button>
                      )}
                      
                      <button 
                        onClick={() => {
                          setSelectedVault(vault.id);
                          setIsSwapping(true);
                        }}
                        disabled={vault.locked}
                        className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Swap
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
            <TransactionHistory />
          </div>
        )}
        
        {/* Swap Modal */}
        {isSwapping && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Swap Assets</h2>
              
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Asset ID</label>
                <input 
                  type="text" 
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded"
                  placeholder="Enter asset ID"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Target Asset Type</label>
                <input 
                  type="text" 
                  value={targetAssetType}
                  onChange={(e) => setTargetAssetType(e.target.value)}
                  className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded"
                  placeholder="Enter target asset type"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => {
                    setIsSwapping(false);
                    setAssetId('');
                    setTargetAssetType('');
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSwapAssets}
                  disabled={!assetId || !targetAssetType}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Swap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}