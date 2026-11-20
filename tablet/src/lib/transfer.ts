import { graphqlRequest } from "./graphql";

import type { Product, Location, InventoryTransaction } from "./receiving";

import type { Inventory } from "./shipping";

export type TransferInventoryInput = {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
};

const GET_TRANSFER_DATA = `
  query GetTransferData {
    products {
      id
      sku
      name
      unit
    }
    locations {
      id
      name
    }
    inventory {
      id
      productId
      locationId
      quantity
    }
  }
`;

const TRANSFER_INVENTORY = `
  mutation TransferInventory($input: TransferInventoryInput!) {
    transferInventory(input: $input) {
      id
      productId
      locationId
      fromLocationId
      toLocationId
      transactionType
      quantity
      reference
      notes
      createdAt
    }
  }
`;

export async function getTransferData(token: string) {
  return graphqlRequest<{
    products: Product[];
    locations: Location[];
    inventory: Inventory[];
  }>(GET_TRANSFER_DATA, undefined, token);
}

export async function transferInventory(
  input: TransferInventoryInput,
  token: string,
) {
  const result = await graphqlRequest<{
    transferInventory: InventoryTransaction;
  }>(TRANSFER_INVENTORY, { input }, token);

  return result.transferInventory;
}
