import { graphqlRequest } from "./graphql";

import type { Product, Location } from "./receiving";
import type { Inventory } from "./shipping";

export type InventoryData = {
  products: Product[];
  locations: Location[];
  inventory: Inventory[];
};

const GET_INVENTORY_DATA = `
  query GetInventoryData {
    products {
      id
      sku
      name
      unit
      lowStockThreshold
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

export async function getInventoryData(token: string): Promise<InventoryData> {
  return graphqlRequest<InventoryData>(GET_INVENTORY_DATA, undefined, token);
}

export type InventoryRow = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  locationId: string;
  locationName: string;
  quantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
};

export function buildInventoryRows(data: InventoryData): InventoryRow[] {
  return data.inventory.map((item) => {
    const product = data.products.find((p) => p.id === item.productId);

    const location = data.locations.find((l) => l.id === item.locationId);

    const threshold = product?.lowStockThreshold ?? 0;

    return {
      id: item.id,
      productId: item.productId,
      productName: product?.name ?? "Unknown Product",
      sku: product?.sku ?? "",
      unit: product?.unit ?? "",
      locationId: item.locationId,
      locationName: location?.name ?? "Unknown Location",
      quantity: item.quantity,
      lowStockThreshold: threshold,
      isLowStock: item.quantity <= threshold,
    };
  });
}
