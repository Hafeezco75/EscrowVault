'use client';

import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useCallback, useEffect, useState } from 'react';
import { VaultService, Vault, CreateVaultParams } from '../services/VaultService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { PACKAGE_ID, OBJECT_ID, CLOCK_ID } from '../components/providers';
import { Transaction } from '@mysten/sui/transactions';

export function useVault() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();
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
            StructType: `${PACKAGE_ID}::escrow_swap::Escrow`
          },
          options: {
            showContent: true,
            showDisplay: true,
            showType: true
          }
        });
        
        // Apply the null safety pattern as requested
        const params = response ? response.data : null;
        if (!params || !Array.isArray(params)) {
          return [];
        }
        
        return params.map(item => {
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
    staleTime: 5000, // Consider data stale after 5 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });

  const createVaultMutation = useMutation({
    mutationFn: async (params: CreateVaultParams) => {
      if (!account) throw new Error('Wallet not connected');
      
      // Validate parameters before creating transaction
      if (!params.key || params.key.trim().length === 0) {
        throw new Error('Vault key is required');
      }
      if (!params.locked || params.locked.trim().length === 0) {
        throw new Error('Locked object ID is required');
      }
      if (!params.ownerExchangeKey || params.ownerExchangeKey.trim().length === 0) {
        throw new Error('Owner exchange key is required');
      }
      if (!params.ownerAddress || params.ownerAddress.trim().length === 0) {
        throw new Error('Owner address is required');
      }
      if (!params.assetObjectId || params.assetObjectId.trim().length === 0) {
        throw new Error('Asset object ID is required');
      }
      
      console.log('Creating vault transaction with validated params:', params);
      
      let tx;
      try {
        tx = VaultService.createVault(params);
      } catch (error) {
        console.error('Failed to create transaction:', error);
        throw new Error(`Transaction creation failed: ${error}`);
      }
      
      // Create a promise that handles the transaction execution and result checking
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
          },
          {
            onSuccess: async (result) => {
              // The result here should contain transaction digest and effects
              console.log('Transaction executed, checking status...', result);
              
              try {
                // Query the transaction result to get detailed effects
                const txResult = await suiClient.getTransactionBlock({
                  digest: result.digest,
                  options: {
                    showEffects: true,
                    showObjectChanges: true,
                  },
                });
                
                console.log('Transaction result:', txResult);
                
                // Check transaction success status
                if (txResult.effects?.status?.status === 'success') {
                  console.log('Vault created successfully!');
                  
                  // Enhanced cache invalidation for dashboard auto-update
                  queryClient.invalidateQueries({ queryKey: ['vaults', account.address] });
                  queryClient.invalidateQueries({ queryKey: ['vaults'] });
                  
                  resolve(txResult);
                } else {
                  console.error('Transaction failed:', txResult.effects?.status);
                  reject(new Error(`Transaction failed: ${txResult.effects?.status?.error || 'Unknown error'}`));
                }
              } catch (error) {
                console.error('Error checking transaction status:', error);
                reject(error);
              }
            },
            onError: (error) => {
              console.error('Transaction execution failed:', error);
              // Provide more specific error messages
              let errorMessage = 'Transaction failed';
              if (error.message.includes('VMVerificationOrDeserializationError')) {
                errorMessage = 'Smart contract validation error. Please check your input parameters.';
              } else if (error.message.includes('InsufficientGas')) {
                errorMessage = 'Insufficient gas. Please ensure you have enough SUI tokens.';
              } else if (error.message.includes('InvalidTransaction')) {
                errorMessage = 'Invalid transaction parameters. Please verify your inputs.';
              }
              reject(new Error(`${errorMessage}: ${error.message}`));
            },
          }
        );
      });
    },
    onSuccess: () => {
      // Enhanced cache invalidation for vault count auto-update
      queryClient.invalidateQueries({ queryKey: ['vaults', account?.address] });
      queryClient.invalidateQueries({ queryKey: ['vaults'] });
      refetchVaults();
    },
  });

  const lockVaultMutation = useMutation({
    mutationFn: async (vaultId: string) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = VaultService.lockVault(vaultId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
          },
          {
            onSuccess: async (result) => {
              try {
                const txResult = await suiClient.getTransactionBlock({
                  digest: result.digest,
                  options: {
                    showEffects: true,
                    showObjectChanges: true,
                  },
                });
                
                if (txResult.effects?.status?.status === 'success') {
                  console.log('Vault locked successfully!');
                  resolve(txResult);
                } else {
                  console.error('Transaction failed:', txResult.effects?.status);
                  reject(new Error(`Transaction failed: ${txResult.effects?.status?.error || 'Unknown error'}`));
                }
              } catch (error) {
                reject(error);
              }
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: () => {
      // Enhanced cache invalidation for vault operations
      queryClient.invalidateQueries({ queryKey: ['vaults', account?.address] });
      refetchVaults();
    },
  });

  const unlockVaultMutation = useMutation({
    mutationFn: async ({ lockedId, keyId }: { lockedId: string, keyId: string }) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = VaultService.unlockVault(lockedId, keyId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
          },
          {
            onSuccess: async (result) => {
              try {
                const txResult = await suiClient.getTransactionBlock({
                  digest: result.digest,
                  options: {
                    showEffects: true,
                    showObjectChanges: true,
                  },
                });
                
                if (txResult.effects?.status?.status === 'success') {
                  console.log('Vault unlocked successfully!');
                  resolve(txResult);
                } else {
                  console.error('Transaction failed:', txResult.effects?.status);
                  reject(new Error(`Transaction failed: ${txResult.effects?.status?.error || 'Unknown error'}`));
                }
              } catch (error) {
                reject(error);
              }
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: () => {
      // Enhanced cache invalidation for vault operations
      queryClient.invalidateQueries({ queryKey: ['vaults', account?.address] });
      refetchVaults();
    },
  });

  const swapAssetsMutation = useMutation({
    mutationFn: async ({ ownerEscrowId, recipientEscrowId }: { ownerEscrowId: string, recipientEscrowId: string }) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = VaultService.swapAssets(ownerEscrowId, recipientEscrowId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
          },
          {
            onSuccess: async (result) => {
              try {
                const txResult = await suiClient.getTransactionBlock({
                  digest: result.digest,
                  options: {
                    showEffects: true,
                    showObjectChanges: true,
                  },
                });
                
                if (txResult.effects?.status?.status === 'success') {
                  console.log('Assets swapped successfully!');
                  resolve(txResult);
                } else {
                  console.error('Transaction failed:', txResult.effects?.status);
                  reject(new Error(`Transaction failed: ${txResult.effects?.status?.error || 'Unknown error'}`));
                }
              } catch (error) {
                reject(error);
              }
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: () => {
      // Enhanced cache invalidation for vault operations
      queryClient.invalidateQueries({ queryKey: ['vaults', account?.address] });
      refetchVaults();
    },
  });

  // Return to Sender Mutation
  const returnToSenderMutation = useMutation({
    mutationFn: async (escrowId: string) => {
      if (!account) throw new Error('Wallet not connected');
      
      const tx = VaultService.returnToSender(escrowId);
      
      return new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
          },
          {
            onSuccess: async (result) => {
              try {
                const txResult = await suiClient.getTransactionBlock({
                  digest: result.digest,
                  options: {
                    showEffects: true,
                    showObjectChanges: true,
                  },
                });
                
                if (txResult.effects?.status?.status === 'success') {
                  console.log('Escrow returned to sender successfully!');
                  resolve(txResult);
                } else {
                  console.error('Transaction failed:', txResult.effects?.status);
                  reject(new Error(`Transaction failed: ${txResult.effects?.status?.error || 'Unknown error'}`));
                }
              } catch (error) {
                reject(error);
              }
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: () => {
      // Enhanced cache invalidation for vault operations
      queryClient.invalidateQueries({ queryKey: ['vaults', account?.address] });
      refetchVaults();
    },
  });

  // Enhanced refresh callback for external components
  const refreshVaults = useCallback(async () => {
    await refetchVaults();
    // Also invalidate cache for immediate updates
    queryClient.invalidateQueries({ queryKey: ['vaults', account?.address] });
  }, [refetchVaults, queryClient, account?.address]);

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
    refreshVaults,
  };
}