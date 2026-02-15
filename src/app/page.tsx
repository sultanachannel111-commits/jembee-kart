"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-4">

        <h1 className="text-2xl font-bold text-center text-blue-600">
          JEMBEE STORE
        </h1>

        <p className="text-center text-gray-500 mb-4">
          Premium WhatsApp Store
        </p>

        {/* IMAGE FIXED HEIGHT */}
        <div className="w-full h-60 overflow-hidden rounded-xl">
          <img
            src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-lg font-semibold mt-4">
          Premium White T-Shirt
        </h2>

        <p className="text-green-600 font-bold text-lg">
          ₹599
        </p>

        <button
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition"
          onClick={() => {
            const message = `Hello, I want to order:\n\nProduct: Premium White T-Shirt\nPrice: ₹599\n\nPlease confirm availability.`;

            window.open(
              `https://wa.me/91706136922?text=${encodeURIComponent(message)}`,
              "_blank"
            );
          }}
        >
          Order on WhatsApp
        </button>

      </div>
    </div>
  );
}
