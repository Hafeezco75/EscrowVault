'use client';

import { useState } from 'react';
import { useEscrowVault } from '../../hooks/useEscrowVault';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Button from '../common/Button';

interface SellerEscrowFormProps {
  onSuccess?: () => void;
}

export default function SellerEscrowForm({ onSuccess }: SellerEscrowFormProps) {
  const account = useCurrentAccount();
  const { 
    createEscrowVault, 
    isCreatingEscrowVault
  } = useEscrowVault();

  // Consolidated form state using single useState with spread operator
  const [formState, setFormState] = useState({
    itemKey: '',
    itemLocked: '',
    buyerAddress: '',
    buyerExchangeKey: '',
    price: '',
    errors: {} as Record<string, string>
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.itemKey.trim()) {
      newErrors.itemKey = 'Item key is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(formState.itemKey)) {
      newErrors.itemKey = 'Invalid item key format';
    }
    
    if (!formState.itemLocked.trim()) {
      newErrors.itemLocked = 'Locked item ID is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(formState.itemLocked)) {
      newErrors.itemLocked = 'Invalid locked item ID format';
    }
    
    if (!formState.buyerAddress.trim()) {
      newErrors.buyerAddress = 'Buyer address is required';
    } else if (!/^0x[a-fA-F0-9]+$/.test(formState.buyerAddress)) {
      newErrors.buyerAddress = 'Invalid buyer address format';
    }
    
    if (!formState.buyerExchangeKey.trim()) {
      newErrors.buyerExchangeKey = 'Buyer exchange key is required';
    }
    
    if (!formState.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formState.price)) || Number(formState.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    setFormState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSellerEscrow = async () => {
    if (!account || !validateForm()) return;
    
    try {
      await createEscrowVault({
        key: formState.itemKey,
        locked: formState.itemLocked,
        recipientExchangeKey: formState.buyerExchangeKey,
        recipient: formState.buyerAddress,
        verifier: account?.address || '' // Seller is the verifier
      });
      
      // Reset form on success
      setFormState(prev => ({
        ...prev,
        itemKey: '',
        itemLocked: '',
        buyerAddress: '',
        buyerExchangeKey: '',
        price: '',
        errors: {}
      }));
      
      onSuccess?.();
    } catch (error) {
      console.error('Error creating seller escrow:', error);
      setFormState(prev => ({ ...prev, errors: { submit: 'Failed to create seller escrow. Please try again.' } }));
    }
  };

  // Input change handlers
  const handleItemKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, itemKey: e.target.value }));
  const handleItemLockedChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, itemLocked: e.target.value }));
  const handleBuyerAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, buyerAddress: e.target.value }));
  const handleBuyerExchangeKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, buyerExchangeKey: e.target.value }));
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => 
    setFormState(prev => ({ ...prev, price: e.target.value }));

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Create Seller Escrow
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Item Key
          </label>
          <input 
            type="text" 
            value={formState.itemKey}
            onChange={handleItemKeyChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              formState.errors.itemKey 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="0x... (Key for the item being sold)"
          />
          {formState.errors.itemKey && <p className="text-red-500 text-sm mt-1">{formState.errors.itemKey}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Item to Sell (Locked Asset ID)
          </label>
          <input 
            type="text" 
            value={formState.itemLocked}
            onChange={handleItemLockedChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              formState.errors.itemLocked 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="0x... (Asset/NFT to be sold)"
          />
          {formState.errors.itemLocked && <p className="text-red-500 text-sm mt-1">{formState.errors.itemLocked}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Buyer Address
          </label>
          <input 
            type="text" 
            value={formState.buyerAddress}
            onChange={handleBuyerAddressChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              formState.errors.buyerAddress 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="0x... (Buyer's wallet address)"
          />
          {formState.errors.buyerAddress && <p className="text-red-500 text-sm mt-1">{formState.errors.buyerAddress}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Buyer Exchange Key
          </label>
          <input 
            type="text" 
            value={formState.buyerExchangeKey}
            onChange={handleBuyerExchangeKeyChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              formState.errors.buyerExchangeKey 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="Enter buyer's exchange key"
          />
          {formState.errors.buyerExchangeKey && (
            <p className="text-red-500 text-sm mt-1">{formState.errors.buyerExchangeKey}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Expected Price (SUI)
          </label>
          <input 
            type="number" 
            step="0.01"
            value={formState.price}
            onChange={handlePriceChange}
            className={`w-full p-3 border rounded-lg transition-colors bg-white text-gray-900 ${
              formState.errors.price 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="0.00"
          />
          {formState.errors.price && <p className="text-red-500 text-sm mt-1">{formState.errors.price}</p>}
        </div>
        
        {formState.errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {formState.errors.submit}
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">Seller Information</h3>
          <p className="text-sm text-blue-700">
            <strong>Your Role:</strong> Seller (Item Provider)<br/>
            <strong>Your Address:</strong> {account?.address?.substring(0, 20)}...<br/>
            <strong>Note:</strong> You are creating an escrow to sell your item to the specified buyer.
          </p>
        </div>
        
        <Button 
          onClick={handleCreateSellerEscrow}
          disabled={isCreatingEscrowVault || !account}
          variant="primary"
          size="lg"
          fullWidth
          loading={isCreatingEscrowVault}
          loadingText="Creating Seller Escrow..."
        >
          Create Seller Escrow
        </Button>
      </div>
    </div>
  );
}