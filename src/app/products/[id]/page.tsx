import Image from "next/image";

export default function ProductPage() {
  const phone = "917061369212";

  const message = encodeURIComponent(
    "Hello JEMBEE STORE 👋\n\nI want to order:\nProduct: Premium Sneakers\nPrice: ₹999\n\nPlease confirm availability."
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/60 backdrop-blur-xl shadow-2xl rounded-3xl p-6 md:p-10 max-w-5xl w-full grid md:grid-cols-2 gap-8">

        {/* Product Image */}
        <div className="flex items-center justify-center">
          <Image
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
            alt="Premium Sneakers"
            width={500}
            height={500}
            className="rounded-2xl shadow-lg"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Premium Sneakers
          </h1>

          <p className="text-2xl text-green-600 font-semibold mb-4">
            ₹999
          </p>

          <p className="text-gray-700 mb-6">
            High quality premium sneakers with stylish design and maximum comfort.
            Lightweight material with durable sole.
          </p>

          <a
            href={`https://wa.me/${phone}?text=${message}`}
            target="_blank"
            className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-3 rounded-xl text-center font-semibold shadow-lg"
          >
            Order on WhatsApp 🚀
          </a>

          <p className="text-sm text-gray-500 mt-4">
            100% Genuine | Fast Response | Secure WhatsApp Order
          </p>
        </div>
      </div>
    </div>
  );
}
