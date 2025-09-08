'use client';

import { useVault } from "../hooks/useVault";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const { createVault, isCreatingVault, vaults, isConnected } = useVault();
  const account = useCurrentAccount();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreateVault = async () => {
    try {
      await createVault();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating vault:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-6xl mx-auto mt-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Secure Your Assets with Escrow Vault</h1>
          <p className="text-xl mb-8">Create your vault on the Sui blockchain and manage your assets securely</p>
          
          {!isConnected ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
              <p>Please connect your wallet to create a vault.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6">
              <button 
                onClick={handleCreateVault}
                disabled={isCreatingVault}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingVault ? 'Creating Vault...' : 'Create New Vault'}
              </button>
              
              {showSuccess && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
                  <p>Vault created successfully!</p>
                </div>
              )}
              
              {vaults.length > 0 && (
                <div className="mt-4">
                  <Link 
                href="/dashboard" 
                className="text-pink-400 hover:text-pink-300 underline"
              >
                View your vaults in the dashboard
              </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Create Your Vault</h2>
            <p className="mb-4">Create a secure vault to store your digital assets on the Sui blockchain.</p>
            <ul className="list-disc pl-5 mb-4">
              <li>Secure storage for your assets</li>
              <li>Full control over your vault</li>
              <li>Lock and unlock as needed</li>
            </ul>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Manage Your Assets</h2>
            <p className="mb-4">Easily manage your assets with our intuitive dashboard.</p>
            <ul className="list-disc pl-5 mb-4">
              <li>View all your vaults in one place</li>
              <li>Lock and unlock vaults</li>
              <li>Swap assets between vaults</li>
            </ul>
            <Link 
              href="/dashboard" 
              className="inline-block bg-pink-200 hover:bg-pink-300 dark:bg-pink-700 dark:hover:bg-pink-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded"
            >
              Check Assets
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
