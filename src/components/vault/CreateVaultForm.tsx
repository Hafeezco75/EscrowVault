'use client';

import { useState, useEffect } from 'react';
import { useVault } from '../../hooks/useVault';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../common/Button';
import PasswordInput from '../common/PasswordInput';
import { PACKAGE_ID } from '../providers';
import { VaultDebugger } from '../../utils/VaultDebugger';

interface CreateVaultFormProps {
  onSuccess?: (vaultId: string) => void;
}

export default function CreateVaultForm({ onSuccess }: CreateVaultFormProps) {
  const account = useCurrentAccount();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { 
    createVaultAsync, 
    isCreatingVault
  } = useVault();

  // Consolidated form state using single useState with spread operator
  const [formState, setFormState] = useState({
    key: '', // Key object ID - must be valid object ID
    locked: '', // Locked object ID - must be valid object ID
    ownerExchangeKey: '', // Owner exchange key
    ownerAddress: account?.address || '', // Add owner address field
    assetObjectId: '0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c', // Asset object ID
    generateKey: true, // Whether to generate key automatically
    typeArguments: ['0x2::sui::SUI'], // Default type arguments
    errors: {} as Record<string, string>,
    isConfirming: false,
    txStage: 'idle' as 'idle' | 'validating' | 'wallet-approval' | 'processing' | 'success'
  });

  // Sync owner address with connected wallet
  useEffect(() => {
    if (account?.address && account.address !== formState.ownerAddress) {
      setFormState(prev => ({ ...prev, ownerAddress: account.address }));
    }
  }, [account?.address, formState.ownerAddress]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate wallet connection and owner address
    if (!account || !account.address) {
      newErrors.wallet = 'Wallet must be connected to create a vault';
      return false;
    }
    
    if (!formState.key.trim() && !formState.generateKey) {
      newErrors.key = 'Key object ID is required when not generating automatically';
    } else if (formState.key.trim() && !/^0x[a-fA-F0-9]{40,}$/.test(formState.key)) {
      newErrors.key = 'Invalid key object ID format (must start with 0x followed by hex characters)';
    }
    
    if (!formState.locked.trim()) {
      newErrors.locked = 'Locked object ID is required';
    } else if (!/^0x[a-fA-F0-9]{40,}$/.test(formState.locked)) {
      newErrors.locked = 'Invalid locked object ID format (must start with 0x followed by hex characters)';
    }
    
    if (!formState.assetObjectId.trim()) {
      newErrors.assetObjectId = 'Asset object ID is required';
    } else if (!/^0x[a-fA-F0-9]{40,}$/.test(formState.assetObjectId)) {
      newErrors.assetObjectId = 'Invalid asset object ID format (must start with 0x followed by hex characters)';
    }
    
    if (!formState.ownerExchangeKey.trim()) {
      newErrors.ownerExchangeKey = 'Owner exchange key is required';
    } else if (formState.ownerExchangeKey.length < 8) {
      newErrors.ownerExchangeKey = 'Exchange key must be at least 8 characters long';
    }
    
    // Validate owner address format
    if (!formState.ownerAddress || !/^0x[a-fA-F0-9]{40,}$/.test(formState.ownerAddress)) {
      newErrors.ownerAddress = 'Invalid owner address format';
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
      
      // Enhanced validation with debug info
      if (!account || !account.address) {
        throw new Error('Wallet not properly connected. Please reconnect your wallet.');
      }
      
      // Validate that owner address is properly formatted
      if (!/^0x[a-fA-F0-9]{40,}$/.test(account.address)) {
        throw new Error('Invalid owner address format. Please reconnect your wallet.');
      }
      
      // Debug test the transaction before attempting to create it
      console.log('🔍 Running pre-flight transaction test...');
      const debugResult = VaultDebugger.testVaultCreation(
        formState.key,
        formState.locked,
        formState.ownerExchangeKey,
        formState.ownerAddress || account.address,
        formState.assetObjectId
      );
      
      if (!debugResult.success) {
        throw new Error(`Pre-flight validation failed: ${debugResult.errors?.join(', ') || debugResult.error}`);
      }
      
      console.log('✅ Pre-flight test passed, proceeding with transaction...');
      
      console.log('Creating vault with parameters:', {
        key: formState.key,
        locked: formState.locked,
        ownerExchangeKey: formState.ownerExchangeKey,
        ownerAddress: formState.ownerAddress || account.address,
        walletConnected: !!account,
        packageId: PACKAGE_ID
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
          ownerAddress: formState.ownerAddress || account.address,
          assetObjectId: formState.assetObjectId,
          generateKey: formState.generateKey,
          typeArguments: formState.typeArguments
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
        locked: '', // Reset to empty for new object IDs
        ownerExchangeKey: '',
        ownerAddress: account.address || '', // Reset owner address to current wallet
        assetObjectId: '0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c', // Reset to default
        generateKey: true, // Reset to auto-generate
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
  const handleAssetObjectIdChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, assetObjectId: e.target.value }));
  const handleGenerateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, generateKey: e.target.checked }));
  const handleOwnerExchangeKeyChange = (value: string) => 
    setFormState(prev => ({ ...prev, ownerExchangeKey: value }));
  const handleOwnerAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, ownerAddress: e.target.value }));
  const handleTypeArgumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typeArgs = e.target.value.split(',').map(t => t.trim()).filter(t => t);
    setFormState(prev => ({ ...prev, typeArguments: typeArgs.length > 0 ? typeArgs : ['0x2::sui::SUI'] }));
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 drop-shadow-sm">
        Create New Vault
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Key Object ID
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            value={formState.key}
            onChange={handleKeyChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ${
              formState.errors.key 
                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
            }`}
            placeholder="0x1234567890abcdef..."
            disabled={(isCreatingVault || formState.isConfirming) || formState.generateKey}
          />
          {formState.errors.key && <p className="text-red-500 text-sm mt-1">{formState.errors.key}</p>}
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">The Sui object ID of the key object for the vault</p>
          
          {/* Auto-generate key option */}
          <div className="mt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.generateKey}
                onChange={handleGenerateKeyChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isCreatingVault || formState.isConfirming}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-generate key from asset ID
              </span>
            </label>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">When enabled, a new key will be created automatically using the asset object ID</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Locked Object ID
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            value={formState.locked}
            onChange={handleLockedChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ${
              formState.errors.locked 
                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
            }`}
            placeholder="0x1234567890abcdef..."
            disabled={isCreatingVault || formState.isConfirming}
          />
          {formState.errors.locked && <p className="text-red-500 text-sm mt-1">{formState.errors.locked}</p>}
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">The Sui object ID of the asset to be locked in escrow</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Asset Object ID
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            value={formState.assetObjectId}
            onChange={handleAssetObjectIdChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ${
              formState.errors.assetObjectId 
                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
            }`}
            placeholder="0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c"
            disabled={isCreatingVault || formState.isConfirming}
          />
          {formState.errors.assetObjectId && <p className="text-red-500 text-sm mt-1">{formState.errors.assetObjectId}</p>}
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">The Sui object ID of the specific asset to be locked in the vault</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Owner Exchange Key
            <span className="text-red-500 ml-1">*</span>
          </label>
          <PasswordInput
            value={formState.ownerExchangeKey}
            onChange={handleOwnerExchangeKeyChange}
            placeholder="your-secure-exchange-key"
            disabled={isCreatingVault || formState.isConfirming}
            error={!!formState.errors.ownerExchangeKey}
            autoComplete="new-password"
            aria-describedby="owner-exchange-key-error owner-exchange-key-help"
          />
          {formState.errors.ownerExchangeKey && (
            <p id="owner-exchange-key-error" className="text-red-500 text-sm mt-1">{formState.errors.ownerExchangeKey}</p>
          )}
          <p id="owner-exchange-key-help" className="text-gray-500 dark:text-gray-400 text-xs mt-1">Your unique key for asset exchange (min 8 characters, keep it secure)</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Owner Address
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input 
            type="text" 
            value={formState.ownerAddress}
            onChange={handleOwnerAddressChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm cursor-not-allowed ${
              formState.errors.ownerAddress 
                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Connected wallet address"
            disabled={true}
            readOnly
          />
          {formState.errors.ownerAddress && <p className="text-red-500 text-sm mt-1">{formState.errors.ownerAddress}</p>}
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Automatically set to your connected wallet address (read-only)</p>
        </div>
        
        {/* Advanced: Type Arguments Field */}
        <div className="border-t pt-4">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 list-none">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 transform group-open:rotate-90 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Advanced: Type Arguments (Optional)
              </span>
            </summary>
            <div className="mt-2">
              <input 
                type="text" 
                value={formState.typeArguments.join(', ')}
                onChange={handleTypeArgumentsChange}
                className="w-full p-3 border rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                placeholder="0x2::sui::SUI, 0xabc123::my_assets::MyAsset"
                disabled={isCreatingVault || formState.isConfirming}
              />
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Comma-separated type arguments for generic vault (defaults to SUI)</p>
            </div>
          </details>
        </div>
        
        {(formState.errors.submit || formState.errors.wallet) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-0.5">
                <svg className="h-4 w-4 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Transaction Failed</h4>
                <p className="text-sm mt-1">{formState.errors.submit || formState.errors.wallet}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Informational Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">About Vault Creation</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Your vault will be created on the Sui blockchain</li>
                <li>• Gas fee: ~0.01 SUI (automatically calculated)</li>
                <li>• Key generation: {formState.generateKey ? 'Auto-generated from asset ID' : 'Using provided key object ID'}</li>
                <li>• Key and Locked fields require actual Sui object IDs</li>
                <li>• Asset Object ID specifies which asset will be locked</li>
                <li>• Objects must be owned by your wallet</li>
                <li>• Keep your exchange key secure - it's needed for operations</li>
                <li>• Connected wallet: {account?.address ? `${account.address.substring(0, 10)}...${account.address.substring(account.address.length - 6)}` : 'Not connected'}</li>
                <li>• Owner address: {formState.ownerAddress ? `${formState.ownerAddress.substring(0, 10)}...${formState.ownerAddress.substring(formState.ownerAddress.length - 6)}` : 'Not set'}</li>
                <li>• Asset: {formState.assetObjectId ? `${formState.assetObjectId.substring(0, 10)}...${formState.assetObjectId.substring(formState.assetObjectId.length - 6)}` : 'Not set'}</li>
                <li>• Type arguments: {formState.typeArguments.join(', ')}</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Enhanced Transaction Status Messages with Loading States */}
        {formState.txStage === 'validating' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400 mr-3"></div>
              <div>
                <p className="font-medium">Validating Transaction</p>
                <p className="text-sm">Checking wallet connection and parameters...</p>
              </div>
            </div>
          </div>
        )}
        
        {formState.txStage === 'wallet-approval' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <div className="animate-pulse rounded-full h-4 w-4 bg-yellow-600 dark:bg-yellow-500 mr-3"></div>
              <div>
                <p className="font-medium">Wallet Approval Required</p>
                <p className="text-sm">Please approve the transaction in your wallet. Ensure you have sufficient gas fees (~0.01 SUI).</p>
                <p className="text-xs mt-1 text-yellow-700 dark:text-yellow-400">Package ID: {PACKAGE_ID.substring(0, 20)}...</p>
              </div>
            </div>
          </div>
        )}
        
        {formState.txStage === 'processing' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400 mr-3"></div>
              <div>
                <p className="font-medium">Processing Transaction</p>
                <p className="text-sm">Your vault is being created on the Sui blockchain...</p>
                <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">This may take a few seconds to complete.</p>
              </div>
            </div>
          </div>
        )}
        
        {formState.txStage === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded shadow-lg">
            <div className="flex items-center">
              <div className="rounded-full h-4 w-4 bg-green-600 dark:bg-green-500 mr-3 flex items-center justify-center shadow-sm">
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
        
        {/* Debug Test Button (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Button 
            onClick={() => {
              if (account?.address) {
                const result = VaultDebugger.testVaultCreation(
                  formState.key || '0x0000000000000000000000000000000000000000000000000000000000000001',
                  formState.locked || '0x0000000000000000000000000000000000000000000000000000000000000002',
                  formState.ownerExchangeKey || 'test-key-12345678',
                  formState.ownerAddress || account.address,
                  formState.assetObjectId
                );
                console.log('Debug test result:', result);
                alert(`Debug test ${result.success ? 'passed' : 'failed'}. Check console for details.`);
              }
            }}
            disabled={!account}
            variant="secondary"
            size="md"
            fullWidth
          >
            🔍 Debug Test Transaction
          </Button>
        )}
      </div>
    </div>
  );
}