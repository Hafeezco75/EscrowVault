'use client';

import { useState } from 'react';
import { useEscrowVault } from '../../hooks/useEscrowVault';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Button from '../common/Button';
import PasswordInput from '../common/PasswordInput';

interface CreateEscrowFormProps {
  onSuccess?: () => void;
}

export default function CreateEscrowForm({ onSuccess }: CreateEscrowFormProps) {
  const account = useCurrentAccount();
  const { 
    createEscrowVault, 
    isCreatingEscrowVault
  } = useEscrowVault();

  // Consolidated form state using single useState with spread operator
  const [formState, setFormState] = useState({
    key: '',
    locked: '',
    recipientExchangeKey: '',
    recipient: '',
    errors: {} as Record<string, string>
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.key.trim()) {
      newErrors.key = 'Key object ID is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(formState.key)) {
      newErrors.key = 'Invalid key object ID format';
    }
    
    if (!formState.locked.trim()) {
      newErrors.locked = 'Locked asset ID is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(formState.locked)) {
      newErrors.locked = 'Invalid locked asset ID format';
    }
    
    if (!formState.recipientExchangeKey.trim()) {
      newErrors.recipientExchangeKey = 'Recipient exchange key is required';
    }
    
    if (!formState.recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(formState.recipient)) {
      newErrors.recipient = 'Invalid recipient address format';
    }
    
    setFormState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateEscrow = async () => {
    if (!account || !validateForm()) return;
    
    try {
      await createEscrowVault({
        key: formState.key,
        locked: formState.locked,
        recipientExchangeKey: formState.recipientExchangeKey,
        recipient: formState.recipient,
        verifier: account?.address || ''
      });
      
      // Reset form on success
      setFormState(prev => ({
        ...prev,
        key: '',
        locked: '',
        recipientExchangeKey: '',
        recipient: '',
        errors: {}
      }));
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating escrow:', error);
      setFormState(prev => ({ ...prev, errors: { submit: 'Failed to create escrow. Please try again.' } }));
    }
  };

  // Input change handlers
  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, key: e.target.value }));
  const handleLockedChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, locked: e.target.value }));
  const handleRecipientExchangeKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, recipientExchangeKey: e.target.value }));
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, recipient: e.target.value }));

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Create Escrow
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Key Object ID
          </label>
          <input 
            type="text" 
            value={formState.key}
            onChange={handleKeyChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
              formState.errors.key 
                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
            }`}
            placeholder="0x... (Key object for the escrow)"
          />
          {formState.errors.key && <p className="text-red-500 text-sm mt-1">{formState.errors.key}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Locked Asset ID
          </label>
          <input 
            type="text" 
            value={formState.locked}
            onChange={handleLockedChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
              formState.errors.locked 
                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
            }`}
            placeholder="0x... (Asset to be locked in escrow)"
          />
          {formState.errors.locked && <p className="text-red-500 text-sm mt-1">{formState.errors.locked}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Recipient Exchange Key
          </label>
          <PasswordInput
            value={formState.recipientExchangeKey}
            onChange={handleRecipientExchangeKeyChange}
            placeholder="Enter recipient's exchange key"
            error={!!formState.errors.recipientExchangeKey}
            autoComplete="new-password"
          />
          {formState.errors.recipientExchangeKey && (
            <p className="text-red-500 text-sm mt-1">{formState.errors.recipientExchangeKey}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Recipient Address
          </label>
          <input 
            type="text" 
            value={formState.recipient}
            onChange={handleRecipientChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
              formState.errors.recipient 
                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800'
            }`}
            placeholder="0x..."
          />
          {formState.errors.recipient && <p className="text-red-500 text-sm mt-1">{formState.errors.recipient}</p>}
        </div>
        
        {formState.errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            {formState.errors.submit}
          </div>
        )}
        
        <Button 
          onClick={handleCreateEscrow}
          disabled={isCreatingEscrowVault || !account}
          variant="primary"
          size="lg"
          fullWidth
          loading={isCreatingEscrowVault}
          loadingText="Creating Escrow..."
        >
          Create Escrow
        </Button>
      </div>
    </div>
  );
}