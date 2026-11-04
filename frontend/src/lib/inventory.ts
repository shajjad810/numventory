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
