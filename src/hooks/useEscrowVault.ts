'use client';

import { useSuiClient, useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { 
  EscrowVaultService, 
  EscrowVault,
  CreateEscrowParams,
  UnlockEscrowParams,
  SwapEscrowParams,
  ReturnToSenderParams
} from '../services/EscrowVaultService';

export function useEscrowVault() {
  const account = useCurrentAccount();
  const queryClient = useQueryClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // Query to get user's escrow vaults
  const { data: escrowVaults = [], refetch: refetchEscrowVaults } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address!,
      filter: {
        StructType: '0x491e3252f4524253a7c0d06d326b1ce51e7a8b4136b03211988ad631e11d8d6b::escrow_vault::Escrow'
      },
      options: {
        showContent: true,
        showDisplay: true
      }
    },
    {
      enabled: !!account?.address,
      select: (data) => {
        return data.data.map(item => {
          const content = item.data?.content as any;
          const fields = content?.dataType === 'moveObject' ? content?.fields : {};
          return {
            id: item.data?.objectId || '',
            sender: fields?.sender || '',
            recipient: fields?.recipient || '',
            recipientExchangeKey: fields?.recipient_exchange_key || '',
            escrowedKey: fields?.escrowed_key || '',
            objectEscrowed: fields?.object_escrowed || null,
            locked: true,
            createdAt: Date.now()
          } as EscrowVault;
        });
      }
    }
  );

  // Create escrow vault mutation
  const createEscrowVaultMutation = useMutation({
    mutationFn: async (params: CreateEscrowParams) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = EscrowVaultService.createEscrowVault(params);
      
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getOwnedObjects'] });
      refetchEscrowVaults();
    },
    onError: (error) => {
      console.error('Failed to create escrow vault:', error);
    }
  });

  // Unlock escrow vault mutation
  const unlockEscrowVaultMutation = useMutation({
    mutationFn: async (params: UnlockEscrowParams) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = EscrowVaultService.unlockEscrowVault(params);
      
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getOwnedObjects'] });
      refetchEscrowVaults();
    },
    onError: (error) => {
      console.error('Failed to unlock escrow vault:', error);
    }
  });

  // Swap escrow vaults mutation
  const swapEscrowVaultsMutation = useMutation({
    mutationFn: async (params: SwapEscrowParams) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = EscrowVaultService.swapEscrowVaults(params);
      
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getOwnedObjects'] });
      refetchEscrowVaults();
    },
    onError: (error) => {
      console.error('Failed to swap escrow vaults:', error);
    }
  });

  // Return escrow to sender mutation
  const returnEscrowToSenderMutation = useMutation({
    mutationFn: async (params: ReturnToSenderParams) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = EscrowVaultService.returnEscrowToSender(params);
      
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getOwnedObjects'] });
      refetchEscrowVaults();
    },
    onError: (error) => {
      console.error('Failed to return escrow to sender:', error);
    }
  });

  const refreshEscrowVaults = useCallback(async () => {
    await refetchEscrowVaults();
  }, [refetchEscrowVaults]);

  return {
    // Data
    escrowVaults,
    isConnected: !!account,
    
    // Create escrow vault
    createEscrowVault: createEscrowVaultMutation.mutate,
    createEscrowVaultAsync: createEscrowVaultMutation.mutateAsync,
    isCreatingEscrowVault: createEscrowVaultMutation.isPending,
    createEscrowVaultError: createEscrowVaultMutation.error,
    
    // Unlock escrow vault
    unlockEscrowVault: unlockEscrowVaultMutation.mutate,
    unlockEscrowVaultAsync: unlockEscrowVaultMutation.mutateAsync,
    isUnlockingEscrowVault: unlockEscrowVaultMutation.isPending,
    unlockEscrowVaultError: unlockEscrowVaultMutation.error,
    
    // Swap escrow vaults
    swapEscrowVaults: swapEscrowVaultsMutation.mutate,
    swapEscrowVaultsAsync: swapEscrowVaultsMutation.mutateAsync,
    isSwappingEscrowVaults: swapEscrowVaultsMutation.isPending,
    swapEscrowVaultsError: swapEscrowVaultsMutation.error,
    
    // Return escrow to sender
    returnEscrowToSender: returnEscrowToSenderMutation.mutate,
    returnEscrowToSenderAsync: returnEscrowToSenderMutation.mutateAsync,
    isReturningEscrowToSender: returnEscrowToSenderMutation.isPending,
    returnEscrowToSenderError: returnEscrowToSenderMutation.error,
    
    // Utility functions
    refreshEscrowVaults,
    refetchEscrowVaults,
  };
}