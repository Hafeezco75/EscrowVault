import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateVaultForm from '../components/vault/CreateVaultForm';
import { useVault } from '../hooks/useVault';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';

// Mock the dependencies
vi.mock('../hooks/useVault');
vi.mock('@mysten/dapp-kit');
vi.mock('next/navigation');

// Mock the providers constants
vi.mock('../components/providers', () => ({
  PACKAGE_ID: '0x5d0dc8c2b1782c52ee425759790ac27a89cbf3207b4aef5acfcce70fc45362c4'
}));

const mockUseVault = vi.mocked(useVault);
const mockUseCurrentAccount = vi.mocked(useCurrentAccount);
const mockUseRouter = vi.mocked(useRouter);

describe('CreateVaultForm', () => {
  const mockAccount = {
    address: '0x1234567890abcdef1234567890abcdef12345678',
  };

  const mockCreateVaultAsync = vi.fn();
  const mockPush = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseCurrentAccount.mockReturnValue(mockAccount);
    mockUseRouter.mockReturnValue({ push: mockPush });
    mockUseVault.mockReturnValue({
      createVaultAsync: mockCreateVaultAsync,
      isCreatingVault: false,
      vaults: [],
      isConnected: true,
      createVault: vi.fn(),
      lockVault: vi.fn(),
      isLockingVault: false,
      unlockVault: vi.fn(),
      isUnlockingVault: false,
      swapAssets: vi.fn(),
      isSwappingAssets: false,
      returnToSender: vi.fn(),
      isReturningToSender: false,
      refetchVaults: vi.fn(),
      refreshVaults: vi.fn(),
    });
  });

  it('renders all form fields correctly', () => {
    render(<CreateVaultForm onSuccess={mockOnSuccess} />);
    
    expect(screen.getByLabelText(/vault key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/locked object id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/owner exchange key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create vault/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<CreateVaultForm onSuccess={mockOnSuccess} />);
    
    const createButton = screen.getByRole('button', { name: /create vault/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText(/vault key is required/i)).toBeInTheDocument();
      expect(screen.getByText(/locked object id is required/i)).toBeInTheDocument();
      expect(screen.getByText(/owner exchange key is required/i)).toBeInTheDocument();
    });
  });

  it('validates locked object ID format', async () => {
    render(<CreateVaultForm onSuccess={mockOnSuccess} />);
    
    const lockedInput = screen.getByLabelText(/locked object id/i);
    fireEvent.change(lockedInput, { target: { value: 'invalid-id' } });
    
    const createButton = screen.getByRole('button', { name: /create vault/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid locked object id format/i)).toBeInTheDocument();
    });
  });

  it('calls createVaultAsync with correct parameters including ownerAddress', async () => {
    mockCreateVaultAsync.mockResolvedValue({
      effects: {
        created: [{ reference: { objectId: 'vault-123' } }]
      }
    });

    render(<CreateVaultForm onSuccess={mockOnSuccess} />);
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/vault key/i), { 
      target: { value: 'test-vault-key' } 
    });
    fireEvent.change(screen.getByLabelText(/locked object id/i), { 
      target: { value: '0x1234567890abcdef1234567890abcdef1234567890' } 
    });
    fireEvent.change(screen.getByLabelText(/owner exchange key/i), { 
      target: { value: 'test-exchange-key' } 
    });
    
    const createButton = screen.getByRole('button', { name: /create vault/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockCreateVaultAsync).toHaveBeenCalledWith({
        key: 'test-vault-key',
        locked: '0x1234567890abcdef1234567890abcdef1234567890',
        ownerExchangeKey: 'test-exchange-key',
        ownerAddress: mockAccount.address,
        assetObjectId: '0xe33452c088430bd785c2a821e8db5d417c7acb8cf22edf82e6e55d3893ccdd5c'
      });
    });
  });

  it('shows wallet connection error when account is not connected', async () => {
    mockUseCurrentAccount.mockReturnValue(null);
    mockUseVault.mockReturnValue({
      ...mockUseVault(),
      isConnected: false
    });

    render(<CreateVaultForm onSuccess={mockOnSuccess} />);
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/vault key/i), { 
      target: { value: 'test-vault-key' } 
    });
    fireEvent.change(screen.getByLabelText(/locked object id/i), { 
      target: { value: '0x1234567890abcdef1234567890abcdef1234567890' } 
    });
    fireEvent.change(screen.getByLabelText(/owner exchange key/i), { 
      target: { value: 'test-exchange-key' } 
    });
    
    const createButton = screen.getByRole('button', { name: /create vault/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText(/wallet must be connected/i)).toBeInTheDocument();
    });
  });

  it('displays owner address information correctly', () => {
    render(<CreateVaultForm onSuccess={mockOnSuccess} />);
    
    expect(screen.getByText(/owner address will be:/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockAccount.address.substring(0, 10)))).toBeInTheDocument();
  });

  it('navigates to success page after successful vault creation', async () => {
    const mockResult = {
      effects: {
        created: [{ reference: { objectId: 'vault-123' } }]
      }
    };
    mockCreateVaultAsync.mockResolvedValue(mockResult);

    render(<CreateVaultForm onSuccess={mockOnSuccess} />);
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/vault key/i), { 
      target: { value: 'test-vault-key' } 
    });
    fireEvent.change(screen.getByLabelText(/locked object id/i), { 
      target: { value: '0x1234567890abcdef1234567890abcdef1234567890' } 
    });
    fireEvent.change(screen.getByLabelText(/owner exchange key/i), { 
      target: { value: 'test-exchange-key' } 
    });
    
    const createButton = screen.getByRole('button', { name: /create vault/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('vault-123');
    }, { timeout: 2000 });
  });
});