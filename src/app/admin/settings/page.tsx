"use client";
import { useState } from "react";
import Link from "next/link";
import { Settings, Store, Users, BarChart3, QrCode } from "lucide-react";

const SETTINGS_SECTIONS = [
  { icon: Store, label: "Restaurant Profile", href: "/admin/restaurant", desc: "Update name, location, hours, branding" },
  { icon: Users, label: "Staff Management", href: "/admin/staff", desc: "Add and manage your team" },
  { icon: QrCode, label: "Tables & QR Codes", href: "/admin/tables", desc: "Generate and print QR codes" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics", desc: "View sales reports and insights" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your restaurant configuration</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SETTINGS_SECTIONS.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 group-hover:bg-orange-100 rounded-xl transition-colors">
                <s.icon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{s.label}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
