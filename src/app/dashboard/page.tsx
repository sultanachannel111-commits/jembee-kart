export default function DashboardHome() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold">Total Products</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">3</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold">Revenue</h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">₹0</p>
        </div>
      </div>
    </div>
  );
}
