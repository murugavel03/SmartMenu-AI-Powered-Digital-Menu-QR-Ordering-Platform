"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Flame, Leaf, Star, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddonData { id: string; name: string; price: number; isRequired: boolean; }
interface VariantData { id: string; name: string; price: number; isDefault: boolean; }
interface MenuItemData {
  id: string; name: string; description?: string; price: number;
  discountPrice?: number; image?: string; isVegetarian: boolean;
  isAvailable: boolean; isFeatured: boolean; isPopular: boolean;
  spiceLevel: string; categoryId: string;
  category: { id: string; name: string };
  variants: VariantData[]; addons: AddonData[];
}
interface CategoryData {
  id: string; name: string; isActive: boolean;
  _count: { menuItems: number };
}

function SpiceIndicator({ level }: { level: string }) {
  const levels: Record<string, { count: number; color: string }> = {
    NONE: { count: 0, color: "" },
    MILD: { count: 1, color: "text-yellow-500" },
    MEDIUM: { count: 2, color: "text-orange-500" },
    HOT: { count: 3, color: "text-red-500" },
    EXTRA_HOT: { count: 4, color: "text-red-700" },
  };
  const s = levels[level] || levels.NONE;
  if (s.count === 0) return null;
  return (
    <span className={`flex items-center gap-0.5 ${s.color}`}>
      {Array.from({ length: s.count }).map((_, i) => (
        <Flame key={i} className="w-3 h-3 fill-current" />
      ))}
    </span>
  );
}

export default function MenuPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState<MenuItemData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [catRes, itemsRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/menu-items"),
      ]);
      const catData = await catRes.json();
      const itemsData = await itemsRes.json();
      setCategories(catData.categories || []);
      setItems(itemsData.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAvailability(item: MenuItemData) {
    try {
      const res = await fetch(`/api/admin/menu-items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isAvailable: !item.isAvailable, categoryId: item.categoryId }),
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
        toast.success(`${item.name} is now ${!item.isAvailable ? "available" : "unavailable"}`);
      }
    } catch { toast.error("Failed to update"); }
  }

  async function deleteItem(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await fetch(`/api/admin/menu-items/${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success(`${name} deleted`);
    } catch { toast.error("Failed to delete"); }
  }

  const filtered = selectedCategory === "all" ? items : items.filter(i => i.categoryId === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="text-gray-500 mt-1">{items.length} items across {categories.length} categories</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/menu/import"
            className="flex items-center gap-2 border border-orange-300 text-orange-600 hover:bg-orange-50 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Import
          </Link>
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
            selectedCategory === "all"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          )}
        >
          All ({items.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              selectedCategory === cat.id
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {cat.name} ({cat._count.menuItems})
          </button>
        ))}
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-16 skeleton rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No menu items yet</h3>
            <p className="text-gray-500 text-sm mb-6">Add your first item or use AI import</p>
            <Link
              href="/admin/menu/import"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              AI Menu Import
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(item => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                {/* Image placeholder */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0 text-xl overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{item.isVegetarian ? "🥗" : "🍗"}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-3 h-3 rounded-full flex-shrink-0", item.isVegetarian ? "bg-green-500" : "bg-red-500")} />
                    <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                    {item.isFeatured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                    {item.isPopular && <TrendingUp className="w-3.5 h-3.5 text-orange-500" />}
                    <SpiceIndicator level={item.spiceLevel} />
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{item.category?.name} • {item.variants.length} variants • {item.addons.length} addons</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">Rs.{item.price.toFixed(0)}</p>
                  {item.discountPrice && (
                    <p className="text-xs text-gray-400 line-through">Rs.{item.discountPrice.toFixed(0)}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={cn("text-sm px-2.5 py-1 rounded-lg font-medium transition-colors",
                      item.isAvailable ? "text-green-700 bg-green-50 hover:bg-green-100" : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                    )}
                  >
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </button>
                  <button
                    onClick={() => setEditItem(item)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id, item.name)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Form Dialog */}
      {(showAddItem || editItem) && (
        <MenuItemForm
          item={editItem}
          categories={categories}
          onClose={() => { setShowAddItem(false); setEditItem(null); }}
          onSave={loadData}
        />
      )}
    </div>
  );
}

function MenuItemForm({
  item,
  categories,
  onClose,
  onSave,
}: {
  item: MenuItemData | null;
  categories: CategoryData[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price?.toString() || "",
    discountPrice: item?.discountPrice?.toString() || "",
    categoryId: item?.categoryId || categories[0]?.id || "",
    isVegetarian: item?.isVegetarian ?? true,
    spiceLevel: item?.spiceLevel || "NONE",
    isAvailable: item?.isAvailable ?? true,
    isFeatured: item?.isFeatured ?? false,
    isPopular: item?.isPopular ?? false,
  });
  const [variants, setVariants] = useState(item?.variants || []);
  const [addons, setAddons] = useState(item?.addons || []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = item ? `/api/admin/menu-items/${item.id}` : "/api/admin/menu-items";
      const method = item ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          allergens: [],
          tags: [],
          variants: variants.map(v => ({ name: v.name, price: v.price, isDefault: v.isDefault })),
          addons: addons.map(a => ({ name: a.name, price: a.price, isRequired: a.isRequired })),
        }),
      });
      if (res.ok) {
        toast.success(item ? "Item updated" : "Item created");
        onSave();
        onClose();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{item ? "Edit Item" : "Add Menu Item"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required min="0" step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
              <input
                type="number"
                value={form.discountPrice}
                onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0" step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spice Level</label>
              <select
                value={form.spiceLevel}
                onChange={e => setForm(f => ({ ...f, spiceLevel: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {["NONE","MILD","MEDIUM","HOT","EXTRA_HOT"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            {[
              { key: "isVegetarian", label: "Vegetarian" },
              { key: "isAvailable", label: "Available" },
              { key: "isFeatured", label: "Featured" },
              { key: "isPopular", label: "Popular" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Variants</label>
              <button
                type="button"
                onClick={() => setVariants(v => [...v, { id: "", name: "", price: 0, isDefault: false }])}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                + Add Variant
              </button>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  placeholder="Name (e.g. Small)"
                  value={v.name}
                  onChange={e => setVariants(vv => vv.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={v.price}
                  onChange={e => setVariants(vv => vv.map((x, j) => j === i ? { ...x, price: parseFloat(e.target.value) } : x))}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setVariants(vv => vv.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 px-2"
                >×</button>
              </div>
            ))}
          </div>

          {/* Addons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Add-ons / Customizations</label>
              <button
                type="button"
                onClick={() => setAddons(a => [...a, { id: "", name: "", price: 0, isRequired: false }])}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                + Add Customization
              </button>
            </div>
            {addons.map((a, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  placeholder="Name (e.g. Extra Cheese)"
                  value={a.name}
                  onChange={e => setAddons(aa => aa.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={a.price}
                  onChange={e => setAddons(aa => aa.map((x, j) => j === i ? { ...x, price: parseFloat(e.target.value) } : x))}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setAddons(aa => aa.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 px-2"
                >×</button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : item ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
