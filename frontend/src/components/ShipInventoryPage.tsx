import { useState, type FormEvent } from "react";
import { Truck } from "lucide-react";
import {
  shipInventory,
  type Product,
  type Location,
  type InventoryItem,
  type ShipInventoryInput,
} from "../lib/inventory";

type ShipInventoryPageProps = {
  products: Product[];
  locations: Location[];
  inventory: InventoryItem[];
  token: string;
  onShipped: () => void;
};

export default function ShipInventoryPage({
  products,
  locations,
  inventory,
  token,
  onShipped,
}: ShipInventoryPageProps) {
  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProduct = products.find((p) => p.id === productId);

  const availableStock = inventory
    .filter(
      (item) => item.productId === productId && item.locationId === locationId,
    )
    .reduce((total, item) => total + item.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setError("");
    setSuccess("");

    const amount = Number(quantity);

    if (!productId || !locationId || !Number.isFinite(amount) || amount <= 0) {
      setError("Please select a product, location, and valid quantity.");
      return;
    }

    if (amount > availableStock) {
      setError("Insufficient inventory. Please enter a smaller quantity.");
      return;
    }

    const input: ShipInventoryInput = {
      productId,
      locationId,
      quantity: amount,
      ...(reference.trim() ? { reference: reference.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    setSaving(true);

    try {
      await shipInventory(input, token);
      setSuccess("Inventory shipped successfully!");
      setQuantity("");
      setReference("");
      setNotes("");
      onShipped();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ship inventory");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Ship Inventory</h1>
        <p className="mt-2 text-slate-500">
          Ship products from an existing warehouse location.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <Truck className="text-blue-600" size={24} />
          <h2 className="text-lg font-semibold text-slate-900">New Shipment</h2>
        </div>

        <div>
          <label
            htmlFor="ship-product"
            className="mb-1 block text-sm font-medium"
          >
            Product *
          </label>
          <select
            id="ship-product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ship-location"
            className="mb-1 block text-sm font-medium"
          >
            Shipping From *
          </label>
          <select
            id="ship-location"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select a location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {productId && locationId && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-slate-600">Available Stock</p>
            <p className="text-2xl font-bold text-blue-700">
              {availableStock} {selectedProduct?.unit ?? ""}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="ship-quantity"
            className="mb-1 block text-sm font-medium"
          >
            Quantity *
          </label>
          <input
            id="ship-quantity"
            type="number"
            min="0.001"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            placeholder="Enter shipping quantity"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="ship-reference"
            className="mb-1 block text-sm font-medium"
          >
            Reference (optional)
          </label>
          <input
            id="ship-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="SHIP-002"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="ship-notes"
            className="mb-1 block text-sm font-medium"
          >
            Notes (optional)
          </label>
          <textarea
            id="ship-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional shipping details"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-sm text-green-600">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || products.length === 0 || locations.length === 0}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Shipping..." : "Ship Inventory"}
        </button>
      </form>
    </div>
  );
}
