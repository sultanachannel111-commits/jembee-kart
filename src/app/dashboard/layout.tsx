import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-3">
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

      {/* Main Content */}
      <main className="flex-1 bg-gray-100">
        {children}
      </main>
    </div>
  );
}
