import { useState, type FormEvent } from "react";
import { MapPin, Plus, X } from "lucide-react";
import {
  createLocation,
  type Location,
  type CreateLocationInput,
} from "../lib/inventory";

type LocationsPageProps = {
  locations: Location[];
  token: string;
  onLocationCreated: (location: Location) => void;
};

export default function LocationsPage({
  locations,
  token,
  onLocationCreated,
}: LocationsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setError("");
    setSaving(true);

    const input: CreateLocationInput = {
      name: name.trim(),
      ...(description.trim() ? { description: description.trim() } : {}),
    };

    if (!input.name) {
      setError("Location name is required.");
      setSaving(false);
      return;
    }

    try {
      const location = await createLocation(input, token);
      onLocationCreated(location);

      setName("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create location",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Locations</h1>
          <p className="mt-2 text-slate-500">
            View and manage your inventory locations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowForm(!showForm);
          }}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Add Location"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Create New Location
          </h2>

          <div>
            <label
              htmlFor="location-name"
              className="mb-1 block text-sm font-medium"
            >
              Location Name *
            </label>
            <input
              id="location-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Freezer Storage"
            />
          </div>

          <div>
            <label
              htmlFor="location-description"
              className="mb-1 block text-sm font-medium"
            >
              Description (optional)
            </label>
            <textarea
              id="location-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Describe this location"
            />
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
            {saving ? "Creating..." : "Create Location"}
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <MapPin className="text-blue-600" size={22} />
          <h2 className="text-lg font-semibold text-slate-900">
            All Locations ({locations.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Location ID</th>
                <th className="px-6 py-4 font-medium">Location Name</th>
                <th className="px-6 py-4 font-medium">Description</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {locations.map((location) => (
                <tr key={location.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500">{location.id}</td>

                  <td className="px-6 py-4 font-medium text-slate-900">
                    {location.name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {location.description || "No description"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {locations.length === 0 && (
            <p className="p-6 text-center text-slate-500">
              No locations found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
