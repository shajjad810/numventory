import { useEffect, useState, type FormEvent } from "react";
import { login } from "./lib/auth";
import {
  getInventory,
  type InventoryItem,
  type Product,
  type Location,
  type InventoryTransaction,
} from "./lib/inventory";
import ProductsPage from "./components/ProductsPage";
import Sidebar, { type Page } from "./components/Sidebar";
import LocationsPage from "./components/LocationsPage";
import TransactionsPage from "./components/TransactionsPage";
import ReceiveInventoryPage from "./components/ReceiveInventoryPage";
import ShipInventoryPage from "./components/ShipInventoryPage";
import RecordWastePage from "./components/RecordWastePage";
import TransferInventoryPage from "./components/TransferInventoryPage";
import ProductionPage from "./components/ProductionPage";
import DashboardPage from "./components/DashboardPage";

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
              onProductUpdated={(updatedProduct) => {
                setProducts((current) =>
                  current.map((product) =>
                    product.id === updatedProduct.id ? updatedProduct : product,
                  ),
                );
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
              {inventoryLoading && (
                <p className="text-slate-500">Loading inventory...</p>
              )}

              {inventoryError && (
                <p role="alert" className="text-red-600">
                  {inventoryError}
                </p>
              )}

              {!inventoryLoading && !inventoryError && (
                <DashboardPage
                  products={products}
                  locations={locations}
                  inventory={inventory}
                  transactions={transactions}
                />
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
