"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, Loader2, FileText, Sparkles, Leaf, Flame, Trash2, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Uploading..." },
  { id: 2, label: "Analyzing menu..." },
  { id: 3, label: "Extracting dishes..." },
  { id: 4, label: "Organizing categories..." },
  { id: 5, label: "Generating digital menu..." },
  { id: 6, label: "Preview ready!" },
];

interface ImportItem {
  id?: string;
  categoryName: string;
  name: string;
  description?: string;
  price?: number;
  isVegetarian: boolean;
  spiceLevel: string;
  variants?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
  isDeleted?: boolean;
  isEditing?: boolean;
}

export default function AIMenuImportPage() {
  const [step, setStep] = useState(0);
  const [importId, setImportId] = useState<string | null>(null);
  const [items, setItems] = useState<ImportItem[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const simulateSteps = async () => {
    for (let i = 1; i <= 5; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, i === 1 ? 800 : 600));
    }
    setStep(6);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setStep(1);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await simulateSteps();
      const res = await fetch("/api/admin/menu-import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to process menu");
        setStep(0);
        return;
      }

      const data = await res.json();
      setImportId(data.importId);

      const extracted: ImportItem[] = [];
      for (const cat of data.categories) {
        for (const item of cat.items) {
          extracted.push({
            categoryName: cat.name,
            name: item.name,
            description: item.description,
            price: item.price,
            isVegetarian: item.isVegetarian ?? false,
            spiceLevel: item.spiceLevel ?? "NONE",
            variants: item.variants || [],
            addons: item.addons || [],
          });
        }
      }
      setItems(extracted);
    } catch (err) {
      toast.error("Failed to upload menu");
      setStep(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: step > 0,
  });

  async function handlePublish() {
    if (!importId) return;
    setPublishing(true);
    try {
      const activeItems = items.filter(i => !i.isDeleted);
      const res = await fetch(`/api/admin/menu-import/${importId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: activeItems }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Menu published! ${data.createdCount} items added.`);
        setPublished(true);
      } else {
        toast.error("Failed to publish menu");
      }
    } finally {
      setPublishing(false);
    }
  }

  function updateItem(index: number, updates: Partial<ImportItem>) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  }

  function deleteItem(index: number) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, isDeleted: true } : item));
  }

  function addItem() {
    setItems(prev => [...prev, {
      categoryName: prev[0]?.categoryName || "New Category",
      name: "New Item",
      price: 0,
      isVegetarian: true,
      spiceLevel: "NONE",
      isEditing: true,
    }]);
  }

  if (published) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Menu Published! 🎉</h2>
        <p className="text-gray-500 mb-8">Your AI-extracted menu is now live for customers to browse.</p>
        <div className="flex gap-4 justify-center">
          <a href="/admin/menu" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors">
            View Menu
          </a>
          <button
            onClick={() => { setStep(0); setItems([]); setPublished(false); setImportId(null); }}
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Import Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Sparkles className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Menu Import</h1>
        </div>
        <p className="text-gray-500">Turn your existing menu into a beautiful digital menu — automatically.</p>
      </div>

      {step === 0 && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all",
            isDragActive
              ? "border-orange-500 bg-orange-50"
              : "border-gray-300 hover:border-orange-400 hover:bg-orange-50/30"
          )}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isDragActive ? "Drop your menu here!" : "Upload Your Menu"}
          </h3>
          <p className="text-gray-500 mb-4">
            Drag & drop or click to browse
          </p>
          <p className="text-sm text-gray-400">
            Supports: PDF, PNG, JPG, JPEG, WebP (max 10MB)
          </p>
        </div>
      )}

      {step > 0 && step < 6 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="space-y-4">
              {STEPS.map((s) => (
                <div key={s.id} className={cn("flex items-center gap-4 transition-all", step < s.id && "opacity-30")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                    step > s.id ? "bg-green-500" : step === s.id ? "bg-orange-500" : "bg-gray-200"
                  )}>
                    {step > s.id ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : step === s.id ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <span className="text-xs font-bold text-gray-500">{s.id}</span>
                    )}
                  </div>
                  <span className={cn("font-medium", step >= s.id ? "text-gray-900" : "text-gray-400")}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 6 && items.length > 0 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">AI extraction complete!</p>
              <p className="text-sm text-green-700">{items.filter(i => !i.isDeleted).length} items found. Review and edit before publishing.</p>
            </div>
          </div>

          {/* Grouped by category */}
          {Object.entries(
            items.reduce((acc: Record<string, { item: ImportItem; index: number }[]>, item, index) => {
              if (!acc[item.categoryName]) acc[item.categoryName] = [];
              acc[item.categoryName].push({ item, index });
              return acc;
            }, {})
          ).map(([cat, catItems]) => (
            <div key={cat} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{cat}</h3>
                <p className="text-xs text-gray-500">{catItems.filter(({ item }) => !item.isDeleted).length} items</p>
              </div>
              <div className="divide-y divide-gray-100">
                {catItems.map(({ item, index }) => !item.isDeleted && (
                  <div key={index} className="px-6 py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {item.isEditing ? (
                        <div className="space-y-2">
                          <input
                            value={item.name}
                            onChange={e => updateItem(index, { name: e.target.value })}
                            className="w-full border rounded-lg px-3 py-1.5 text-sm font-semibold"
                            placeholder="Item name"
                          />
                          <input
                            value={item.description || ""}
                            onChange={e => updateItem(index, { description: e.target.value })}
                            className="w-full border rounded-lg px-3 py-1.5 text-sm"
                            placeholder="Description"
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={item.price || ""}
                              onChange={e => updateItem(index, { price: parseFloat(e.target.value) })}
                              className="w-32 border rounded-lg px-3 py-1.5 text-sm"
                              placeholder="Price"
                            />
                            <select
                              value={item.spiceLevel}
                              onChange={e => updateItem(index, { spiceLevel: e.target.value })}
                              className="border rounded-lg px-3 py-1.5 text-sm"
                            >
                              {["NONE","MILD","MEDIUM","HOT","EXTRA_HOT"].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <label className="flex items-center gap-1.5 text-sm">
                              <input type="checkbox" checked={item.isVegetarian} onChange={e => updateItem(index, { isVegetarian: e.target.checked })} className="accent-green-500" />
                              Veg
                            </label>
                          </div>
                          <button
                            onClick={() => updateItem(index, { isEditing: false })}
                            className="text-sm bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2.5 h-2.5 rounded-full", item.isVegetarian ? "bg-green-500" : "bg-red-500")} />
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            {item.spiceLevel !== "NONE" && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                          </div>
                          {item.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
                          {item.variants && item.variants.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              Variants: {item.variants.map(v => `${v.name} (Rs.${v.price})`).join(", ")}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">Rs.{item.price?.toFixed(0) || "—"}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => updateItem(index, { isEditing: !item.isEditing })}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(index)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              onClick={addItem}
              className="flex items-center gap-2 border border-dashed border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600 px-6 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {publishing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
              ) : (
                <>Publish Menu ({items.filter(i => !i.isDeleted).length} items)</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
