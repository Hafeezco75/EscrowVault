'use client';

import { useVault } from "../../hooks/useVault";
import { useEscrowVault } from "../../hooks/useEscrowVault";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import Link from "next/link";
import UserStatistics from "../../components/UserStatistics";
import TransactionHistory from "../../components/TransactionHistory";
import CreateEscrowForm from "../../components/escrow/CreateEscrowForm";
import SellerEscrowForm from "../../components/escrow/SellerEscrowForm";
import UnlockEscrowVaultForm from "../../components/escrow/UnlockEscrowVaultForm";
import SwapEscrowVaultForm from "../../components/escrow/SwapEscrowVaultForm";
import ReturnToSenderForm from "../../components/escrow/ReturnToSenderForm";
import DashboardSidebar from "../../components/DashboardSidebar";
import PriceTicker from "../../components/PriceTicker";
import Button from "../../components/common/Button";

export default function Dashboard() {
  const { vaults, lockVault, unlockVault, swapAssets, isConnected, refetchVaults } = useVault();
  const { escrowVaults, refreshEscrowVaults, isConnected: isEscrowConnected } = useEscrowVault();
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState('vaults');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize loading state and handle page focus for data refresh
  useEffect(() => {
    if (account?.address) {
      // Simulate loading time for data fetching
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [account?.address]);

  // Refresh data when page becomes visible (e.g., returning from vault creation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && account?.address) {
        refetchVaults();
        refreshEscrowVaults();
      }
    };

    const handleFocus = () => {
      if (account?.address) {
        refetchVaults();
        refreshEscrowVaults();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [account?.address, refetchVaults, refreshEscrowVaults]);

  // Periodic refresh every 30 seconds to keep data up to date
  useEffect(() => {
    if (!account?.address) return;

    const interval = setInterval(() => {
      refetchVaults();
      refreshEscrowVaults();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [account?.address, refetchVaults, refreshEscrowVaults]);

  const getActiveTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
      'vaults': 'My Vaults',
      'escrow': 'My Escrows', 
      'create-escrow': 'Create Escrow',
      'unlock-escrow': 'Unlock Vault',
      'swap-escrow': 'Swap Vault',
      'create-seller-escrow': 'Seller Escrow',
      'return-escrow': 'Return Escrow',
      'history': 'Transaction History'
    };
    return labels[tab] || 'Dashboard';
  };

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
      await unlockVault({ lockedId: vaultId, keyId: vaultId });
      await refetchVaults();
    } catch (error) {
      console.error('Error unlocking vault:', error);
    }
  };

  const handleEscrowSuccess = () => {
    setSuccessMessage('Escrow vault operation completed successfully!');
    setShowSuccessMessage(true);
    refreshEscrowVaults();
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // Navigation handlers
  const handleUnlockVaultClick = (vaultId: string) => () => handleUnlockVault(vaultId);
  const handleLockVaultClick = (vaultId: string) => () => handleLockVault(vaultId);
  const handleNavigateToSwapEscrow = () => setActiveTab('swap-escrow');
  const handleNavigateToCreateEscrow = () => setActiveTab('create-escrow');
  const handleNavigateToUnlockEscrow = () => setActiveTab('unlock-escrow');
  const handleNavigateToReturnEscrow = () => setActiveTab('return-escrow');

  if (!isConnected || !account) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8 pb-20 sm:p-20">
          <div className="max-w-6xl mx-auto mt-10 text-center">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded" role="alert">
              <p className="font-medium">Please connect your wallet to view your vaults.</p>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 underline font-medium">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PriceTicker />
        <div className="p-8 pb-20 sm:p-20">
          <div className="max-w-6xl mx-auto mt-10 text-center">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-lg">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="font-medium">Loading your vaults...</p>
              <p className="text-sm text-blue-600 mt-2">Please wait while we fetch your data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="max-w-7xl mx-auto">
          <PriceTicker />
          <div className="flex gap-8">
            <DashboardSidebar 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              vaultCount={Array.isArray(vaults) ? vaults.length : 0}
              escrowVaultCount={Array.isArray(escrowVaults) ? escrowVaults.length : 0}
            />
            <div className="flex-1">
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <h1 className="text-3xl font-bold mr-4">Dashboard</h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {getActiveTabLabel(activeTab)}
                  </span>
                </div>
                <p className="text-gray-600">Manage your escrow vaults and transactions</p>
              </div>
              
              {showSuccessMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  {successMessage}
                </div>
              )}
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                {activeTab === 'vaults' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Your Vaults</h2>
                    
                    {/* Show UserStatistics at top of vaults tab */}
                    <div className="mb-8">
                      <UserStatistics />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.isArray(vaults) && vaults.map((vault: any) => (
                        <div key={vault.id} className="bg-gray-50 p-6 rounded-lg border">
                          <h3 className="text-xl font-semibold mb-2 truncate" title={vault.id}>Vault ID: {vault.id?.substring(0, 8)}...</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Status: <span className={`font-semibold ${vault.locked ? 'text-red-500' : 'text-green-500'}`}>
                              {vault.locked ? 'Locked' : 'Unlocked'}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 mb-4">
                            Assets: {vault.assets?.length || 0}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            {vault.locked ? (
                              <Button 
                                onClick={handleUnlockVaultClick(vault.id)}
                                variant="success"
                                size="sm"
                              >
                                Unlock
                              </Button>
                            ) : (
                              <Button 
                                onClick={handleLockVaultClick(vault.id)}
                                variant="primary"
                                size="sm"
                              >
                                Lock
                              </Button>
                            )}
                            
                            <Button 
                              onClick={handleNavigateToSwapEscrow}
                              disabled={vault.locked}
                              variant="warning"
                              size="sm"
                            >
                              Swap
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'escrow' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Your Escrow Vaults</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {!Array.isArray(escrowVaults) || escrowVaults.length === 0 ? (
                        <div className="col-span-full text-center py-10">
                          <div className="bg-gray-100 rounded-lg p-8">
                            <div className="text-4xl mb-4">🤝</div>
                            <p className="text-gray-500 mb-4 text-lg">You don't have any escrow vaults yet.</p>
                            <p className="text-gray-400 text-sm mb-6">Create an escrow to securely trade with others</p>
                            <Button 
                              onClick={handleNavigateToCreateEscrow}
                              variant="primary"
                              size="md"
                            >
                              Create Your First Escrow
                            </Button>
                          </div>
                        </div>
                      ) : (
                        escrowVaults.map((escrow) => (
                          <div key={escrow.id} className="bg-gray-50 p-6 rounded-lg border">
                            <h3 className="text-xl font-semibold mb-2 truncate" title={escrow.id}>
                              Escrow ID: {escrow.id.substring(0, 8)}...
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Sender: {escrow.sender.substring(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Recipient: {escrow.recipient.substring(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-600 mb-4">
                              Status: <span className="font-semibold text-yellow-600">Locked</span>
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mt-4">
                              <Button 
                                onClick={handleNavigateToUnlockEscrow}
                                variant="success"
                                size="sm"
                              >
                                Unlock
                              </Button>
                              <Button 
                                onClick={handleNavigateToSwapEscrow}
                                variant="warning"
                                size="sm"
                              >
                                Swap
                              </Button>
                              <Button 
                                onClick={handleNavigateToReturnEscrow}
                                variant="danger"
                                size="sm"
                              >
                                Return
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}                
                {activeTab === 'create-escrow' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Create New Escrow</h2>
                    <div className="max-w-2xl">
                      <CreateEscrowForm onSuccess={handleEscrowSuccess} />
                    </div>
                  </div>
                )}
                
                {activeTab === 'create-seller-escrow' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Create Seller Escrow</h2>
                    <div className="max-w-2xl">
                      <SellerEscrowForm onSuccess={handleEscrowSuccess} />
                    </div>
                  </div>
                )}
                
                {activeTab === 'unlock-escrow' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Unlock Escrow Vault</h2>
                    <div className="max-w-2xl">
                      <UnlockEscrowVaultForm onSuccess={handleEscrowSuccess} />
                    </div>
                  </div>
                )}
                
                {activeTab === 'swap-escrow' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Swap Escrow Vaults</h2>
                    <div className="max-w-2xl">
                      <SwapEscrowVaultForm onSuccess={handleEscrowSuccess} />
                    </div>
                  </div>
                )}
                
                {activeTab === 'return-escrow' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Return Escrow to Sender</h2>
                    <div className="max-w-2xl">
                      <ReturnToSenderForm onSuccess={handleEscrowSuccess} />
                    </div>
                  </div>
                )}
                
                {activeTab === 'history' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
                    <div className="mb-8">
                      <UserStatistics />
                    </div>
                    <TransactionHistory />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}