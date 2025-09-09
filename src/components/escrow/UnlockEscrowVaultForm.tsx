'use client';

import { useState } from 'react';
import { useEscrowVault } from '../../hooks/useEscrowVault';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Button from '../common/Button';

interface UnlockEscrowVaultFormProps {
  onSuccess?: () => void;
}

export default function UnlockEscrowVaultForm({ onSuccess }: UnlockEscrowVaultFormProps) {
  const account = useCurrentAccount();
  const { 
    unlockEscrowVault, 
    isUnlockingEscrowVault
  } = useEscrowVault();

  // Form states
  const [lockedId, setLockedId] = useState('');
  const [keyId, setKeyId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!lockedId.trim()) {
      newErrors.lockedId = 'Locked object ID is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(lockedId)) {
      newErrors.lockedId = 'Invalid object ID format';
    }
    
    if (!keyId.trim()) {
      newErrors.keyId = 'Key ID is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(keyId)) {
      newErrors.keyId = 'Invalid key ID format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUnlockEscrowVault = async () => {
    if (!account || !validateForm()) return;
    
    try {
      await unlockEscrowVault({
        lockedId,
        keyId
      });
      
      // Reset form on success
      setLockedId('');
      setKeyId('');
      setErrors({});
      
      onSuccess?.();
    } catch (error) {
      console.error('Error unlocking escrow vault:', error);
      setErrors({ submit: 'Failed to unlock escrow vault. Please check your credentials.' });
    }
  };

  // Input change handlers
  const handleLockedIdChange = (e: React.ChangeEvent<HTMLInputElement>) => setLockedId(e.target.value);
  const handleKeyIdChange = (e: React.ChangeEvent<HTMLInputElement>) => setKeyId(e.target.value);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Unlock Escrow Vault
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Locked Object ID
          </label>
          <input 
            type="text" 
            value={lockedId}
            onChange={handleLockedIdChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              errors.lockedId 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
            }`}
            placeholder="0x..."
          />
          {errors.lockedId && <p className="text-red-500 text-sm mt-1">{errors.lockedId}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Key ID
          </label>
          <input 
            type="text" 
            value={keyId}
            onChange={handleKeyIdChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              errors.keyId 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200'
            }`}
            placeholder="0x..."
          />
          {errors.keyId && <p className="text-red-500 text-sm mt-1">{errors.keyId}</p>}
        </div>
        
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}
        
        <Button 
          onClick={handleUnlockEscrowVault}
          disabled={isUnlockingEscrowVault || !account}
          variant="success"
          size="lg"
          fullWidth
          loading={isUnlockingEscrowVault}
          loadingText="Unlocking..."
        >
          Unlock Escrow Vault
        </Button>
      </div>
    </div>
  );
}