"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Sparkles, QrCode,
  Users, BarChart3, Settings, Store, ChevronLeft, ChevronRight,
  LogOut, Bell, ChefHat, User, Menu
} from "lucide-react";
import { SessionProvider } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/menu/import", label: "AI Import", icon: Sparkles },
  { href: "/admin/tables", label: "Tables & QR", icon: QrCode },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/restaurant", label: "Restaurant", icon: Store },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-950 border-r border-gray-800 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-white text-lg whitespace-nowrap">
              Smart<span className="text-orange-500">Menu</span>
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="ml-auto text-gray-500 hover:text-gray-300 p-1 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-orange-500" : "")} />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {!collapsed && item.label === "AI Import" && (
                <span className="ml-auto text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link
          href="/kitchen"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
        >
          <ChefHat className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Kitchen Display</span>}
        </Link>
        <Link
          href="/waiter"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
        >
          <User className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Waiter View</span>}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className={cn("transition-all duration-300", collapsed ? "pl-[72px]" : "pl-64")}>
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden text-gray-500 hover:text-gray-900"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500 capitalize">{(session?.user?.role || "").toLowerCase()}</p>
              </div>
              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold text-sm">
                {(session?.user?.name || "A")[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  );
}
