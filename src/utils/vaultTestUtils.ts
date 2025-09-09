import { VaultService, CreateVaultParams } from '../services/VaultService';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID } from '../components/providers';

/**
 * Utility functions for testing vault creation functionality
 */

export interface VaultTestResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
  details: {
    packageId: string;
    targetFunction: string;
    argumentCount: number;
    hasValidParams: boolean;
  };
}

/**
 * Test vault creation transaction building
 */
export function testVaultCreation(params: CreateVaultParams): VaultTestResult {
  try {
    console.log('Testing vault creation with params:', params);
    
    // Validate parameters
    const hasValidParams = !!(
      params.key && 
      params.locked && 
      params.ownerExchangeKey && 
      params.ownerAddress
    );
    
    if (!hasValidParams) {
      return {
        success: false,
        error: 'Invalid parameters provided',
        details: {
          packageId: PACKAGE_ID,
          targetFunction: `${PACKAGE_ID}::escrow_vault::create`,
          argumentCount: 0,
          hasValidParams: false
        }
      };
    }
    
    // Create transaction
    const transaction = VaultService.createVault(params);
    
    // Validate transaction structure
    if (!transaction || typeof transaction !== 'object') {
      return {
        success: false,
        error: 'Failed to create transaction object',
        details: {
          packageId: PACKAGE_ID,
          targetFunction: `${PACKAGE_ID}::escrow_vault::create`,
          argumentCount: 4,
          hasValidParams: true
        }
      };
    }
    
    return {
      success: true,
      transaction,
      details: {
        packageId: PACKAGE_ID,
        targetFunction: `${PACKAGE_ID}::escrow_vault::create`,
        argumentCount: 4,
        hasValidParams: true
      }
    };
    
  } catch (error) {
    console.error('Vault creation test failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        packageId: PACKAGE_ID,
        targetFunction: `${PACKAGE_ID}::escrow_vault::create`,
        argumentCount: 4,
        hasValidParams: true
      }
    };
  }
}

/**
 * Generate test vault parameters
 */
export function generateTestVaultParams(walletAddress: string): CreateVaultParams {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return {
    key: `test-vault-${timestamp}-${randomSuffix}`,
    locked: `0x${'a'.repeat(40)}`, // Placeholder object ID
    ownerExchangeKey: `exchange-key-${timestamp}`,
    ownerAddress: walletAddress
  };
}

/**
 * Validate vault creation parameters
 */
export function validateVaultParams(params: CreateVaultParams): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!params.key || params.key.trim().length < 3) {
    errors.push('Vault key must be at least 3 characters');
  }
  
  if (!params.locked || !/^0x[a-fA-F0-9]{40,}$/.test(params.locked)) {
    errors.push('Invalid locked object ID format');
  }
  
  if (!params.ownerExchangeKey || params.ownerExchangeKey.length < 8) {
    errors.push('Owner exchange key must be at least 8 characters');
  }
  
  if (!params.ownerAddress || !/^0x[a-fA-F0-9]{40,}$/.test(params.ownerAddress)) {
    errors.push('Invalid owner address format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}