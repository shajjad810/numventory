import { useState, type FormEvent } from "react";
import { ArrowLeftRight } from "lucide-react";
import {
  transferInventory,
  type Product,
  type Location,
  type InventoryItem,
  type TransferInventoryInput,
} from "../lib/inventory";

type TransferInventoryPageProps = {
  products: Product[];
  locations: Location[];
  inventory: InventoryItem[];
  token: string;
  onTransferred: () => void;
};

export default function TransferInventoryPage({
  products,
  locations,
  inventory,
  token,
  onTransferred,
}: TransferInventoryPageProps) {
  const [productId, setProductId] = useState("");
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProduct = products.find((p) => p.id === productId);

  const availableStock = inventory
    .filter(
      (item) =>
        item.productId === productId && item.locationId === fromLocationId,
    )
    .reduce((total, item) => total + item.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setError("");
    setSuccess("");

    const amount = Number(quantity);

    if (
      !productId ||
      !fromLocationId ||
      !toLocationId ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (fromLocationId === toLocationId) {
      setError("Source and destination locations must be different.");
      return;
    }

    if (amount > availableStock) {
      setError("Insufficient inventory. Please enter a smaller quantity.");
      return;
    }

    const input: TransferInventoryInput = {
      productId,
      fromLocationId,
      toLocationId,
      quantity: amount,
      ...(reference.trim() ? { reference: reference.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    setSaving(true);

    try {
      await transferInventory(input, token);
      setSuccess("Inventory transferred successfully!");
      setQuantity("");
      setReference("");
      setNotes("");
      onTransferred();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to transfer inventory",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Transfer Inventory
        </h1>
        <p className="mt-2 text-slate-500">
          Move stock between warehouse locations.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <ArrowLeftRight className="text-blue-600" size={24} />
          <h2 className="text-lg font-semibold text-slate-900">New Transfer</h2>
        </div>

        <div>
          <label
            htmlFor="transfer-product"
            className="mb-1 block text-sm font-medium"
          >
            Product *
          </label>
          <select
            id="transfer-product"
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
            htmlFor="transfer-from"
            className="mb-1 block text-sm font-medium"
          >
            From Location *
          </label>
          <select
            id="transfer-from"
            value={fromLocationId}
            onChange={(e) => setFromLocationId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select source location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="transfer-to"
            className="mb-1 block text-sm font-medium"
          >
            To Location *
          </label>
          <select
            id="transfer-to"
            value={toLocationId}
            onChange={(e) => setToLocationId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select destination location</option>
            {locations
              .filter((location) => location.id !== fromLocationId)
              .map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
          </select>
        </div>

        {productId && fromLocationId && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-slate-600">Available Stock at Source</p>
            <p className="text-2xl font-bold text-blue-700">
              {availableStock} {selectedProduct?.unit ?? ""}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="transfer-quantity"
            className="mb-1 block text-sm font-medium"
          >
            Transfer Quantity *
          </label>
          <input
            id="transfer-quantity"
            type="number"
            min="0.001"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            placeholder="Enter transfer quantity"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="transfer-reference"
            className="mb-1 block text-sm font-medium"
          >
            Reference (optional)
          </label>
          <input
            id="transfer-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="TRF-002"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="transfer-notes"
            className="mb-1 block text-sm font-medium"
          >
            Notes (optional)
          </label>
          <textarea
            id="transfer-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional transfer details"
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
          disabled={saving || products.length === 0 || locations.length < 2}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Transferring..." : "Transfer Inventory"}
        </button>
      </form>
    </div>
  );
}
