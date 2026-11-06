import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import {
  recordWaste,
  type Product,
  type Location,
  type InventoryItem,
  type RecordWasteInput,
} from "../lib/inventory";

type RecordWastePageProps = {
  products: Product[];
  locations: Location[];
  inventory: InventoryItem[];
  token: string;
  onWasteRecorded: () => void;
};

export default function RecordWastePage({
  products,
  locations,
  inventory,
  token,
  onWasteRecorded,
}: RecordWastePageProps) {
  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
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

    if (!reason.trim()) {
      setError("Please provide a reason for the waste.");
      return;
    }

    if (amount > availableStock) {
      setError("Insufficient inventory. Please enter a smaller quantity.");
      return;
    }

    const input: RecordWasteInput = {
      productId,
      locationId,
      quantity: amount,
      reason: reason.trim(),
      ...(reference.trim() ? { reference: reference.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    setSaving(true);

    try {
      await recordWaste(input, token);
      setSuccess("Waste recorded successfully!");
      setQuantity("");
      setReason("");
      setReference("");
      setNotes("");
      onWasteRecorded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record waste");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Record Waste</h1>
        <p className="mt-2 text-slate-500">
          Record damaged, expired, or unusable inventory.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <Trash2 className="text-red-600" size={24} />
          <h2 className="text-lg font-semibold text-slate-900">
            New Waste Record
          </h2>
        </div>

        <div>
          <label
            htmlFor="waste-product"
            className="mb-1 block text-sm font-medium"
          >
            Product *
          </label>
          <select
            id="waste-product"
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
            htmlFor="waste-location"
            className="mb-1 block text-sm font-medium"
          >
            Location *
          </label>
          <select
            id="waste-location"
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
            htmlFor="waste-quantity"
            className="mb-1 block text-sm font-medium"
          >
            Waste Quantity *
          </label>
          <input
            id="waste-quantity"
            type="number"
            min="0.001"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            placeholder="Enter waste quantity"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="waste-reason"
            className="mb-1 block text-sm font-medium"
          >
            Reason *
          </label>
          <select
            id="waste-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select a reason</option>
            <option value="Damaged">Damaged</option>
            <option value="Expired">Expired</option>
            <option value="Spoiled">Spoiled</option>
            <option value="Quality Issue">Quality Issue</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="waste-reference"
            className="mb-1 block text-sm font-medium"
          >
            Reference (optional)
          </label>
          <input
            id="waste-reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="WASTE-002"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="waste-notes"
            className="mb-1 block text-sm font-medium"
          >
            Notes (optional)
          </label>
          <textarea
            id="waste-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional waste details"
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
          className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Recording..." : "Record Waste"}
        </button>
      </form>
    </div>
  );
}
