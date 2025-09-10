import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useVault } from '../hooks/useVault';
import { VaultService } from '../services/VaultService';

// Mock the dependencies
vi.mock('@mysten/dapp-kit');
vi.mock('../services/VaultService');

const mockVaultService = vi.mocked(VaultService);

describe('useVault Integration Test', () => {
  let queryClient: QueryClient;

  const mockAccount = {
    address: '0x1234567890abcdef1234567890abcdef12345678',
  };

  const mockSuiClient = {
    getOwnedObjects: vi.fn(),
    getTransactionBlock: vi.fn(),
  };

  const mockSignAndExecuteTransaction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock the dapp-kit hooks
    vi.doMock('@mysten/dapp-kit', () => ({
      useCurrentAccount: () => mockAccount,
      useSuiClient: () => mockSuiClient,
      useSignAndExecuteTransaction: () => ({ mutate: mockSignAndExecuteTransaction }),
    }));
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should successfully create a vault with ownerAddress', async () => {
    // Mock successful transaction
    const mockTransaction = { kind: 'ProgrammableTransaction' };
    const mockDigest = 'transaction-digest-123';
    const mockTxResult = {
      effects: {
        status: { status: 'success' },
        created: [
          {
            reference: {
              objectId: 'vault-object-id-123',
              type: '0x123::escrow_vault::Escrow'
            }
          }
        ]
      }
    };

    mockVaultService.createVault.mockReturnValue(mockTransaction);
    mockSignAndExecuteTransaction.mockImplementation((params, callbacks) => {
      setTimeout(() => {
        callbacks.onSuccess({ digest: mockDigest });
      }, 0);
    });
    mockSuiClient.getTransactionBlock.mockResolvedValue(mockTxResult);

    const { result } = renderHook(() => useVault(), { wrapper });

    expect(result.current.isConnected).toBe(true);

    // Test vault creation with proper parameters
    await result.current.createVaultAsync({
      key: 'test-vault-key',
      locked: '0xabcdef1234567890abcdef1234567890abcdef12',
      ownerExchangeKey: 'secure-exchange-key',
      ownerAddress: mockAccount.address
    });

    await waitFor(() => {
      expect(mockVaultService.createVault).toHaveBeenCalledWith({
        key: 'test-vault-key',
        locked: '0xabcdef1234567890abcdef1234567890abcdef12',
        ownerExchangeKey: 'secure-exchange-key',
        ownerAddress: mockAccount.address
      });
    });

    expect(mockSignAndExecuteTransaction).toHaveBeenCalledWith(
      { transaction: mockTransaction },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function)
      })
    );

    expect(mockSuiClient.getTransactionBlock).toHaveBeenCalledWith({
      digest: mockDigest,
      options: {
        showEffects: true,
        showObjectChanges: true,
      }
    });
  });

  it('should handle transaction failure correctly', async () => {
    const mockTransaction = { kind: 'ProgrammableTransaction' };
    const mockDigest = 'failed-transaction-digest';
    const mockTxResult = {
      effects: {
        status: { 
          status: 'failure',
          error: 'Insufficient gas'
        }
      }
    };

    mockVaultService.createVault.mockReturnValue(mockTransaction);
    mockSignAndExecuteTransaction.mockImplementation((params, callbacks) => {
      setTimeout(() => {
        callbacks.onSuccess({ digest: mockDigest });
      }, 0);
    });
    mockSuiClient.getTransactionBlock.mockResolvedValue(mockTxResult);

    const { result } = renderHook(() => useVault(), { wrapper });

    await expect(
      result.current.createVaultAsync({
        key: 'test-vault-key',
        locked: '0xabcdef1234567890abcdef1234567890abcdef12',
        ownerExchangeKey: 'secure-exchange-key',
        ownerAddress: mockAccount.address,
        assetObjectId: '0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c'
      })
    ).rejects.toThrow('Transaction failed: Insufficient gas');
  });

  it('should verify ownerAddress parameter is properly included', async () => {
    const mockTransaction = { kind: 'ProgrammableTransaction' };
    mockVaultService.createVault.mockReturnValue(mockTransaction);

    const { result } = renderHook(() => useVault(), { wrapper });

    const vaultParams = {
      key: 'test-vault-key',
      locked: '0xabcdef1234567890abcdef1234567890abcdef12',
      ownerExchangeKey: 'secure-exchange-key',
      ownerAddress: mockAccount.address,
      assetObjectId: '0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c'
    };

    try {
      await result.current.createVaultAsync(vaultParams);
    } catch (error) {
      // Expected since we're not fully mocking the success flow
    }

    // Verify that VaultService.createVault was called with the correct parameters
    expect(mockVaultService.createVault).toHaveBeenCalledWith(
      expect.objectContaining({
        key: vaultParams.key,
        locked: vaultParams.locked,
        ownerExchangeKey: vaultParams.ownerExchangeKey,
        ownerAddress: vaultParams.ownerAddress,
        assetObjectId: vaultParams.assetObjectId
      })
    );

    // Verify ownerAddress matches the connected account
    const calledParams = mockVaultService.createVault.mock.calls[0][0];
    expect(calledParams.ownerAddress).toBe(mockAccount.address);
  });
});