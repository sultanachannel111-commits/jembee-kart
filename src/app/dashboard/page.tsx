export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Total Products</h2>
          <p className="text-2xl mt-2">12</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl mt-2">5</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold">Revenue</h2>
          <p className="text-2xl mt-2">₹15,000</p>
        </div>
      </div>
    </div>
  );
}
