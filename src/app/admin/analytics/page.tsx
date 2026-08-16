"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

export default function AnalyticsPage() {
  const [revenue, setRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [popular, setPopular] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics?type=revenue&days=30").then(r => r.json()),
      fetch("/api/admin/analytics?type=popular").then(r => r.json()),
    ]).then(([rev, pop]) => {
      setRevenue(rev.chart || []);
      setPopular(pop.items || []);
    }).finally(() => setLoading(false));
  }, []);

  const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#8b5cf6", "#ec4899", "#f59e0b"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your restaurant performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm col-span-full">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue (Last 30 Days)</h3>
          {loading ? (
            <div className="h-[250px] skeleton rounded-xl" />
          ) : revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  interval={4}
                />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  formatter={(v) => [`Rs.${Number(v).toFixed(0)}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Popular Items Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Most Popular Dishes</h3>
          {loading ? (
            <div className="h-[200px] skeleton rounded-xl" />
          ) : popular.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={popular.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No order data yet</div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Item Distribution</h3>
          {loading ? (
            <div className="h-[200px] skeleton rounded-xl" />
          ) : popular.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={popular.slice(0, 6)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {popular.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
