import { graphqlRequest } from "./graphql";

import type { Product, Location, InventoryTransaction } from "./receiving";

import type { Inventory } from "./shipping";

export type ProcessProductionInput = {
  rawProductId: string;
  finishedProductId: string;
  locationId: string;
  rawQuantity: number;
  finishedQuantity: number;
  reference?: string;
  notes?: string;
};

const GET_PRODUCTION_DATA = `
  query GetProductionData {
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

const PROCESS_PRODUCTION = `
  mutation ProcessProduction($input: ProcessProductionInput!) {
    processProduction(input: $input) {
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

export async function getProductionData(token: string) {
  return graphqlRequest<{
    products: Product[];
    locations: Location[];
    inventory: Inventory[];
  }>(GET_PRODUCTION_DATA, undefined, token);
}

export async function processProduction(
  input: ProcessProductionInput,
  token: string,
) {
  const result = await graphqlRequest<{
    processProduction: InventoryTransaction[];
  }>(PROCESS_PRODUCTION, { input }, token);

  return result.processProduction;
}
