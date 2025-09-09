'use client';

import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import CreateVaultForm from "../../components/vault/CreateVaultForm";

export default function CreateVaultPage() {
  const account = useCurrentAccount();

  const handleVaultSuccess = (vaultId: string) => {
    console.log('Vault created successfully:', vaultId);
  };

  if (!account) {
    return (
      <div className="min-h-screen p-8 pb-20 sm:p-20">
        <div className="max-w-4xl mx-auto mt-10">
          <div className="text-center">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
              <p>Please connect your wallet to create an escrow vault.</p>
            </div>
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-4xl mx-auto px-8 py-12 sm:px-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create New Vault</h1>
          <p className="text-gray-600">
            Create a secure vault on the Sui blockchain. Your wallet will prompt you to approve the transaction.
          </p>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
          <CreateVaultForm onSuccess={handleVaultSuccess} />
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 shadow-lg border border-blue-100">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Transaction Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-blue-900 mb-2">1. Fill Form</h3>
              <p className="text-sm text-blue-700">Enter your vault details and asset information</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">2. Wallet Approval</h3>
              <p className="text-sm text-blue-700">Approve the transaction in your Sui wallet</p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">3. Vault Created</h3>
              <p className="text-sm text-blue-700">Your vault will be created on the blockchain</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-200 shadow-inner">
            <h4 className="font-medium text-blue-900 mb-1">💡 Important Notes:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure you have enough SUI tokens for gas fees</li>
              <li>• Your vault will be automatically locked upon creation</li>
              <li>• Keep your keys safe - they're needed to unlock the vault</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}