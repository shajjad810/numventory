import { graphqlRequest } from "./graphql";

import type { Product, Location, InventoryTransaction } from "./receiving";

import type { Inventory } from "./shipping";

export type RecordWasteInput = {
  productId: string;
  locationId: string;
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
};

const GET_WASTE_DATA = `
  query GetWasteData {
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

const RECORD_WASTE = `
  mutation RecordWaste($input: RecordWasteInput!) {
    recordWaste(input: $input) {
      id
      productId
      locationId
      transactionType
      quantity
      reference
      notes
      createdAt
    }
  }
`;

export async function getWasteData(token: string) {
  return graphqlRequest<{
    products: Product[];
    locations: Location[];
    inventory: Inventory[];
  }>(GET_WASTE_DATA, undefined, token);
}

export async function recordWaste(input: RecordWasteInput, token: string) {
  const result = await graphqlRequest<{
    recordWaste: InventoryTransaction;
  }>(RECORD_WASTE, { input }, token);

  return result.recordWaste;
}
