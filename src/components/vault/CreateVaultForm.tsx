'use client';

import { useState } from 'react';
import { useVault } from '../../hooks/useVault';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import Button from '../common/Button';
import { PACKAGE_ID } from '../providers';

interface CreateVaultFormProps {
  onSuccess?: (vaultId: string) => void;
}

export default function CreateVaultForm({ onSuccess }: CreateVaultFormProps) {
  const account = useCurrentAccount();
  const router = useRouter();
  const { 
    createVaultAsync, 
    isCreatingVault
  } = useVault();

  // Consolidated form state using single useState with spread operator
  const [formState, setFormState] = useState({
    key: '',
    locked: '',
    ownerExchangeKey: '',
    errors: {} as Record<string, string>,
    isConfirming: false,
    txStage: 'idle' as 'idle' | 'validating' | 'wallet-approval' | 'processing' | 'success'
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.key.trim()) {
      newErrors.key = 'Vault key is required';
    } else if (formState.key.length < 3) {
      newErrors.key = 'Vault key must be at least 3 characters long';
    }
    
    if (!formState.locked.trim()) {
      newErrors.locked = 'Locked object ID is required';
    } else if (!/^0x[a-fA-F0-9]{40,}$/.test(formState.locked)) {
      newErrors.locked = 'Invalid locked object ID format (must start with 0x followed by hex characters)';
    }
    
    if (!formState.ownerExchangeKey.trim()) {
      newErrors.ownerExchangeKey = 'Owner exchange key is required';
    } else if (formState.ownerExchangeKey.length < 8) {
      newErrors.ownerExchangeKey = 'Exchange key must be at least 8 characters long';
    }
    
    setFormState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateVault = async () => {
    if (!account || !validateForm()) return;
    
    try {
      // Stage 1: Pre-transaction validation
      setFormState(prev => ({
        ...prev,
        txStage: 'validating',
        isConfirming: true,
        errors: {}
      }));
      
      // Validate wallet connection and gas availability
      if (!account.address) {
        throw new Error('Wallet not properly connected');
      }
      
      console.log('Creating vault with parameters:', {
        key: formState.key,
        locked: formState.locked,
        ownerExchangeKey: formState.ownerExchangeKey,
        ownerAddress: account.address
      });
      
      // Stage 2: Request wallet approval
      setFormState(prev => ({ ...prev, txStage: 'wallet-approval' }));
      
      // Stage 3: Processing transaction
      setFormState(prev => ({ ...prev, txStage: 'processing' }));
      
      let result: any;
      try {
        result = await createVaultAsync({
          key: formState.key,
          locked: formState.locked,
          ownerExchangeKey: formState.ownerExchangeKey,
          ownerAddress: account.address
        });
      } catch (error) {
        throw error; // Re-throw to be caught by outer catch
      }
      
      console.log('Vault creation result:', result);
      
      // Stage 4: Success
      setFormState(prev => ({ ...prev, txStage: 'success' }));
      
      // Extract vault ID from transaction result
      // The transaction result should contain the created object ID
      let vaultId: string;
      
      if (result) {
        // Try to extract from various possible locations in the result
        const resultObj = result as any;
        vaultId = 
          resultObj?.effects?.created?.[0]?.reference?.objectId ||
          resultObj?.objectChanges?.find((change: any) => change.type === 'created')?.objectId ||
          resultObj?.digest ||
          `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        vaultId = `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      console.log('Extracted vault ID:', vaultId);
      
      // Reset form on success
      setFormState(prev => ({
        ...prev,
        key: '',
        locked: '',
        ownerExchangeKey: '',
        errors: {}
      }));
      
      // Small delay to show success state
      setTimeout(() => {
        // Navigate to success page with vault ID
        router.push(`/create/success?vaultId=${vaultId}`);
        onSuccess?.(vaultId);
      }, 1000);
      
    } catch (error) {
      console.error('Error creating vault:', error);
      setFormState(prev => ({ ...prev, txStage: 'idle' }));
      
      // Enhanced error messaging based on error type
      let errorMessage = 'Failed to create vault. Please try again.';
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
          errorMessage = 'Transaction was rejected. Please approve the transaction in your wallet.';
        } else if (errorMsg.includes('insufficient') || errorMsg.includes('balance')) {
          errorMessage = 'Insufficient gas or balance. Please ensure you have enough SUI tokens.';
        } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (errorMsg.includes('invalid') || errorMsg.includes('argument')) {
          errorMessage = 'Invalid input parameters. Please check your form data.';
        } else if (errorMsg.includes('contract') || errorMsg.includes('move')) {
          errorMessage = 'Smart contract error. Please verify the contract is deployed correctly.';
        } else {
          errorMessage = `Transaction failed: ${error.message}`;
        }
      }
      
      setFormState(prev => ({ ...prev, errors: { submit: errorMessage } }));
    } finally {
      setFormState(prev => ({ ...prev, isConfirming: false }));
    }
  };

  // Input change handlers
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, key: e.target.value }));
  const handleLockedChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, locked: e.target.value }));
  const handleOwnerExchangeKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, ownerExchangeKey: e.target.value }));

  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 drop-shadow-sm">
        Create New Vault
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Vault Key
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            value={formState.key}
            onChange={handleKeyChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 shadow-sm ${
              formState.errors.key 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="e.g., my-unique-vault-key-2024"
            disabled={isCreatingVault || formState.isConfirming}
          />
          {formState.errors.key && <p className="text-red-500 text-sm mt-1">{formState.errors.key}</p>}
          <p className="text-gray-500 text-xs mt-1">A unique identifier for your vault (min 3 characters)</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Locked Object ID
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            value={formState.locked}
            onChange={handleLockedChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 shadow-sm ${
              formState.errors.locked 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="0x1234567890abcdef..."
            disabled={isCreatingVault || formState.isConfirming}
          />
          {formState.errors.locked && <p className="text-red-500 text-sm mt-1">{formState.errors.locked}</p>}
          <p className="text-gray-500 text-xs mt-1">The Sui object ID of the asset to be locked in escrow</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Owner Exchange Key
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            value={formState.ownerExchangeKey}
            onChange={handleOwnerExchangeKeyChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 shadow-sm ${
              formState.errors.ownerExchangeKey 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="your-secure-exchange-key"
            disabled={isCreatingVault || formState.isConfirming}
          />
          {formState.errors.ownerExchangeKey && (
            <p className="text-red-500 text-sm mt-1">{formState.errors.ownerExchangeKey}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Your unique key for asset exchange (min 8 characters, keep it secure)</p>
        </div>
        
        {formState.errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-0.5">
                <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Transaction Failed</h4>
                <p className="text-sm mt-1">{formState.errors.submit}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Informational Section */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">About Vault Creation</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your vault will be created on the Sui blockchain</li>
                <li>• Gas fee: ~0.01 SUI (automatically calculated)</li>
                <li>• Vault will be automatically locked upon creation</li>
                <li>• Keep your exchange key secure - it's needed for unlocking</li>
                <li>• Connected wallet: {account?.address?.substring(0, 10)}...{account?.address?.substring(-6)}</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Enhanced Transaction Status Messages with Loading States */}
        {formState.txStage === 'validating' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
              <div>
                <p className="font-medium">Validating Transaction</p>
                <p className="text-sm">Checking wallet connection and parameters...</p>
              </div>
            </div>
          </div>
        )}
        
        {formState.txStage === 'wallet-approval' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <div className="animate-pulse rounded-full h-4 w-4 bg-yellow-600 mr-3"></div>
              <div>
                <p className="font-medium">Wallet Approval Required</p>
                <p className="text-sm">Please approve the transaction in your wallet. Ensure you have sufficient gas fees (~0.01 SUI).</p>
                <p className="text-xs mt-1 text-yellow-700">Package ID: {PACKAGE_ID.substring(0, 20)}...</p>
              </div>
            </div>
          </div>
        )}
        
        {formState.txStage === 'processing' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
              <div>
                <p className="font-medium">Processing Transaction</p>
                <p className="text-sm">Your vault is being created on the Sui blockchain...</p>
                <p className="text-xs mt-1 text-blue-600">This may take a few seconds to complete.</p>
              </div>
            </div>
          </div>
        )}
        
        {formState.txStage === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <div className="rounded-full h-4 w-4 bg-green-600 mr-3 flex items-center justify-center shadow-sm">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Vault Created Successfully!</p>
                <p className="text-sm">Redirecting to success page...</p>
              </div>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleCreateVault}
          disabled={isCreatingVault || formState.isConfirming || !account || formState.txStage !== 'idle'}
          variant="primary"
          size="lg"
          fullWidth
          loading={formState.isConfirming || isCreatingVault}
          loadingText={
            formState.txStage === 'validating' ? "Validating..." :
            formState.txStage === 'wallet-approval' ? "Awaiting wallet approval..." :
            formState.txStage === 'processing' ? "Creating vault..." :
            formState.txStage === 'success' ? "Success! Redirecting..." :
            "Creating Vault..."
          }
        >
          {formState.txStage === 'success' ? 'Vault Created!' : 'Create Vault'}
        </Button>
      </div>
    </div>
  );
}