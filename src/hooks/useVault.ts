'use client';

import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { useCallback, useEffect, useState } from 'react';
import { VaultService, Vault } from '../services/VaultService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { PACKAGE_ID, OBJECT_ID, CLOCK_ID } from '../components/providers';
import { TransactionBlock } from '@mysten/sui.js/transactions';

export function useVault() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const [vaultService] = useState(() => new VaultService(client));

  const { data: vaults = [], refetch: refetchVaults } = useQuery({
    queryKey: ['vaults', account?.address],
    queryFn: async () => {
      if (!account?.address) return [];
      return vaultService.getUserVaults(account.address);
    },
    enabled: !!account?.address,
  });

  const createVaultMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = await vaultService.createVault();
      const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        account,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
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
      
      const tx = await vaultService.lockVault(vaultId);
      const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        account,
        options: {
          showEffects: true,
        },
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  const unlockVaultMutation = useMutation({
    mutationFn: async (vaultId: string) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = await vaultService.unlockVault(vaultId);
      const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        account,
        options: {
          showEffects: true,
        },
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  const swapAssetsMutation = useMutation({
    mutationFn: async ({ vaultId, assetId, targetAssetType }: { vaultId: string, assetId: string, targetAssetType: string }) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = await vaultService.swapAssets(vaultId, assetId, targetAssetType);
      const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        account,
        options: {
          showEffects: true,
        },
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  // Create Escrow Mutation
  const createEscrowMutation = useMutation({
    mutationFn: async ({ key, recipientExchangeKey, recipient }: { key: string, recipientExchangeKey: string, recipient: string }) => {
      if (!account) throw new Error('Wallet not connected');
      
      // Add implementation for creating an escrow vault
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::vault::create_escrow`,
        arguments: [
          tx.object(OBJECT_ID),
          tx.pure(key),
          tx.pure(recipientExchangeKey),
          tx.pure(normalizeSuiAddress(recipient)),
          tx.pure(key),
          tx.object(CLOCK_ID)
        ],
      });
      
      const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        account,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  // Unlock Escrow Mutation
  const unlockEscrowMutation = useMutation({
    mutationFn: async ({ tableId, objectId }: { tableId: string, objectId: string }) => {
      if (!account) throw new Error('Wallet not connected');
      
      // Add implementation for unlocking an escrow vault
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::vault::unlock_escrow`,
        arguments: [
          tx.object(tableId),
          tx.object(objectId),
          tx.object(CLOCK_ID)
        ],
      });
      
      const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        account,
        options: {
          showEffects: true,
        },
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  // Swap Escrow Mutation
  const swapEscrowMutation = useMutation({
    mutationFn: async ({ ownerEscrowId, recipientEscrowId }: { ownerEscrowId: string, recipientEscrowId: string }) => {
      if (!account) throw new Error('Wallet not connected');
      
      // Add implementation for swapping escrow vaults
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::vault::swap_escrow`,
        arguments: [
          tx.object(ownerEscrowId),
          tx.object(recipientEscrowId)
        ],
      });
      
      const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        account,
        options: {
          showEffects: true,
        },
      });
      
      return result;
    },
    onSuccess: () => {
      refetchVaults();
    },
  });

  // Return to Sender Mutation
  const returnToSenderMutation = useMutation({
    mutationFn: async ({ escrowId, tableId, lockedKey }: { escrowId: string, tableId: string, lockedKey: string }) => {
      if (!account) throw new Error('Wallet not connected');
      
      // Add implementation for returning escrow to sender
      const tx = new TransactionBlock();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::vault::return_to_sender`,
        arguments: [
          tx.object(escrowId),
          tx.object(tableId),
          tx.pure(lockedKey)
        ],
      });
      
      const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        account,
        options: {
          showEffects: true,
        },
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
    isCreatingVault: createVaultMutation.isPending,
    lockVault: lockVaultMutation.mutate,
    isLockingVault: lockVaultMutation.isPending,
    unlockVault: unlockVaultMutation.mutate,
    isUnlockingVault: unlockVaultMutation.isPending,
    swapAssets: swapAssetsMutation.mutate,
    isSwappingAssets: swapAssetsMutation.isPending,
    // New escrow functions
    createEscrow: createEscrowMutation.mutate,
    isCreatingEscrow: createEscrowMutation.isPending,
    unlockEscrow: unlockEscrowMutation.mutate,
    isUnlockingEscrow: unlockEscrowMutation.isPending,
    swapEscrow: swapEscrowMutation.mutate,
    isSwappingEscrow: swapEscrowMutation.isPending,
    returnToSender: returnToSenderMutation.mutate,
    isReturningToSender: returnToSenderMutation.isPending,
    refetchVaults,
  };
}