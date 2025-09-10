# VMVerificationOrDeserializationError Fix Guide

## 🚨 Problem Description
The error "VMVerificationOrDeserializationError in command 0 (code: -1)" occurs when trying to create a vault through the wallet. This typically indicates issues with smart contract transaction construction or parameter validation.

## ✅ Fixes Applied

### 1. **Updated Package ID**
- Changed from: `0x5d0dc8c2b1782c52ee425759790ac27a89cbf3207b4aef5acfcce70fc45362c4`
- Changed to: `0x491e3252f4524253a7c0d06d326b1ce51e7a8b4136b03211988ad631e11d8d6b`
- **Location**: `src/components/providers.tsx`

### 2. **Enhanced Transaction Construction**
- Added proper transaction sender setting
- Improved parameter handling for locked object ID (placeholder vs actual object)
- Added gas budget setting (0.01 SUI)
- Enhanced error handling and validation
- **Location**: `src/services/VaultService.ts`

### 3. **Pre-flight Transaction Validation**
- Created `TransactionValidator.ts` for parameter validation
- Added comprehensive validation for all input parameters
- Validates address formats, key lengths, and object ID formats
- **Location**: `src/services/TransactionValidator.ts`

### 4. **Debug Utilities**
- Created `VaultDebugger.ts` for testing transactions before submission
- Added debug button in development mode
- Enhanced logging for transaction troubleshooting
- **Location**: `src/utils/VaultDebugger.ts`

### 5. **Enhanced Error Handling**
- Added specific error messages for VMVerificationError
- Better error categorization (gas, validation, contract errors)
- Improved user feedback in the form
- **Location**: `src/hooks/useVault.ts`

## 🔧 How to Test the Fix

### Method 1: Use the Debug Button (Development Mode)
1. Open the Create Vault form
2. Fill in the required fields
3. Click "🔍 Debug Test Transaction" button
4. Check the browser console for detailed validation results

### Method 2: Manual Console Testing
Open browser developer console and run:
```javascript
// Test with your connected wallet address
VaultDebugger.quickTest('YOUR_WALLET_ADDRESS_HERE');

// Or test with specific parameters
VaultDebugger.testVaultCreation(
  'my-test-vault',
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  'my-secure-key-12345',
  'YOUR_WALLET_ADDRESS_HERE'
);
```

### Method 3: Regular Form Submission
1. Connect your wallet
2. Fill in the form fields:
   - **Vault Key**: Any string (min 3 characters)
   - **Locked Object ID**: Use placeholder or actual Sui object ID
   - **Owner Exchange Key**: Secure string (min 8 characters)
   - **Owner Address**: Auto-filled from wallet
3. Click "Create Vault"

## 🔍 Common Causes and Solutions

### Issue 1: Invalid Package ID
**Symptoms**: Transaction fails immediately
**Solution**: Ensure PACKAGE_ID in `providers.tsx` matches your deployed contract

### Issue 2: Invalid Object Reference
**Symptoms**: VMVerificationError with object-related message
**Solution**: 
- Use `0x0000000000000000000000000000000000000000000000000000000000000000` as placeholder
- Ensure actual object IDs are valid and exist on the blockchain

### Issue 3: Address Format Issues
**Symptoms**: Address normalization errors
**Solution**: The form now auto-validates and normalizes addresses

### Issue 4: Insufficient Gas
**Symptoms**: Gas-related error messages
**Solution**: Ensure you have at least 0.02 SUI in your wallet for gas fees

### Issue 5: Smart Contract Function Signature Mismatch
**Symptoms**: Function not found or parameter type errors
**Solution**: Verify the smart contract has the `create` function with expected parameters

## 📋 Validation Checklist

Before submitting a transaction, the system now validates:
- ✅ Wallet is connected and address is valid
- ✅ Vault key is at least 3 characters
- ✅ Locked object ID is properly formatted
- ✅ Owner exchange key is at least 8 characters
- ✅ Owner address is properly formatted
- ✅ Package ID is configured correctly
- ✅ Transaction structure is valid

## 🚀 Enhanced Features

### Pre-flight Testing
Every transaction is now tested before submission to catch errors early.

### Better Error Messages
Users now receive specific, actionable error messages instead of generic failures.

### Debug Tools
Development mode includes debug utilities for troubleshooting transaction issues.

### Automatic Validation
Form validates inputs in real-time and prevents invalid transactions.

## 📝 Next Steps

1. **Test the Fix**: Try creating a vault with the updated form
2. **Check Console**: Monitor browser console for detailed transaction info
3. **Verify Package ID**: Ensure the package ID matches your deployed contract
4. **Update Contract**: If needed, redeploy the smart contract with correct function signatures

## 🆘 If Issues Persist

1. **Check Network**: Ensure you're connected to the correct Sui network (testnet/mainnet)
2. **Verify Contract**: Confirm the smart contract is deployed and accessible
3. **Check Balance**: Ensure sufficient SUI balance for gas fees
4. **Review Logs**: Check browser console for detailed error information
5. **Use Debug Tools**: Utilize the VaultDebugger for detailed transaction analysis

The fixes should resolve the VMVerificationOrDeserializationError and provide a much better user experience with clear error messages and validation feedback.