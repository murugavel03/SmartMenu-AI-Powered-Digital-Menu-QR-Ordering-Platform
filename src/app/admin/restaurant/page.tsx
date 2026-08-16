"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RestaurantPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/restaurants").then(r => r.json()).then(data => {
      if (data.restaurant) {
        setForm({
          name: data.restaurant.name || "",
          description: data.restaurant.description || "",
          phone: data.restaurant.phone || "",
          email: data.restaurant.email || "",
          address: data.restaurant.address || "",
          city: data.restaurant.city || "",
          country: data.restaurant.country || "",
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Restaurant profile updated!");
      } else {
        toast.error("Failed to update");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-64 skeleton rounded-2xl" />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
        <p className="text-gray-500 mt-1">Update your restaurant information</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { key: "name", label: "Restaurant Name", required: true },
            { key: "description", label: "Description" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
            { key: "address", label: "Address" },
            { key: "city", label: "City" },
            { key: "country", label: "Country" },
          ].map(({ key, label, required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}{required && " *"}</label>
              {key === "description" ? (
                <textarea
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              ) : (
                <input
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required={required}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
