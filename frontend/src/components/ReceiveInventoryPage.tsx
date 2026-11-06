import { useState, type FormEvent } from "react";
import { PackagePlus } from "lucide-react";
import {
  receiveInventory,
  type Product,
  type Location,
  type ReceiveInventoryInput,
} from "../lib/inventory";

type ReceiveInventoryPageProps = {
  products: Product[];
  locations: Location[];
  token: string;
  onReceived: () => void;
};

export default function ReceiveInventoryPage({
  products,
  locations,
  token,
  onReceived,
}: ReceiveInventoryPageProps) {
  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    const input: ReceiveInventoryInput = {
      productId,
      locationId,
      quantity: amount,
      ...(reference.trim() ? { reference: reference.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    setSaving(true);

    try {
      await receiveInventory(input, token);
      setSuccess("Inventory received successfully!");
      setQuantity("");
      setReference("");
      setNotes("");
      onReceived();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to receive inventory",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Receive Inventory</h1>
        <p className="mt-2 text-slate-500">
          Add incoming stock to a warehouse location.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <PackagePlus className="text-blue-600" size={24} />
          <h2 className="text-lg font-semibold text-slate-900">
            New Receiving
          </h2>
        </div>

        <div>
          <label
            htmlFor="receive-product"
            className="mb-1 block text-sm font-medium"
          >
            Product *
          </label>
          <select
            id="receive-product"
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
            htmlFor="receive-location"
            className="mb-1 block text-sm font-medium"
          >
            Location *
          </label>
          <select
            id="receive-location"
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

        <div>
          <label
            htmlFor="receive-quantity"
            className="mb-1 block text-sm font-medium"
          >
            Quantity *
          </label>
          <input
            id="receive-quantity"
            type="number"
            min="0.001"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            placeholder="Enter quantity"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="receive-reference"
            className="mb-1 block text-sm font-medium"
          >
            Reference (optional)
          </label>
          <input
            id="receive-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="REC-002"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="receive-notes"
            className="mb-1 block text-sm font-medium"
          >
            Notes (optional)
          </label>
          <textarea
            id="receive-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional receiving details"
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
          {saving ? "Receiving..." : "Receive Inventory"}
        </button>
      </form>
    </div>
  );
}
