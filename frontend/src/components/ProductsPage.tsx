import { useEffect, useState, type FormEvent } from "react";
import { Package, Plus, X } from "lucide-react";
import {
  createProduct,
  getCategories,
  type Product,
  type Category,
  type CreateProductInput,
} from "../lib/inventory";

type ProductsPageProps = {
  products: Product[];
  token: string;
  onProductCreated: (product: Product) => void;
};

export default function ProductsPage({
  products,
  token,
  onProductCreated,
}: ProductsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("KG");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getCategories(token)
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setCategoriesError(
            err instanceof Error ? err.message : "Failed to load categories",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const input: CreateProductInput = {
      sku: sku.trim(),
      name: name.trim(),
      unit: unit.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    try {
      const product = await createProduct(input, token);
      onProductCreated(product);

      setSku("");
      setName("");
      setDescription("");
      setUnit("KG");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="mt-2 text-slate-500">
            View and manage your inventory products.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Create New Product
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium"
              >
                Category (optional)
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={categoriesLoading || !!categoriesError}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                <option value="">
                  {categoriesLoading ? "Loading categories..." : "No category"}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {categoriesError && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {categoriesError}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="sku" className="mb-1 block text-sm font-medium">
                SKU *
              </label>
              <input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="LOB-003"
              />
            </div>

            <div>
              <label
                htmlFor="product-name"
                className="mb-1 block text-sm font-medium"
              >
                Product Name *
              </label>
              <input
                id="product-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Frozen Lobster"
              />
            </div>

            <div>
              <label htmlFor="unit" className="mb-1 block text-sm font-medium">
                Unit *
              </label>
              <input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="KG"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium"
              >
                Description (optional)
              </label>
              <input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Product description"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Product"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <Package className="text-blue-600" size={22} />
          <h2 className="text-lg font-semibold text-slate-900">
            All Products ({products.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Product ID</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Unit</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500">{product.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <p className="p-6 text-center text-slate-500">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
