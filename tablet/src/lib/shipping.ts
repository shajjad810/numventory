import { graphqlRequest } from "./graphql";
import type { Product, Location, InventoryTransaction } from "./receiving";

export type Inventory = {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
};

export type ShipInventoryInput = {
  productId: string;
  locationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
};

const GET_SHIPPING_DATA = `
  query GetShippingData {
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

const SHIP_INVENTORY = `
  mutation ShipInventory($input: ShipInventoryInput!) {
    shipInventory(input: $input) {
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

export async function getShippingData(token: string) {
  return graphqlRequest<{
    products: Product[];
    locations: Location[];
    inventory: Inventory[];
  }>(GET_SHIPPING_DATA, undefined, token);
}

export async function shipInventory(input: ShipInventoryInput, token: string) {
  const result = await graphqlRequest<{
    shipInventory: InventoryTransaction;
  }>(SHIP_INVENTORY, { input }, token);

  return result.shipInventory;
}

export function getAvailableStock(
  inventory: Inventory[],
  productId: string,
  locationId: string,
): number {
  return inventory
    .filter(
      (item) => item.productId === productId && item.locationId === locationId,
    )
    .reduce((total, item) => total + item.quantity, 0);
}
