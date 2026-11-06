import { graphqlRequest } from "./graphql";

export type InventoryItem = {
  id: string;
  quantity: number;
  productId: string;
  locationId: string;
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
  fromLocationId: string | null;
  toLocationId: string | null;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  unit: string;
  lowStockThreshold: number;
};

export type Location = {
  id: string;
  name: string;
  description?: string | null;
};

export type Category = {
  id: string;
  name: string;
};

export type InventoryData = {
  inventory: InventoryItem[];
  products: Product[];
  locations: Location[];
  inventoryTransactions: InventoryTransaction[];
};

const INVENTORY_QUERY = `
  query GetInventoryDashboard {
    inventory {
      id
      productId
      locationId
      quantity
    }
    products {
      id
      sku
      name
      description
      categoryId
      unit
      lowStockThreshold
    }
    locations {
      id
      name
      description
    }
    inventoryTransactions {
      id
      productId
      locationId
      transactionType
      quantity
      reference
      notes
      createdAt
      fromLocationId
      toLocationId
    }
  }
`;

export async function getInventory(token: string): Promise<InventoryData> {
  return graphqlRequest<InventoryData>(INVENTORY_QUERY, undefined, token);
}

export type CreateProductInput = {
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  unit: string;
  lowStockThreshold?: number;
};

type CreateProductResponse = {
  createProduct: Product;
};

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      sku
      name
      description
      categoryId
      unit
      lowStockThreshold
    }
  }
`;

export async function createProduct(
  input: CreateProductInput,
  token: string,
): Promise<Product> {
  const data = await graphqlRequest<CreateProductResponse>(
    CREATE_PRODUCT_MUTATION,
    { input },
    token,
  );

  return data.createProduct;
}

type CategoriesResponse = {
  categories: Category[];
};

const CATEGORIES_QUERY = `
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

export async function getCategories(token: string): Promise<Category[]> {
  const data = await graphqlRequest<CategoriesResponse>(
    CATEGORIES_QUERY,
    undefined,
    token,
  );

  return data.categories;
}

export type CreateLocationInput = {
  name: string;
  description?: string;
};

type CreateLocationResponse = {
  createLocation: Location;
};

const CREATE_LOCATION_MUTATION = `
  mutation CreateLocation($input: CreateLocationInput!) {
    createLocation(input: $input) {
      id
      name
      description
    }
  }
`;

export async function createLocation(
  input: CreateLocationInput,
  token: string,
): Promise<Location> {
  const data = await graphqlRequest<CreateLocationResponse>(
    CREATE_LOCATION_MUTATION,
    { input },
    token,
  );

  return data.createLocation;
}

export type ReceiveInventoryInput = {
  productId: string;
  locationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
};

type ReceiveInventoryResponse = {
  receiveInventory: InventoryTransaction;
};

const RECEIVE_INVENTORY_MUTATION = `
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
      fromLocationId
      toLocationId
    }
  }
`;

export async function receiveInventory(
  input: ReceiveInventoryInput,
  token: string,
): Promise<InventoryTransaction> {
  const data = await graphqlRequest<ReceiveInventoryResponse>(
    RECEIVE_INVENTORY_MUTATION,
    { input },
    token,
  );

  return data.receiveInventory;
}

export type ShipInventoryInput = {
  productId: string;
  locationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
};

type ShipInventoryResponse = {
  shipInventory: InventoryTransaction;
};

const SHIP_INVENTORY_MUTATION = `
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
      fromLocationId
      toLocationId
    }
  }
`;

export async function shipInventory(
  input: ShipInventoryInput,
  token: string,
): Promise<InventoryTransaction> {
  const data = await graphqlRequest<ShipInventoryResponse>(
    SHIP_INVENTORY_MUTATION,
    { input },
    token,
  );

  return data.shipInventory;
}

export type RecordWasteInput = {
  productId: string;
  locationId: string;
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
};

type RecordWasteResponse = {
  recordWaste: InventoryTransaction;
};

const RECORD_WASTE_MUTATION = `
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
      fromLocationId
      toLocationId
    }
  }
`;

export async function recordWaste(
  input: RecordWasteInput,
  token: string,
): Promise<InventoryTransaction> {
  const data = await graphqlRequest<RecordWasteResponse>(
    RECORD_WASTE_MUTATION,
    { input },
    token,
  );

  return data.recordWaste;
}

export type TransferInventoryInput = {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  reference?: string;
  notes?: string;
};

type TransferInventoryResponse = {
  transferInventory: InventoryTransaction;
};

const TRANSFER_INVENTORY_MUTATION = `
  mutation TransferInventory($input: TransferInventoryInput!) {
    transferInventory(input: $input) {
      id
      productId
      locationId
      transactionType
      quantity
      reference
      notes
      createdAt
      fromLocationId
      toLocationId
    }
  }
`;

export async function transferInventory(
  input: TransferInventoryInput,
  token: string,
): Promise<InventoryTransaction> {
  const data = await graphqlRequest<TransferInventoryResponse>(
    TRANSFER_INVENTORY_MUTATION,
    { input },
    token,
  );

  return data.transferInventory;
}

export type ProcessProductionInput = {
  rawProductId: string;
  finishedProductId: string;
  locationId: string;
  rawQuantity: number;
  finishedQuantity: number;
  reference?: string;
  notes?: string;
};

type ProcessProductionResponse = {
  processProduction: InventoryTransaction[];
};

const PROCESS_PRODUCTION_MUTATION = `
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
      fromLocationId
      toLocationId
    }
  }
`;

export async function processProduction(
  input: ProcessProductionInput,
  token: string,
): Promise<InventoryTransaction[]> {
  const data = await graphqlRequest<ProcessProductionResponse>(
    PROCESS_PRODUCTION_MUTATION,
    { input },
    token,
  );

  return data.processProduction;
}

type UpdateProductThresholdResponse = {
  updateProductThreshold: Product;
};

const UPDATE_PRODUCT_THRESHOLD_MUTATION = `
  mutation UpdateProductThreshold($input: UpdateProductThresholdInput!) {
    updateProductThreshold(input: $input) {
      id
      sku
      name
      description
      categoryId
      unit
      lowStockThreshold
    }
  }
`;

export async function updateProductThreshold(
  productId: string,
  lowStockThreshold: number,
  token: string,
): Promise<Product> {
  const data = await graphqlRequest<UpdateProductThresholdResponse>(
    UPDATE_PRODUCT_THRESHOLD_MUTATION,
    {
      input: {
        productId,
        lowStockThreshold,
      },
    },
    token,
  );

  return data.updateProductThreshold;
}
