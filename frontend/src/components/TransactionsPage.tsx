import { ArrowLeftRight } from "lucide-react";
import type { InventoryTransaction, Product, Location } from "../lib/inventory";
import { useState } from "react";
import {
  downloadTransactionsExcel,
  type TransactionExportRow,
} from "../lib/excel";

type TransactionsPageProps = {
  transactions: InventoryTransaction[];
  products: Product[];
  locations: Location[];
};

export default function TransactionsPage({
  transactions,
  products,
  locations,
}: TransactionsPageProps) {
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [productFilter, setProductFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  function resetFilters() {
    setTypeFilter("ALL");
    setProductFilter("ALL");
    setSearch("");
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType =
      typeFilter === "ALL" ||
      transaction.transactionType.toUpperCase() === typeFilter;

    const matchesProduct =
      productFilter === "ALL" || transaction.productId === productFilter;

    const matchesSearch = (transaction.reference ?? "")
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    return matchesType && matchesProduct && matchesSearch;
  });
  const transactionSummary = [
    {
      label: "Receiving",
      type: "RECEIVING",
      color: "text-green-600",
    },
    {
      label: "Shipping",
      type: "SHIPPING",
      color: "text-blue-600",
    },
    {
      label: "Waste",
      type: "WASTE",
      color: "text-red-600",
    },
    {
      label: "Production",
      type: "PRODUCTION",
      color: "text-purple-600",
    },
    {
      label: "Transfers",
      type: "TRANSFER",
      color: "text-slate-600",
    },
  ];
  function getProductName(productId: string) {
    return (
      products.find((product) => product.id === productId)?.name ??
      `Product #${productId}`
    );
  }

  function getLocationName(locationId: string | null) {
    if (!locationId) return "—";

    return (
      locations.find((location) => location.id === locationId)?.name ??
      `Location #${locationId}`
    );
  }

  function getMovement(transaction: InventoryTransaction) {
    const location = getLocationName(transaction.locationId);

    switch (transaction.transactionType.toUpperCase()) {
      case "RECEIVING":
        return { from: "External", to: location };

      case "SHIPPING":
        return { from: location, to: "External" };

      case "WASTE":
        return { from: location, to: "Waste" };

      case "TRANSFER":
        return {
          from: getLocationName(
            transaction.fromLocationId ?? transaction.locationId,
          ),
          to: getLocationName(transaction.toLocationId),
        };

      case "PRODUCTION": {
        const notes = transaction.notes?.toUpperCase() ?? "";

        if (notes.includes("CONSUMED")) {
          return { from: location, to: "Production" };
        }

        if (notes.includes("PRODUCED")) {
          return { from: "Production", to: location };
        }

        return { from: location, to: "Production" };
      }

      default:
        return { from: location, to: "—" };
    }
  }

  async function handleExportExcel() {
    const rows: TransactionExportRow[] = [...filteredTransactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((transaction) => {
        const product = products.find(
          (item) => item.id === transaction.productId,
        );

        const movement = getMovement(transaction);
        const type = transaction.transactionType.toUpperCase();
        const notes = transaction.notes?.toUpperCase() ?? "";

        let displayType = type;

        if (type === "PRODUCTION") {
          if (notes.includes("CONSUMED")) {
            displayType = "PRODUCTION (INPUT)";
          } else if (notes.includes("PRODUCED")) {
            displayType = "PRODUCTION (OUTPUT)";
          }
        }

        return {
          date: new Date(transaction.createdAt).toLocaleString(),
          type: displayType,
          product: getProductName(transaction.productId),
          sku: product?.sku ?? "",
          quantity: transaction.quantity,
          unit: product?.unit ?? "",
          from: movement.from,
          to: movement.to,
          reference: transaction.reference ?? "",
          notes: transaction.notes ?? "",
        };
      });

    await downloadTransactionsExcel(rows);
  }

  function getTransactionColor(transaction: InventoryTransaction) {
    const type = transaction.transactionType.toUpperCase();
    const notes = transaction.notes?.toUpperCase() ?? "";

    switch (type) {
      case "RECEIVING":
        return "bg-green-100 text-green-700";

      case "SHIPPING":
        return "bg-blue-100 text-blue-700";

      case "WASTE":
        return "bg-red-100 text-red-700";

      case "TRANSFER":
        return "bg-slate-100 text-slate-700";

      case "PRODUCTION":
        if (notes.includes("CONSUMED")) {
          return "bg-purple-100 text-purple-700";
        }

        if (notes.includes("PRODUCED")) {
          return "bg-amber-100 text-amber-700";
        }

        return "bg-purple-100 text-purple-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
        <p className="mt-2 text-slate-500">
          View your inventory movement history.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <ArrowLeftRight className="text-blue-600" size={22} />
          <div className="flex flex-1 flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Transactions ({filteredTransactions.length})
            </h2>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter transactions by type"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
            >
              <option value="ALL">All Transactions</option>
              <option value="RECEIVING">Receiving</option>
              <option value="SHIPPING">Shipping</option>
              <option value="WASTE">Waste</option>
              <option value="PRODUCTION">Production</option>
              <option value="TRANSFER">Transfer</option>
            </select>
            <select
              value={productFilter}
              onChange={(event) => setProductFilter(event.target.value)}
              aria-label="Filter transactions by product"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
            >
              <option value="ALL">All Products</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reference..."
              aria-label="Search transactions by reference"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 sm:w-56"
            />
            <button
              type="button"
              onClick={resetFilters}
              disabled={
                typeFilter === "ALL" && productFilter === "ALL" && search === ""
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset Filters
            </button>

            <button
              type="button"
              onClick={() => void handleExportExcel()}
              disabled={filteredTransactions.length === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">From</th>
                <th className="px-6 py-4 font-medium">To</th>
                <th className="px-6 py-4 font-medium">Reference</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {[...filteredTransactions]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getTransactionColor(transaction)}`}
                      >
                        {transaction.transactionType === "PRODUCTION"
                          ? transaction.notes
                              ?.toUpperCase()
                              .includes("CONSUMED")
                            ? "PRODUCTION (INPUT)"
                            : transaction.notes
                                  ?.toUpperCase()
                                  .includes("PRODUCED")
                              ? "PRODUCTION (OUTPUT)"
                              : "PRODUCTION"
                          : transaction.transactionType}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-900">
                      {getProductName(transaction.productId)}
                    </td>

                    <td className="px-6 py-4 text-slate-900">
                      {transaction.quantity}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {getMovement(transaction).from}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {getMovement(transaction).to}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {transaction.reference || "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <p className="p-6 text-center text-slate-500">
              No transactions found.
            </p>
          )}
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {transactionSummary.map((item) => {
          const count = transactions.filter(
            (transaction) =>
              transaction.transactionType.toUpperCase() === item.type,
          ).length;

          return (
            <div
              key={item.type}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{item.label}</p>

              <h3 className={`mt-2 text-3xl font-bold ${item.color}`}>
                {count}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
