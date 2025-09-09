'use client';

import { useState } from 'react';
import { useEscrowVault } from '../../hooks/useEscrowVault';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Button from '../common/Button';

interface SwapEscrowVaultFormProps {
  onSuccess?: () => void;
}

export default function SwapEscrowVaultForm({ onSuccess }: SwapEscrowVaultFormProps) {
  const account = useCurrentAccount();
  const { 
    swapEscrowVaults, 
    isSwappingEscrowVaults
  } = useEscrowVault();

  // Consolidated form state using single useState with spread operator
  const [formState, setFormState] = useState({
    ownerEscrowId: '',
    recipientEscrowId: '',
    errors: {} as Record<string, string>
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.ownerEscrowId.trim()) {
      newErrors.ownerEscrowId = 'Owner escrow ID is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(formState.ownerEscrowId)) {
      newErrors.ownerEscrowId = 'Invalid escrow ID format';
    }
    
    if (!formState.recipientEscrowId.trim()) {
      newErrors.recipientEscrowId = 'Recipient escrow ID is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(formState.recipientEscrowId)) {
      newErrors.recipientEscrowId = 'Invalid escrow ID format';
    }
    
    if (formState.ownerEscrowId === formState.recipientEscrowId) {
      newErrors.recipientEscrowId = 'Recipient escrow ID must be different from owner escrow ID';
    }
    
    setFormState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSwapEscrowVaults = async () => {
    if (!account || !validateForm()) return;
    
    try {
      await swapEscrowVaults({
        ownerEscrowId: formState.ownerEscrowId,
        recipientEscrowId: formState.recipientEscrowId
      });
      
      // Reset form on success
      setFormState(prev => ({
        ...prev,
        ownerEscrowId: '',
        recipientEscrowId: '',
        errors: {}
      }));
      
      onSuccess?.();
    } catch (error) {
      console.error('Error swapping escrow vaults:', error);
      setFormState(prev => ({ ...prev, errors: { submit: 'Failed to swap escrow vaults. Please check the IDs and try again.' } }));
    }
  };

  // Input change handlers
  const handleOwnerEscrowIdChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, ownerEscrowId: e.target.value }));
  const handleRecipientEscrowIdChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, recipientEscrowId: e.target.value }));

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Swap Escrow Vaults
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Owner Escrow ID
          </label>
          <input 
            type="text" 
            value={formState.ownerEscrowId}
            onChange={handleOwnerEscrowIdChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              formState.errors.ownerEscrowId 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="0x..."
          />
          {formState.errors.ownerEscrowId && (
            <p className="text-red-500 text-sm mt-1">{formState.errors.ownerEscrowId}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Recipient Escrow ID
          </label>
          <input 
            type="text" 
            value={formState.recipientEscrowId}
            onChange={handleRecipientEscrowIdChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              formState.errors.recipientEscrowId 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="0x..."
          />
          {formState.errors.recipientEscrowId && (
            <p className="text-red-500 text-sm mt-1">{formState.errors.recipientEscrowId}</p>
          )}
        </div>
        
        {formState.errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {formState.errors.submit}
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <p className="text-sm">
            <strong>Note:</strong> Both escrow vaults must be owned by different parties and have matching exchange requirements for the swap to succeed.
          </p>
        </div>
        
        <Button 
          onClick={handleSwapEscrowVaults}
          disabled={isSwappingEscrowVaults || !account}
          variant="primary"
          size="lg"
          fullWidth
          loading={isSwappingEscrowVaults}
          loadingText="Swapping..."
        >
          Swap Escrow Vaults
        </Button>
      </div>
    </div>
  );
}