import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { PACKAGE_ID } from '../components/providers';

export interface Vault {
  id: string;
  owner: string;
  assets: string[];
  locked: boolean;
  createdAt: number;
}

export interface CreateVaultParams {
  key: string;
  locked: string; // This represents the locked object ID
  ownerExchangeKey: string;
  ownerAddress: string;
}

export interface VaultCreationResult {
  objectId?: string;
  success: boolean;
  error?: string;
}

export class VaultService {
  /**
   * Create a new vault with the smart contract interface
   * Parameters: key, locked, owner_exchange_key, owner_address
   * Returns the transaction for signing
   */
  static createVault(params: CreateVaultParams): Transaction {
    const tx = new Transaction();
    
    console.log('Creating vault with params:', {
      key: params.key,
      locked: params.locked,
      ownerExchangeKey: params.ownerExchangeKey,
      ownerAddress: params.ownerAddress,
      packageId: PACKAGE_ID
    });
    
    try {
      // Create the Move call for the escrow vault creation
      tx.moveCall({
        target: `${PACKAGE_ID}::escrow_vault::create`,
        arguments: [
          tx.pure.string(params.key),
          tx.pure.string(params.locked),
          tx.pure.string(params.ownerExchangeKey),
          tx.pure.address(normalizeSuiAddress(params.ownerAddress))
        ],
      });
      
      console.log('Transaction created successfully');
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
      target: `${PACKAGE_ID}::escrow_vault::create`,
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
      target: `${PACKAGE_ID}::escrow_vault::unlock`,
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
      target: `${PACKAGE_ID}::escrow_vault::swap`,
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
      target: `${PACKAGE_ID}::escrow_vault::return_to_sender`,
      arguments: [tx.object(escrowId)],
    });

    return tx;
  }
}