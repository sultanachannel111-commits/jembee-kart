import Image from "next/image";

export default function PremiumProductCard({ product }: any) {
  return (
    <div className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer">
      <div className="relative h-40">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover rounded-xl"
        />
      </div>

      <h3 className="mt-3 font-semibold">
        {product.name}
      </h3>

      <p className="text-blue-600 font-bold">
        ₹{product.price}
      </p>
    </div>
  );
}
