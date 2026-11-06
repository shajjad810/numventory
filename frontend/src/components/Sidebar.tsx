import {
  Boxes,
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  MapPin,
  LogOut,
  PackagePlus,
  Truck,
  Trash2,
} from "lucide-react";

export type Page =
  | "dashboard"
  | "products"
  | "locations"
  | "transactions"
  | "receiving"
  | "shipping"
  | "waste"
  | "transfer";

type SidebarProps = {
  onLogout: () => void;
  activePage: Page;
  onNavigate: (page: Page) => void;
};

export default function Sidebar({
  onLogout,
  activePage,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white p-5">
      <div className="mb-10 flex items-center gap-3">
        <div className="rounded-xl bg-blue-600 p-2 text-white">
          <Boxes size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Numventory</h1>
          <p className="text-xs text-slate-500">Inventory Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium ${
            activePage === "dashboard"
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <LayoutDashboard size={19} />
          Dashboard
        </button>

        <button
          type="button"
          onClick={() => onNavigate("products")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium ${
            activePage === "products"
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Package size={19} />
          Products
        </button>

        <button
          type="button"
          onClick={() => onNavigate("locations")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium ${
            activePage === "locations"
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <MapPin size={19} />
          Locations
        </button>

        <button
          type="button"
          onClick={() => onNavigate("transactions")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left ${
            activePage === "transactions"
              ? "bg-blue-50 font-medium text-blue-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ArrowLeftRight size={20} />
          Transactions
        </button>
        <button
          type="button"
          onClick={() => onNavigate("receiving")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left ${
            activePage === "receiving"
              ? "bg-blue-50 font-medium text-blue-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <PackagePlus size={20} />
          Receive Inventory
        </button>
        <button
          type="button"
          onClick={() => onNavigate("shipping")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left ${
            activePage === "shipping"
              ? "bg-blue-50 font-medium text-blue-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Truck size={20} />
          Ship Inventory
        </button>
        <button
          type="button"
          onClick={() => onNavigate("waste")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left ${
            activePage === "waste"
              ? "bg-red-50 font-medium text-red-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Trash2 size={20} />
          Record Waste
        </button>
        <button
          type="button"
          onClick={() => onNavigate("transfer")}
          className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left ${
            activePage === "transfer"
              ? "bg-blue-50 font-medium text-blue-600"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ArrowLeftRight size={20} />
          Transfer Inventory
        </button>
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-100"
      >
        <LogOut size={19} />
        Log out
      </button>
    </aside>
  );
}
