"use client";
import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, Clock, ChefHat, CheckCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DashboardStats } from "@/types";
import { formatCurrency } from "@/lib/utils";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="h-8 w-20 skeleton rounded-lg mt-2" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueChart, setRevenueChart] = useState<{ date: string; revenue: number }[]>([]);
  const [popularItems, setPopularItems] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, revenueRes, popularRes] = await Promise.all([
          fetch("/api/admin/analytics?type=stats"),
          fetch("/api/admin/analytics?type=revenue&days=7"),
          fetch("/api/admin/analytics?type=popular"),
        ]);
        const [statsData, revenueData, popularData] = await Promise.all([
          statsRes.json(),
          revenueRes.json(),
          popularRes.json(),
        ]);
        setStats(statsData.stats);
        setRevenueChart(revenueData.chart || []);
        setPopularItems(popularData.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const statCards = [
    {
      title: "Today's Orders",
      value: stats?.todayOrders ?? 0,
      subtitle: "Total orders today",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(stats?.todayRevenue ?? 0),
      subtitle: "Net revenue today",
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      subtitle: "Awaiting confirmation",
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Preparing",
      value: stats?.preparingOrders ?? 0,
      subtitle: "In the kitchen",
      icon: ChefHat,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Completed Today",
      value: stats?.completedOrders ?? 0,
      subtitle: "Successfully served",
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(stats?.avgOrderValue ?? 0),
      subtitle: "Per order average",
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening at your restaurant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Revenue (Last 7 days)</h3>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
                <Tooltip
                  formatter={(v) => [`Rs.${Number(v).toFixed(0)}`, "Revenue"]}
                  labelFormatter={(l) => new Date(l as string).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} dot={{ fill: "#f97316", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              No revenue data yet. Start taking orders!
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Popular Dishes</h3>
          {popularItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={popularItems.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm text-center">
              No order data yet
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Ready to set up your menu?</h3>
            <p className="text-orange-100 text-sm mt-1">Upload your existing menu and our AI will extract everything automatically.</p>
          </div>
          <a
            href="/admin/menu/import"
            className="bg-white text-orange-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors whitespace-nowrap flex-shrink-0"
          >
            AI Menu Import →
          </a>
        </div>
      </div>
    </div>
  );
}
