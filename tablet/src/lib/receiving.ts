import { graphqlRequest } from "./graphql";

export type Product = {
  id: string;
  sku: string;
  name: string;
  unit: string;
};

export type Location = {
  id: string;
  name: string;
};

export type InventoryTransaction = {
  id: string;
  productId: string;
  locationId: string;
  transactionType: string;
  quantity: number;
  reference: string | null;
  notes: string | null;
  createdAt: string;
};

export type ReceiveInventoryInput = {
  productId: string;
  locationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
};

const GET_RECEIVING_DATA = `
  query GetReceivingData {
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
  }
`;

const RECEIVE_INVENTORY = `
  mutation ReceiveInventory($input: ReceiveInventoryInput!) {
    receiveInventory(input: $input) {
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

export async function getReceivingData(token: string) {
  return graphqlRequest<{
    products: Product[];
    locations: Location[];
  }>(GET_RECEIVING_DATA, undefined, token);
}

export async function receiveInventory(
  input: ReceiveInventoryInput,
  token: string,
) {
  const result = await graphqlRequest<{
    receiveInventory: InventoryTransaction;
  }>(RECEIVE_INVENTORY, { input }, token);

  return result.receiveInventory;
}
