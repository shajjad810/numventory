import { useEffect, useState, type FormEvent } from "react";
import { login } from "./lib/auth";
import {
  getInventory,
  type InventoryItem,
  type Product,
  type Location,
  type InventoryTransaction,
} from "./lib/inventory";
import { Package, MapPin, Boxes } from "lucide-react";
import ProductsPage from "./components/ProductsPage";
import Sidebar, { type Page } from "./components/Sidebar";
import LocationsPage from "./components/LocationsPage";
import TransactionsPage from "./components/TransactionsPage";
import ReceiveInventoryPage from "./components/ReceiveInventoryPage";
import ShipInventoryPage from "./components/ShipInventoryPage";
import RecordWastePage from "./components/RecordWastePage";
import TransferInventoryPage from "./components/TransferInventoryPage";
import ProductionPage from "./components/ProductionPage";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryError, setInventoryError] = useState("");
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadInventory() {
      setInventoryLoading(true);
      setInventoryError("");

      try {
        const data = await getInventory(token!);

        if (!cancelled) {
          setInventory(data.inventory);
          setProducts(data.products);
          setLocations(data.locations);
          setTransactions(data.inventoryTransactions);
        }
      } catch (err) {
        if (!cancelled) {
          setInventoryError(
            err instanceof Error ? err.message : "Failed to load inventory",
          );
        }
      } finally {
        if (!cancelled) setInventoryLoading(false);
      }
    }

    loadInventory();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function refreshInventory() {
    if (!token) return;

    setInventoryLoading(true);
    setInventoryError("");

    try {
      const data = await getInventory(token);

      setInventory(data.inventory);
      setProducts(data.products);
      setLocations(data.locations);
      setTransactions(data.inventoryTransactions);
    } catch (err) {
      setInventoryError(
        err instanceof Error ? err.message : "Failed to refresh inventory",
      );
    } finally {
      setInventoryLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const jwt = await login(email, password);
      setToken(jwt);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          onLogout={() => {
            setToken(null);
            setActivePage("dashboard");
          }}
          activePage={activePage}
          onNavigate={setActivePage}
        />

        <main className="min-w-0 flex-1 p-8">
          {activePage === "production" ? (
            <ProductionPage
              products={products}
              locations={locations}
              inventory={inventory}
              token={token}
              onProduced={() => {
                void refreshInventory();
              }}
            />
          ) : activePage === "transfer" ? (
            <TransferInventoryPage
              products={products}
              locations={locations}
              inventory={inventory}
              token={token}
              onTransferred={() => {
                void refreshInventory();
              }}
            />
          ) : activePage === "waste" ? (
            <RecordWastePage
              products={products}
              locations={locations}
              inventory={inventory}
              token={token}
              onWasteRecorded={() => {
                void refreshInventory();
              }}
            />
          ) : activePage === "shipping" ? (
            <ShipInventoryPage
              products={products}
              locations={locations}
              inventory={inventory}
              token={token}
              onShipped={() => {
                void refreshInventory();
              }}
            />
          ) : activePage === "receiving" ? (
            <ReceiveInventoryPage
              products={products}
              locations={locations}
              token={token}
              onReceived={() => {
                void refreshInventory();
              }}
            />
          ) : activePage === "transactions" ? (
            <TransactionsPage
              transactions={transactions}
              products={products}
              locations={locations}
            />
          ) : activePage === "products" ? (
            <ProductsPage
              products={products}
              token={token}
              onProductCreated={(product) => {
                setProducts((current) => [...current, product]);
              }}
            />
          ) : activePage === "locations" ? (
            <LocationsPage
              locations={locations}
              token={token}
              onLocationCreated={(location) => {
                setLocations((current) => [...current, location]);
              }}
            />
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="mt-2 text-slate-500">
                  Welcome to your inventory overview.
                </p>
              </div>

              {inventoryLoading && (
                <p className="text-slate-500">Loading inventory...</p>
              )}

              {inventoryError && (
                <p role="alert" className="text-red-600">
                  {inventoryError}
                </p>
              )}

              {!inventoryLoading && !inventoryError && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <Package className="mb-4 text-blue-600" size={24} />
                      <p className="text-sm text-slate-500">Total Products</p>
                      <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {products.length}
                      </h2>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <MapPin className="mb-4 text-emerald-600" size={24} />
                      <p className="text-sm text-slate-500">Locations</p>
                      <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {locations.length}
                      </h2>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <Boxes className="mb-4 text-violet-600" size={24} />
                      <p className="text-sm text-slate-500">
                        Inventory Records
                      </p>
                      <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {inventory.length}
                      </h2>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-5">
                      <h2 className="text-lg font-semibold text-slate-900">
                        Inventory Overview
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Current stock across all locations
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-6 py-4 font-medium">Product</th>
                            <th className="px-6 py-4 font-medium">Location</th>
                            <th className="px-6 py-4 font-medium">Quantity</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {inventory.map((item) => {
                            const product = products.find(
                              (p) => p.id === item.productId,
                            );

                            const location = locations.find(
                              (l) => l.id === item.locationId,
                            );

                            return (
                              <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                  {product?.name ?? "Unknown Product"}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                  {location?.name ?? "Unknown Location"}
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                  {item.quantity} {product?.unit ?? ""}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <main>
      <h1>Numventory</h1>
      <p>Inventory Management System</p>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}

export default App;
