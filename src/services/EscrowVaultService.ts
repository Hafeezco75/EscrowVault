import { Transaction } from '@mysten/sui/transactions';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';
import { PACKAGE_ID } from '../components/providers';

export interface EscrowVault {
  id: string;
  sender: string;
  recipient: string;
  recipientExchangeKey: string;
  escrowedKey: string;
  objectEscrowed: any;
  locked: boolean;
  createdAt: number;
}

export interface CreateEscrowParams {
  key: string; // Key<T>
  locked: string; // Locked<T> - object ID of the locked asset
  recipientExchangeKey: string; // ID - recipient's exchange key
  recipient: string; // address
  verifier?: string; // address - Optional, will default to sender if not provided
}

export interface UnlockEscrowParams {
  lockedId: string;
  keyId: string;
}

export interface SwapEscrowParams {
  ownerEscrowId: string;
  recipientEscrowId: string;
}

export interface ReturnToSenderParams {
  escrowId: string;
}

export class EscrowVaultService {
  /**
   * Create a new escrow with the specified parameters
   * Follows the exact signature: create<T>(key: Key<T>, locked: Locked<T>, recipient_exchange_key: ID, recipient: address, verifier: address, ctx: &mut TxContext)
   */
  static createEscrowVault(params: CreateEscrowParams): Transaction {
    const tx = new Transaction();
    
    // Ensure verifier is provided, fallback to recipient if not specified
    const verifierAddress = params.verifier || params.recipient;
    
    tx.moveCall({
      target: `${PACKAGE_ID}::escrow_vault::create`,
      arguments: [
        tx.object(params.key), // Key<T>
        tx.object(params.locked), // Locked<T>
        tx.pure.string(params.recipientExchangeKey), // ID - recipient_exchange_key
        tx.pure.address(normalizeSuiAddress(params.recipient)), // address - recipient
        tx.pure.address(normalizeSuiAddress(verifierAddress)) // address - verifier
      ],
    });

    return tx;
  }

  /**
   * Unlock an escrow vault
   */
  static unlockEscrowVault(params: UnlockEscrowParams): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::escrow_vault::unlock`,
      arguments: [
        tx.object(params.lockedId),
        tx.object(params.keyId)
      ],
    });

    return tx;
  }

  /**
   * Swap two escrow vaults
   */
  static swapEscrowVaults(params: SwapEscrowParams): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::escrow_vault::swap`,
      arguments: [
        tx.object(params.ownerEscrowId),
        tx.object(params.recipientEscrowId)
      ],
    });

    return tx;
  }

  /**
   * Return escrow to sender
   */
  static returnEscrowToSender(params: ReturnToSenderParams): Transaction {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::escrow_vault::return_to_sender`,
      arguments: [
        tx.object(params.escrowId)
      ],
    });

    return tx;
  }
}