'use client';

import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useCallback, useEffect, useState } from 'react';
import { VaultService, Vault, CreateVaultParams } from '../services/VaultService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { PACKAGE_ID, OBJECT_ID, CLOCK_ID } from '../components/providers';
import { Transaction } from '@mysten/sui/transactions';

export function useVault() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const { data: vaults = [], refetch: refetchVaults } = useQuery({
    queryKey: ['vaults', account?.address],
    queryFn: async () => {
      if (!account?.address) return [];
      
      try {
        // Fetch actual vault objects from the blockchain
        // Query for Escrow objects created by this address
        console.log('Fetching vaults for address:', account.address);
        
        // Note: This assumes the smart contract creates Escrow objects
        // The exact type should match your smart contract structure
        const response = await suiClient.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${PACKAGE_ID}::escrow_vault::Escrow`
          },
          options: {
            showContent: true,
            showDisplay: true,
            showType: true
          }
        });
        
        return response.data.map(item => {
          const content = item.data?.content as any;
          const fields = content?.dataType === 'moveObject' ? content?.fields : {};
          return {
            id: item.data?.objectId || '',
            owner: account.address,
            assets: fields?.object_escrowed ? [fields.object_escrowed] : [],
            locked: true, // Escrow vaults are locked by default
            createdAt: Date.now()
          } as Vault;
        });
      } catch (error) {
        console.error('Error fetching vaults:', error);
        return [];
      }
    },
    enabled: !!account?.address,
  });

  const createVaultMutation = useMutation({
    mutationFn: async (params: CreateVaultParams) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = VaultService.createVault(params);
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  const lockVaultMutation = useMutation({
    mutationFn: async (vaultId: string) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = VaultService.lockVault(vaultId);
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  const unlockVaultMutation = useMutation({
    mutationFn: async ({ lockedId, keyId }: { lockedId: string, keyId: string }) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = VaultService.unlockVault(lockedId, keyId);
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  const swapAssetsMutation = useMutation({
    mutationFn: async ({ ownerEscrowId, recipientEscrowId }: { ownerEscrowId: string, recipientEscrowId: string }) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = VaultService.swapAssets(ownerEscrowId, recipientEscrowId);
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  // Return to Sender Mutation
  const returnToSenderMutation = useMutation({
    mutationFn: async (escrowId: string) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = VaultService.returnToSender(escrowId);
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  return {
    vaults,
    isConnected: !!account,
    createVault: createVaultMutation.mutate,
    createVaultAsync: createVaultMutation.mutateAsync,
    isCreatingVault: createVaultMutation.isPending,
    lockVault: lockVaultMutation.mutate,
    isLockingVault: lockVaultMutation.isPending,
    unlockVault: unlockVaultMutation.mutate,
    isUnlockingVault: unlockVaultMutation.isPending,
    swapAssets: swapAssetsMutation.mutate,
    isSwappingAssets: swapAssetsMutation.isPending,
    returnToSender: returnToSenderMutation.mutate,
    isReturningToSender: returnToSenderMutation.isPending,
    refetchVaults,
  };
}