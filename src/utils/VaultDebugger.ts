import { VaultService } from '../services/VaultService';
import { TransactionValidator } from '../services/TransactionValidator';

/**
 * Debug utility for testing vault creation transactions
 * Use this in the browser console to debug transaction issues
 */
export class VaultDebugger {
  /**
   * Test vault creation parameters without submitting transaction
   */
  static testVaultCreation(
    key: string,
    locked: string,
    ownerExchangeKey: string,
    ownerAddress: string,
    assetObjectId?: string,
    generateKey?: boolean
  ) {
    console.group('🔍 Vault Creation Debug Test');
    
    // Step 1: Validate parameters
    console.log('📝 Step 1: Validating parameters...');
    const validation = TransactionValidator.validateCreateVaultTransaction(
      key,
      locked,
      ownerExchangeKey,
      ownerAddress,
      assetObjectId
    );
    
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      console.groupEnd();
      return { success: false, errors: validation.errors };
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Warnings:', validation.warnings);
    }
    
    // Step 2: Test transaction creation
    console.log('🏗️ Step 2: Testing transaction creation...');
    try {
      const tx = VaultService.createVault({
        key,
        locked,
        ownerExchangeKey,
        ownerAddress,
        assetObjectId: assetObjectId || '0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c',
        generateKey: generateKey || false
      });
      
      console.log('✅ Transaction created successfully');
      console.log('Transaction object:', tx);
      
      // Step 3: Debug transaction structure
      console.log('🔬 Step 3: Analyzing transaction structure...');
      TransactionValidator.debugTransaction(tx).then(debugInfo => {
        console.log('Transaction debug info:');
        debugInfo.forEach(info => console.log('  -', info));
      });
      
      console.groupEnd();
      return { success: true, transaction: tx };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Transaction creation failed:', errorMessage);
      console.groupEnd();
      return { success: false, error: errorMessage };
    }
  }
  
  /**
   * Quick test with default values - NOTE: These need to be actual object IDs
   */
  static quickTest(ownerAddress: string) {
    // Note: In production, these should be actual object IDs from your wallet
    const sampleKeyObjectId = '0x0000000000000000000000000000000000000000000000000000000000000001';
    const sampleLockedObjectId = '0x0000000000000000000000000000000000000000000000000000000000000002';
    
    console.warn('⚠️ Using sample object IDs - replace with actual object IDs from your wallet');
    
    return this.testVaultCreation(
      sampleKeyObjectId,
      sampleLockedObjectId,
      'test-exchange-key-12345',
      ownerAddress,
      '0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c'
    );
  }
  
  /**
   * Test with actual object IDs
   */
  static testWithObjectIds(
    keyObjectId: string,
    lockedObjectId: string,
    ownerAddress: string,
    assetObjectId?: string
  ) {
    return this.testVaultCreation(
      keyObjectId,
      lockedObjectId,
      'test-exchange-key-12345',
      ownerAddress,
      assetObjectId
    );
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).VaultDebugger = VaultDebugger;
}