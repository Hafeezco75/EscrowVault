'use client';

import { useVault } from "../hooks/useVault";
import { useEscrowVault } from "../hooks/useEscrowVault";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import Button from "../components/common/Button";

export default function Home() {
  const { vaults, isConnected } = useVault();
  const { escrowVaults } = useEscrowVault();
  const account = useCurrentAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <main className="max-w-6xl mx-auto px-8 py-12 sm:px-12 sm:py-16">
        <div className="text-center mb-16 bg-white rounded-2xl shadow-2xl p-8 sm:p-12 border border-gray-100">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Secure Your Assets with 
            <span className="text-blue-600 drop-shadow-sm">Esca</span>
          </h1>
          <p className="text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
            Create secure escrow vaults on the Sui blockchain for safe asset transfers with cryptographic guarantees
          </p>
          
          {!isConnected ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 mb-8 rounded-lg shadow-lg border border-yellow-200" role="alert">
              <div className="flex items-center">
                <div className="text-2xl mr-3">⚠️</div>
                <p className="font-medium">Please connect your wallet to create an escrow vault.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 shadow-xl">
                <Link href="/create">
                  <Button
                    variant="primary"
                    size="lg"
                    className="text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 mb-4"
                  >
                    🔒 Create Vault
                  </Button>
                </Link>
                <p className="text-sm text-blue-700 font-medium drop-shadow-sm">Click to create your secure blockchain vault</p>
              </div>
              
              {(vaults.length > 0 || escrowVaults.length > 0) && (
                <div className="mt-4">
                  <Link 
                    href="/dashboard" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View your vaults in the dashboard
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-4 drop-shadow-lg">🔒</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Create Escrow Vault</h2>
            <p className="mb-4 text-gray-600">Create secure escrow vaults for safe asset transfers between parties.</p>
            <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-1">
              <li>Secure asset holding</li>
              <li>Recipient verification</li>
              <li>Key-based unlocking</li>
              <li>Return to sender option</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-4 drop-shadow-lg">🔄</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Unlock & Swap</h2>
            <p className="mb-4 text-gray-600">Unlock escrow vaults with proper keys or swap between participants.</p>
            <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-1">
              <li>Key-based unlocking</li>
              <li>Secure asset swapping</li>
              <li>Automatic verification</li>
              <li>Transaction history</li>
            </ul>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-4 drop-shadow-lg">📊</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Manage Assets</h2>
            <p className="mb-6 text-gray-600">Easily manage your escrow vaults with our intuitive dashboard.</p>
            <ul className="list-disc pl-5 mb-6 text-gray-600 space-y-1">
              <li>View all vaults</li>
              <li>Monitor escrow status</li>
              <li>Return to sender</li>
              <li>Transaction tracking</li>
            </ul>
            <Link href="/dashboard">
              <Button
                variant="secondary"
                size="md"
                className="w-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Check Assets
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
