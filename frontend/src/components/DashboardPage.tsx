import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  MapPin,
  Package,
} from "lucide-react";
import type {
  InventoryItem,
  InventoryTransaction,
  Product,
  Location,
} from "../lib/inventory";

type DashboardPageProps = {
  products: Product[];
  locations: Location[];
  inventory: InventoryItem[];
  transactions: InventoryTransaction[];
};

export default function DashboardPage({
  products,
  locations,
  inventory,
  transactions,
}: DashboardPageProps) {
  const LOW_STOCK_THRESHOLD = 5;

  const stockByUnit = inventory.reduce<Record<string, number>>(
    (totals, item) => {
      const product = products.find((p) => p.id === item.productId);
      const unit = product?.unit ?? "Unknown";
      totals[unit] = (totals[unit] ?? 0) + item.quantity;
      return totals;
    },
    {},
  );

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= LOW_STOCK_THRESHOLD,
  );

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? "Unknown Product";

  const locationName = (id: string) =>
    locations.find((l) => l.id === id)?.name ?? "Unknown Location";

  const cards = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-blue-600",
    },
    {
      label: "Total Locations",
      value: locations.length,
      icon: MapPin,
      color: "text-emerald-600",
    },
    {
      label: "Inventory Records",
      value: inventory.length,
      icon: Boxes,
      color: "text-violet-600",
    },
    {
      label: "Total Transactions",
      value: transactions.length,
      icon: ArrowLeftRight,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Welcome to your inventory overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Icon className={`mb-4 ${card.color}`} size={24} />
              <p className="text-sm text-slate-500">{card.label}</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {card.value}
              </h2>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Total Stock by Unit
        </h2>

        <div className="mt-4 flex flex-wrap gap-4">
          {Object.entries(stockByUnit).length === 0 ? (
            <p className="text-sm text-slate-500">No stock available.</p>
          ) : (
            Object.entries(stockByUnit).map(([unit, quantity]) => (
              <div key={unit} className="rounded-lg bg-slate-50 px-5 py-4">
                <p className="text-sm text-slate-500">{unit}</p>
                <p className="text-2xl font-bold text-slate-900">{quantity}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-amber-600" size={22} />
          <h2 className="text-lg font-semibold text-slate-900">
            Low Stock Alerts
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Inventory records with 5 units or less.
        </p>

        {lowStockItems.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No low-stock items.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {lowStockItems.map((item) => {
              const product = products.find((p) => p.id === item.productId);

              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {productName(item.productId)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {locationName(item.locationId)}
                    </p>
                  </div>

                  <p className="font-semibold text-amber-700">
                    {item.quantity} {product?.unit ?? ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
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
                const product = products.find((p) => p.id === item.productId);

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {productName(item.productId)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {locationName(item.locationId)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {item.quantity} {product?.unit ?? ""}
                    </td>
                  </tr>
                );
              })}

              {inventory.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest 5 inventory movements
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {transaction.transactionType}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {productName(transaction.productId)}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {transaction.quantity}
                  </td>
                </tr>
              ))}

              {recentTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
