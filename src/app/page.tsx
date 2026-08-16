import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 flex flex-col items-center justify-center text-white px-4">
      <div className="text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-8 text-orange-400 text-sm font-medium">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          AI-Powered Restaurant Technology
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Smart<span className="text-orange-500">Menu</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl mx-auto">
          Transform your restaurant with AI-powered digital menus, QR ordering, and real-time kitchen management.
        </p>

        <p className="text-gray-500 mb-12">
          Upload your menu → AI extracts everything → Beautiful digital menu → QR codes → Orders flow in real-time
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-orange-500/25"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/login"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:bg-gray-800/50"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "QR Tables", value: "Unlimited" },
            { label: "AI Extraction", value: "Instant" },
            { label: "Real-time Orders", value: "Live" },
            { label: "Kitchen Display", value: "Dedicated" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-2xl font-bold text-orange-400">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-sm text-gray-600">
          <p>Demo credentials:</p>
          <p className="font-mono text-gray-500 mt-1">owner@spicegarden.com / Demo@1234</p>
        </div>
      </div>
    </div>
  );
}
