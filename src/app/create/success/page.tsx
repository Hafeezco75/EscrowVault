'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from "../../../components/common/Button";

export default function CreateSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [vaultId, setVaultId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('vaultId');
    setVaultId(id);
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 px-8 py-12 sm:px-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center border border-gray-100">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 shadow-lg">
            <svg
              className="h-8 w-8 text-green-600 drop-shadow-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 drop-shadow-sm">
            Vault Created Successfully!
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-6">
            Your vault has been successfully created and confirmed on the Sui blockchain. 
            The vault is automatically locked and ready for secure escrow transactions.
          </p>

          {/* Vault ID Display */}
          {vaultId && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6 shadow-inner border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Vault ID:</h3>
              <p className="text-sm font-mono text-gray-900 break-all">
                {vaultId}
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 shadow-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
            <div className="text-left space-y-2">
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                <span className="text-blue-800">Go to your dashboard to view your new vault</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                <span className="text-blue-800">Create escrow transactions using your vault</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                <span className="text-blue-800">Manage escrow operations (unlock, swap, return)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleContinue}
              variant="primary"
              size="lg"
            >
              Go to Dashboard
            </Button>
            <Link
              href="/create"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
            >
              Create Another Vault
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            ✓ Your vault is now secured on the Sui blockchain
            <br />
            ✓ Transaction confirmed and permanently recorded
            <br />
            ✓ Vault is automatically locked for security
          </p>
        </div>
      </div>
    </div>
  );
}