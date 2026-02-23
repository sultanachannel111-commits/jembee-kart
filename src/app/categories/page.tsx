export default function CategoriesPage() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">
        All Categories
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <a href="/category/men" className="bg-white shadow p-4 rounded-lg text-center hover:shadow-lg">
          👕 Men
        </a>

        <a href="/category/women" className="bg-white shadow p-4 rounded-lg text-center hover:shadow-lg">
          👚 Women
        </a>

        <a href="/category/kids" className="bg-white shadow p-4 rounded-lg text-center hover:shadow-lg">
          👶 Kids
        </a>

        <a href="/category/new-arrivals" className="bg-white shadow p-4 rounded-lg text-center hover:shadow-lg">
          🔥 New Arrivals
        </a>
      </div>
    </div>
  );
}
