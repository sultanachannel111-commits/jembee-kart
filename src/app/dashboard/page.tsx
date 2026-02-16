// src/app/dashboard/page.tsx

export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Total Products</h2>
          <p className="text-2xl font-bold text-green-500">5</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold text-blue-500">2</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Revenue</h2>
          <p className="text-2xl font-bold text-purple-500">₹4999</p>
        </div>

      </div>
    </div>
  );
}
