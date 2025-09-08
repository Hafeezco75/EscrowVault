import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import { PACKAGE_ID, OBJECT_ID } from '../components/providers';

export interface Vault {
  id: string;
  owner: string;
  assets: string[];
  locked: boolean;
  createdAt: number;
}

export class VaultService {
  private client: SuiClient;

  constructor(client: SuiClient) {
    this.client = client;
  }

  async createVault() {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::vault::create_vault`,
      arguments: [tx.object(OBJECT_ID)],
    });

    return tx;
  }

  async lockVault(vaultId: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::vault::lock_vault`,
      arguments: [tx.object(OBJECT_ID), tx.object(vaultId)],
    });

    return tx;
  }

  async unlockVault(vaultId: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::vault::unlock_vault`,
      arguments: [tx.object(OBJECT_ID), tx.object(vaultId)],
    });

    return tx;
  }

  async swapAssets(vaultId: string, assetId: string, targetAssetType: string) {
    const tx = new TransactionBlock();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::vault::swap_asset`,
      arguments: [
        tx.object(OBJECT_ID),
        tx.object(vaultId),
        tx.object(assetId),
        tx.pure(targetAssetType)
      ],
    });

    return tx;
  }

  async getUserVaults(address: string): Promise<Vault[]> {
    try {
      // This is a placeholder - in a real implementation, you would query the blockchain
      // for vaults owned by this address
      const response = await this.client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${PACKAGE_ID}::vault::Vault`
        },
        options: {
          showContent: true
        }
      });

      // Transform the response into our Vault interface
      // This is just a placeholder implementation
      return response.data.map(item => {
        const fields = item.data?.content?.fields as any;
        return {
          id: item.data?.objectId || '',
          owner: fields?.owner || '',
          assets: fields?.assets?.fields?.contents || [],
          locked: fields?.locked || false,
          createdAt: Date.now()
        };
      });
    } catch (error) {
      console.error('Error fetching user vaults:', error);
      return [];
    }
  }
}