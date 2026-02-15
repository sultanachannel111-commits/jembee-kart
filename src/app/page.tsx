import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-6">

      <div className="bg-white/60 backdrop-blur-xl shadow-2xl rounded-3xl p-10 text-center max-w-lg w-full border border-white/30">

        <h1 className="text-4xl font-extrabold mb-3 text-gray-800">
          JEMBEE STORE 🛍️
        </h1>

        <p className="text-gray-600 mb-8">
          Premium WhatsApp Based Store
        </p>

        <Link
          href="/products/1"
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition duration-300"
        >
          View Product 🚀
        </Link>

      </div>

    </div>
  );
}
