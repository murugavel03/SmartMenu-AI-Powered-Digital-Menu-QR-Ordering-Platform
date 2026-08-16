"use client";
import { useEffect, useState } from "react";
import { Plus, QrCode, Download, Trash2, Grid3X3, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: string;
  isActive: boolean;
  qrCode?: { id: string; code: string; url: string; qrImageUrl?: string };
  _count: { orders: number };
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700 border-green-200",
  OCCUPIED: "bg-orange-100 text-orange-700 border-orange-200",
  ORDERING: "bg-blue-100 text-blue-700 border-blue-200",
  PREPARING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  READY: "bg-purple-100 text-purple-700 border-purple-200",
  WAITING_FOR_SERVICE: "bg-pink-100 text-pink-700 border-pink-200",
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedQR, setSelectedQR] = useState<Table | null>(null);
  const [form, setForm] = useState({ name: "", capacity: "4" });

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    try {
      const res = await fetch("/api/admin/tables");
      const data = await res.json();
      setTables(data.tables || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTable(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, capacity: parseInt(form.capacity) }),
    });
    if (res.ok) {
      toast.success(`${form.name} created`);
      setShowAdd(false);
      setForm({ name: "", capacity: "4" });
      loadTables();
    } else {
      toast.error("Failed to create table");
    }
  }

  async function deleteTable(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`/api/admin/tables/${id}`, { method: "DELETE" });
    setTables(prev => prev.filter(t => t.id !== id));
    toast.success(`${name} deleted`);
  }

  async function generateQR(tableId: string) {
    const res = await fetch(`/api/admin/qr-codes/${tableId}`, { method: "POST" });
    if (res.ok) {
      toast.success("QR code generated");
      loadTables();
    } else {
      toast.error("Failed to generate QR");
    }
  }

  function downloadQR(table: Table, format: "png" | "svg") {
    if (!table.qrCode) return;
    if (format === "png" && table.qrCode.qrImageUrl) {
      const link = document.createElement("a");
      link.href = table.qrCode.qrImageUrl;
      link.download = `table-${table.name}-qr.png`;
      link.click();
    } else {
      window.open(`/api/admin/qr-codes/${table.id}?format=svg`, "_blank");
    }
  }

  async function generateAllQR() {
    const tablesWithoutQR = tables.filter(t => !t.qrCode);
    for (const table of tablesWithoutQR) {
      await generateQR(table.id);
    }
    toast.success(`Generated QR codes for ${tablesWithoutQR.length} tables`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tables & QR Codes</h1>
          <p className="text-gray-500 mt-1">{tables.length} tables configured</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateAllQR}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Generate All QR
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Table
          </button>
        </div>
      </div>

      {/* Table Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => <div key={i} className="h-48 skeleton rounded-2xl" />)}
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <Grid3X3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No tables yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add tables to generate QR codes for your customers</p>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors"
          >
            Add First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map(table => (
            <div
              key={table.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{table.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Users className="w-3 h-3" />
                    <span>{table.capacity} seats</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTable(table.id, table.name)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className={cn("text-xs px-2 py-1 rounded-full border font-medium", STATUS_COLORS[table.status] || "bg-gray-100 text-gray-600")}>
                {table.status.replace("_", " ")}
              </span>

              {/* QR Code */}
              <div className="mt-3">
                {table.qrCode?.qrImageUrl ? (
                  <div>
                    <img
                      src={table.qrCode.qrImageUrl}
                      alt={`QR for ${table.name}`}
                      className="w-full aspect-square object-contain border border-gray-100 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedQR(table)}
                    />
                    <button
                      onClick={() => downloadQR(table, "png")}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-orange-600 border border-gray-200 hover:border-orange-300 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download QR
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => generateQR(table.id)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-orange-600 border border-dashed border-orange-300 hover:bg-orange-50 py-3 rounded-xl transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    Generate QR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Table Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Table</h2>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Table 1, VIP Table"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  min="1"
                  max="50"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-orange-600"
                >
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Preview Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedQR(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedQR.name}</h3>
            <p className="text-sm text-gray-500 mb-4 font-mono break-all">{selectedQR.qrCode?.url}</p>
            <img
              src={selectedQR.qrCode?.qrImageUrl}
              alt="QR Code"
              className="w-48 h-48 mx-auto border border-gray-200 rounded-xl mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { downloadQR(selectedQR, "png"); setSelectedQR(null); }}
                className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-orange-600"
              >
                Download PNG
              </button>
              <button
                onClick={() => setSelectedQR(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
