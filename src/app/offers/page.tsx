"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function OffersPage() {

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {

    const fetchData = async () => {

      const productSnap = await getDocs(collection(db, "products"));
      const offerSnap = await getDocs(collection(db, "offers"));

      const allProducts = productSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const activeOffers = offerSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (o: any) =>
            o.active &&
            new Date(o.endDate).getTime() > new Date().getTime()
        );

      const discountedProducts = allProducts
        .map((product: any) => {

          const basePrice = Number(product.sellPrice || product.price || 0);
          if (!basePrice) return null;

          let productOffer: any = null;
          let categoryOffer: any = null;

          activeOffers.forEach((o: any) => {

            // product offer
            if (o.type === "product" && o.productId === product.id) {
              productOffer = o;
            }

            // category offer
            if (
              o.type === "category" &&
              o.category?.trim().toLowerCase() ===
              product.category?.trim().toLowerCase()
            ) {
              categoryOffer = o;
            }

          });

          // product offer priority
          const matchedOffer = productOffer || categoryOffer;

          if (!matchedOffer) return null;

          let finalPrice = basePrice;
          let discountPercent = 0;

          // ₹ discount
          if (matchedOffer.discountAmount) {

            const amount = Number(matchedOffer.discountAmount);

            finalPrice = basePrice - amount;

            discountPercent = Math.round((amount / basePrice) * 100);

          }

          // % discount
          else if (matchedOffer.discount) {

            discountPercent = Number(matchedOffer.discount);

            finalPrice = Math.round(
              basePrice - (basePrice * discountPercent) / 100
            );

          }

          return {
            ...product,
            discount: discountPercent,
            finalPrice,
            basePrice,
          };

        })
        .filter(Boolean);

      setProducts(discountedProducts);

    };

    fetchData();

  }, []);

  return (

    <div className="min-h-screen pt-[96px] p-4 bg-gradient-to-b from-pink-100 to-white">

      <h1 className="text-2xl font-bold mb-6">
        🔥 Hot Offers
      </h1>

      {products.length === 0 ? (
        <p>No active offers right now 😢</p>
      ) : (

        <div className="grid grid-cols-2 gap-4">

          {products.map((p: any) => (

            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="bg-white p-2 rounded-xl shadow relative"
            >

              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {p.discount}% OFF
              </span>

              <img
                src={p.image || p.imageUrl || "/placeholder.png"}
                className="rounded-lg w-full h-40 object-cover"
              />

              <div className="mt-2 text-sm font-medium truncate">
                {p.name}
              </div>

              <div className="flex gap-2 items-center mt-1">

                <span className="font-bold text-red-600">
                  ₹{p.finalPrice}
                </span>

                <span className="text-gray-400 line-through text-xs">
                  ₹{p.basePrice}
                </span>

              </div>

            </Link>

          ))}

        </div>

      )}

    </div>

  );
}
