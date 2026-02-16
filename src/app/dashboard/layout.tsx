// src/app/dashboard/layout.tsx

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-xl font-bold mb-8 text-green-400">
          JEMBEE ADMIN
        </h2>

        <nav className="space-y-4">
          <Link href="/dashboard" className="block hover:text-green-400">
            Dashboard
          </Link>

          <Link href="/dashboard/products" className="block hover:text-green-400">
            Products
          </Link>

          <Link href="/dashboard/orders" className="block hover:text-green-400">
            Orders
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
