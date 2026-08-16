"use client";
import { useState } from "react";
import { Users, Plus } from "lucide-react";

const ROLES = [
  { value: "MANAGER", label: "Manager" },
  { value: "WAITER", label: "Waiter" },
  { value: "CHEF", label: "Chef" },
  { value: "KITCHEN", label: "Kitchen Staff" },
];

export default function StaffPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "WAITER" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant team</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-16 shadow-sm text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-900 mb-2">Staff Management</h3>
        <p className="text-gray-500 text-sm mb-6">Add your kitchen staff, waiters, and managers here.</p>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors"
        >
          Add First Staff Member
        </button>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Staff Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowInvite(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm">Cancel</button>
                <button onClick={() => setShowInvite(false)} className="flex-1 bg-orange-500 text-white py-2.5 rounded-xl font-medium text-sm">Add Member</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
