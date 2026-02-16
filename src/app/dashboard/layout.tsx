export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 bg-black text-white p-6 space-y-4">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

          <nav className="space-y-2">
            <a href="/dashboard" className="block hover:text-green-400">
              Dashboard
            </a>
            <a href="/dashboard/orders" className="block hover:text-green-400">
              Orders
            </a>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-10">
          {children}
        </main>

      </div>
    </div>
  );
}
