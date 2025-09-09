'use client';

import { useState } from 'react';
import { useEscrowVault } from '../../hooks/useEscrowVault';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Button from '../common/Button';

interface ReturnToSenderFormProps {
  onSuccess?: () => void;
}

export default function ReturnToSenderForm({ onSuccess }: ReturnToSenderFormProps) {
  const account = useCurrentAccount();
  const { 
    returnEscrowToSender, 
    isReturningEscrowToSender
  } = useEscrowVault();

  // Form states
  const [escrowId, setEscrowId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!escrowId.trim()) {
      newErrors.escrowId = 'Escrow ID is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(escrowId)) {
      newErrors.escrowId = 'Invalid escrow ID format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReturnToSender = async () => {
    if (!account || !validateForm()) return;
    
    try {
      await returnEscrowToSender({
        escrowId
      });
      
      // Reset form on success
      setEscrowId('');
      setErrors({});
      
      onSuccess?.();
    } catch (error) {
      console.error('Error returning escrow to sender:', error);
      setErrors({ submit: 'Failed to return escrow to sender. Please check the escrow ID.' });
    }
  };

  // Input change handler
  const handleEscrowIdChange = (e: React.ChangeEvent<HTMLInputElement>) => setEscrowId(e.target.value);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Return Escrow to Sender
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Escrow ID
          </label>
          <input 
            type="text" 
            value={escrowId}
            onChange={handleEscrowIdChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              errors.escrowId 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            }`}
            placeholder="0x..."
          />
          {errors.escrowId && <p className="text-red-500 text-sm mt-1">{errors.escrowId}</p>}
        </div>
        
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="text-sm">
            <strong>Warning:</strong> This action will return the escrowed items to the original sender. This action cannot be undone.
          </p>
        </div>
        
        <Button 
          onClick={handleReturnToSender}
          disabled={isReturningEscrowToSender || !account}
          variant="danger"
          size="lg"
          fullWidth
          loading={isReturningEscrowToSender}
          loadingText="Returning..."
        >
          Return to Sender
        </Button>
      </div>
    </div>
  );
}