import { Transaction } from '@mysten/sui/transactions';
import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { PACKAGE_ID } from '../components/providers';
import { TransactionValidator } from './TransactionValidator';

export interface Vault {
  id: string;
  owner: string;
  assets: string[];
  locked: boolean;
  createdAt: number;
}

export interface CreateVaultParams {
  key: string; // Key object ID
  locked: string; // Locked object ID
  ownerExchangeKey: string; // Owner exchange key ID
  ownerAddress: string; // Owner wallet address
  assetObjectId: string; // Asset object ID to be locked in the vault
  typeArguments?: string[]; // Optional type arguments for generics
  generateKey?: boolean; // Whether to generate a new key automatically
}

export interface CreateKeyParams {
  keyId?: string; // Custom key ID (defaults to the asset object ID)
  typeArguments?: string[]; // Optional type arguments for key creation
}

export interface VaultCreationResult {
  objectId?: string;
  success: boolean;
  error?: string;
}

export class VaultService {
  /**
   * Create a key for vault operations
   * Uses the escrow_swap::create_key function
   * @param keyId - The ID to use for the key creation
   * @param typeArguments - Optional type arguments (defaults to key::ID)
   * @returns Transaction object for key creation
   */
  static createKey(
    keyId: string = '0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c',
    typeArguments?: string[]
  ): Transaction {
    console.log('Creating key with params:', {
      keyId,
      typeArguments,
      packageId: PACKAGE_ID
    });
    
    const tx = new Transaction();
    
    try {
      // Default type arguments for key creation
      const typeArgs = typeArguments || [`${PACKAGE_ID}::key::ID`];
      
      // Create the key ID as a pure value
      const keyIdValue = tx.pure.string(keyId);
      
      // Create the Move call for key creation
      const key = tx.moveCall({
        target: `${PACKAGE_ID}::escrow_swap::create_key`,
        typeArguments: typeArgs,
        arguments: [keyIdValue],
      });
      
      console.log('Key creation transaction created successfully');
      return tx;
      
    } catch (error) {
      console.error('Error creating key transaction:', error);
      throw new Error(`Failed to create key transaction: ${error}`);
    }
  }

  /**
   * Create a new vault with the smart contract interface
   * Uses the new vault::create_vault function with type arguments
   * Parameters: Key<T>, Locked<T>, owner_exchange_key (ID), owner_address
   * Returns the transaction for signing
   */
  static createVault(params: CreateVaultParams): Transaction {
    console.log('Creating vault with params:', {
      key: params.key,
      locked: params.locked,
      ownerExchangeKey: params.ownerExchangeKey,
      ownerAddress: params.ownerAddress,
      assetObjectId: params.assetObjectId,
      typeArguments: params.typeArguments,
      generateKey: params.generateKey,
      packageId: PACKAGE_ID
    });
    
    const tx = new Transaction();
    
    try {
      // Set the sender for the transaction
      tx.setSender(normalizeSuiAddress(params.ownerAddress));
      
      // Default type arguments if not provided
      const typeArgs = params.typeArguments || ['0x2::sui::SUI']; // Default to SUI coin type
      
      let keyArgument;
      
      // Check if we need to generate a key or use existing one
      if (params.generateKey) {
        // Generate a new key using the create_key function
        console.log('Generating new key for vault...');
        const keyIdValue = tx.pure.string(params.assetObjectId); // Use asset object ID as key ID
        
        keyArgument = tx.moveCall({
          target: `${PACKAGE_ID}::escrow_swap::create_key`,
          typeArguments: [`${PACKAGE_ID}::key::ID`],
          arguments: [keyIdValue],
        });
      } else {
        // Use the provided key object ID
        keyArgument = tx.object(params.key);
      }
      
      // Create the Move call for vault creation using the new interface
      tx.moveCall({
        target: `${PACKAGE_ID}::escrow_swap::create_vault`,
        typeArguments: typeArgs,
        arguments: [
          keyArgument,                              // Key<T> object (generated or provided)
          tx.object(params.locked),                 // Locked<T> object
          tx.pure.string(params.ownerExchangeKey),  // Owner exchange key as ID
          tx.pure.address(normalizeSuiAddress(params.ownerAddress)), // Owner address
          tx.object(params.assetObjectId)           // Asset object ID to be locked
        ],
      });
      
      // Set a reasonable gas budget
      tx.setGasBudget(10000000); // 0.01 SUI
      
      console.log('Transaction created successfully with new interface');
      return tx;
      
    } catch (error) {
      console.error('Error creating vault transaction:', error);
      throw new Error(`Failed to create vault transaction: ${error}`);
    }
  }

  /**
   * Lock/Unlock vault is handled by the escrow contract automatically
   * These methods are kept for backward compatibility
   */
  static lockVault(vaultId: string): Transaction {
    const tx = new Transaction();
    
    // In the new contract, vaults are locked when created
    // This is a placeholder for backward compatibility
    tx.moveCall({
      target: `${PACKAGE_ID}::escrow_swap::create`,
      arguments: [tx.object(vaultId)],
    });

    return tx;
  }

  /**
   * Unlock vault using the new escrow contract unlock function
   */
  static unlockVault(lockedId: string, keyId: string): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::escrow_swap::unlock`,
      arguments: [
        tx.object(lockedId),
        tx.object(keyId)
      ],
    });

    return tx;
  }

  /**
   * Swap assets using the new escrow contract swap function
   */
  static swapAssets(ownerEscrowId: string, recipientEscrowId: string): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::escrow_swap::swap`,
      arguments: [
        tx.object(ownerEscrowId),
        tx.object(recipientEscrowId)
      ],
    });

    return tx;
  }

  /**
   * Return escrow to sender
   */
  static returnToSender(escrowId: string): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::escrow_swap::return_to_sender`,
      arguments: [tx.object(escrowId)],
    });

    return tx;
  }
}