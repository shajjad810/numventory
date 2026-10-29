import { graphqlRequest } from "./graphql";

export type InventoryItem = {
  id: string;
  quantity: number;
  productId: string;
  locationId: string;
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
};

export type Category = {
  id: string;
  name: string;
};

export type InventoryData = {
  inventory: InventoryItem[];
  products: Product[];
  locations: Location[];
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
