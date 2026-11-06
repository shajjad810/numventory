import { useState, type FormEvent } from "react";
import { Factory } from "lucide-react";
import {
  processProduction,
  type Product,
  type Location,
  type InventoryItem,
  type ProcessProductionInput,
} from "../lib/inventory";

type ProductionPageProps = {
  products: Product[];
  locations: Location[];
  inventory: InventoryItem[];
  token: string;
  onProduced: () => void;
};

export default function ProductionPage({
  products,
  locations,
  inventory,
  token,
  onProduced,
}: ProductionPageProps) {
  const [rawProductId, setRawProductId] = useState("");
  const [finishedProductId, setFinishedProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [rawQuantity, setRawQuantity] = useState("");
  const [finishedQuantity, setFinishedQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const rawProduct = products.find((p) => p.id === rawProductId);
  const finishedProduct = products.find((p) => p.id === finishedProductId);

  const availableStock = inventory
    .filter(
      (item) =>
        item.productId === rawProductId && item.locationId === locationId,
    )
    .reduce((total, item) => total + item.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setError("");
    setSuccess("");

    const rawAmount = Number(rawQuantity);
    const finishedAmount = Number(finishedQuantity);

    if (
      !rawProductId ||
      !finishedProductId ||
      !locationId ||
      !Number.isFinite(rawAmount) ||
      rawAmount <= 0 ||
      !Number.isFinite(finishedAmount) ||
      finishedAmount <= 0
    ) {
      setError("Please complete all required fields with valid quantities.");
      return;
    }

    if (rawProductId === finishedProductId) {
      setError("Raw product and finished product must be different.");
      return;
    }

    if (rawAmount > availableStock) {
      setError("Insufficient raw inventory. Please enter a smaller quantity.");
      return;
    }

    const input: ProcessProductionInput = {
      rawProductId,
      finishedProductId,
      locationId,
      rawQuantity: rawAmount,
      finishedQuantity: finishedAmount,
      ...(reference.trim() ? { reference: reference.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    setSaving(true);

    try {
      await processProduction(input, token);
      setSuccess("Production completed successfully!");
      setRawQuantity("");
      setFinishedQuantity("");
      setReference("");
      setNotes("");
      onProduced();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process production",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Production Inventory
        </h1>
        <p className="mt-2 text-slate-500">
          Convert raw materials into finished products.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <Factory className="text-blue-600" size={24} />
          <h2 className="text-lg font-semibold text-slate-900">
            New Production
          </h2>
        </div>

        <div>
          <label
            htmlFor="production-raw"
            className="mb-1 block text-sm font-medium"
          >
            Raw Product *
          </label>
          <select
            id="production-raw"
            value={rawProductId}
            onChange={(e) => setRawProductId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select raw product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="production-finished"
            className="mb-1 block text-sm font-medium"
          >
            Finished Product *
          </label>
          <select
            id="production-finished"
            value={finishedProductId}
            onChange={(e) => setFinishedProductId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select finished product</option>
            {products
              .filter((product) => product.id !== rawProductId)
              .map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="production-location"
            className="mb-1 block text-sm font-medium"
          >
            Production Location *
          </label>
          <select
            id="production-location"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {rawProductId && locationId && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-slate-600">Available Raw Stock</p>
            <p className="text-2xl font-bold text-blue-700">
              {availableStock} {rawProduct?.unit ?? ""}
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="production-raw-quantity"
            className="mb-1 block text-sm font-medium"
          >
            Raw Quantity *
          </label>
          <input
            id="production-raw-quantity"
            type="number"
            min="0.001"
            step="any"
            value={rawQuantity}
            onChange={(e) => setRawQuantity(e.target.value)}
            required
            placeholder="Enter raw quantity"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="production-finished-quantity"
            className="mb-1 block text-sm font-medium"
          >
            Finished Quantity *
          </label>
          <input
            id="production-finished-quantity"
            type="number"
            min="0.001"
            step="any"
            value={finishedQuantity}
            onChange={(e) => setFinishedQuantity(e.target.value)}
            required
            placeholder="Enter finished quantity"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {finishedProduct && (
            <p className="mt-1 text-xs text-slate-500">
              Unit: {finishedProduct.unit}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="production-reference"
            className="mb-1 block text-sm font-medium"
          >
            Reference (optional)
          </label>
          <input
            id="production-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="PROD-002"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="production-notes"
            className="mb-1 block text-sm font-medium"
          >
            Notes (optional)
          </label>
          <textarea
            id="production-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional production details"
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
          disabled={saving || products.length < 2 || locations.length === 0}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Processing..." : "Process Production"}
        </button>
      </form>
    </div>
  );
}
