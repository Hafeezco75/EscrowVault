import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { PACKAGE_ID } from '../components/providers';

export interface TransactionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class TransactionValidator {
  /**
   * Validate a vault creation transaction before execution
   */
  static validateCreateVaultTransaction(
    key: string,
    locked: string,
    ownerExchangeKey: string,
    ownerAddress: string,
    assetObjectId?: string
  ): TransactionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate key object ID
    if (!key || key.trim().length === 0) {
      errors.push('Key object ID cannot be empty');
    } else if (!/^0x[a-fA-F0-9]{40,}$/.test(key)) {
      errors.push('Invalid key object ID format (must be 0x followed by hex characters)');
    }

    // Validate locked object ID
    if (!locked || locked.trim().length === 0) {
      errors.push('Locked object ID cannot be empty');
    } else if (!/^0x[a-fA-F0-9]{40,}$/.test(locked)) {
      errors.push('Invalid locked object ID format (must be 0x followed by hex characters)');
    }

    // Validate asset object ID if provided
    if (assetObjectId) {
      if (!/^0x[a-fA-F0-9]{40,}$/.test(assetObjectId)) {
        errors.push('Invalid asset object ID format (must be 0x followed by hex characters)');
      }
    }

    // Validate owner exchange key
    if (!ownerExchangeKey || ownerExchangeKey.trim().length === 0) {
      errors.push('Owner exchange key cannot be empty');
    } else if (ownerExchangeKey.length < 8) {
      errors.push('Owner exchange key must be at least 8 characters long');
    }

    // Validate owner address
    if (!ownerAddress || ownerAddress.trim().length === 0) {
      errors.push('Owner address cannot be empty');
    } else {
      try {
        const normalized = normalizeSuiAddress(ownerAddress);
        if (!normalized || !/^0x[a-fA-F0-9]{64}$/.test(normalized)) {
          errors.push('Invalid owner address format');
        }
      } catch (error) {
        errors.push(`Owner address normalization failed: ${error}`);
      }
    }

    // Validate package ID
    if (!PACKAGE_ID || !/^0x[a-fA-F0-9]{64}$/.test(PACKAGE_ID)) {
      errors.push('Invalid package ID configuration');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create a test transaction to validate parameters
   */
  static createTestTransaction(
    key: string,
    locked: string,
    ownerExchangeKey: string,
    ownerAddress: string,
    typeArguments?: string[],
    assetObjectId?: string
  ): { transaction: Transaction | null; error: string | null } {
    try {
      const tx = new Transaction();
      
      // Set sender
      tx.setSender(normalizeSuiAddress(ownerAddress));
      
      // Default type arguments if not provided
      const typeArgs = typeArguments || ['0x2::sui::SUI'];
      
      // Create the move call with new interface
      tx.moveCall({
        target: `${PACKAGE_ID}::escrow_swap::create_vault`,
        typeArguments: typeArgs,
        arguments: [
          tx.object(key),                           // Key<T> object
          tx.object(locked),                        // Locked<T> object
          tx.pure.string(ownerExchangeKey),         // Owner exchange key as ID
          tx.pure.address(normalizeSuiAddress(ownerAddress)), // Owner address
          tx.object(assetObjectId || '0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c') // Asset object ID
        ],
      });
      
      // Set gas budget
      tx.setGasBudget(10000000);
      
      return { transaction: tx, error: null };
    } catch (error) {
      return { transaction: null, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Debug transaction serialization
   */
  static async debugTransaction(tx: Transaction): Promise<string[]> {
    const debugInfo: string[] = [];
    
    try {
      const txData = tx.getData();
      debugInfo.push(`Transaction data available: ${!!txData}`);
      debugInfo.push(`Gas budget: ${txData.gasData?.budget || 'Not set'}`);
      debugInfo.push(`Sender: ${txData.sender || 'Not set'}`);
      
      const commands = txData.commands;
      debugInfo.push(`Number of commands: ${commands?.length || 0}`);
      
      if (commands && commands.length > 0) {
        commands.forEach((cmd, index) => {
          debugInfo.push(`Command ${index}: ${JSON.stringify(cmd, null, 2)}`);
        });
      }
    } catch (error) {
      debugInfo.push(`Error debugging transaction: ${error}`);
    }
    
    return debugInfo;
  }
}