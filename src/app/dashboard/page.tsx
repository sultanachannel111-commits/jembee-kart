export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            Total Orders
          </h2>
          <p className="text-3xl font-bold text-green-600">
            0
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            Total Products
          </h2>
          <p className="text-3xl font-bold text-blue-600">
            6
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">
            Revenue
          </h2>
          <p className="text-3xl font-bold text-purple-600">
            ₹0
          </p>
        </div>

      </div>

    </div>
  );
}
