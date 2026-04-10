"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const offerSnap = await getDocs(collection(db, "offers"));
      const offerList = offerSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      const productSnap = await getDocs(collection(db, "products"));
      const map: any = {};
      productSnap.forEach(d => {
        map[d.id] = d.data();
      });

      setOffers(offerList);
      setProducts(map);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 bg-white text-black">

      {/* 🔥 TITLE */}
      <h1 className="text-2xl font-black mb-6 text-indigo-600">
        🔥 Premium Offers
      </h1>

      {/* LOADING */}
      {loading && (
        <div className="flex gap-4 overflow-x-auto">
          {[1,2,3].map(i => (
            <div key={i} className="min-w-[220px] h-[300px] bg-gray-200 animate-pulse rounded-2xl"/>
          ))}
        </div>
      )}

      {/* OFFERS */}
      <div className="flex gap-4 overflow-x-auto">
        {!loading && offers.map((o) => {
          const product = products[o.productId];
          if (!product) return null;

          return (
            <OfferCard
              key={o.id}
              product={product}
              offer={o}
              router={router}
            />
          );
        })}
      </div>

    </div>
  );
}

/* ================= CARD ================= */

function OfferCard({ product, offer, router }: any) {

  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  // 🔥 TIMER
  useEffect(() => {
    const interval = setInterval(() => {
      if (!offer.endDate) return;

      const diff = new Date(offer.endDate).getTime() - Date.now();

      if (diff <= 0) {
        setExpired(true);
        clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  if (expired) return null;

  // 🔥 PRICE CALCULATION
  const originalPrice = Number(product.price || 0);
  const discount = Number(offer.discount || 0);

  const finalPrice =
    originalPrice - (originalPrice * discount) / 100;

  return (
    <div
      onClick={() =>
        router.push(
          `/product/${offer.productId}?price=${finalPrice}&offer=${discount}`
        )
      }
      className="min-w-[220px] bg-gray-50 border rounded-2xl p-3 shadow-sm active:scale-95"
    >

      {/* IMAGE */}
      <div className="relative">
        <img
          src={product.image || "/no-image.png"}
          className="w-full h-40 object-cover rounded-xl"
        />

        {/* DISCOUNT */}
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          {discount}% OFF
        </div>
      </div>

      {/* NAME */}
      <p className="mt-2 font-bold text-sm">
        {product.name}
      </p>

      {/* PRICE */}
      <div className="flex items-center gap-2 mt-1">

        {/* FINAL */}
        <p className="text-green-600 font-bold text-lg">
          ₹{finalPrice}
        </p>

        {/* ORIGINAL */}
        <p className="text-gray-400 line-through text-sm">
          ₹{originalPrice}
        </p>

      </div>

      {/* SAVE */}
      <p className="text-xs text-indigo-600 font-bold">
        Save ₹{originalPrice - finalPrice}
      </p>

      {/* TIMER */}
      {timeLeft && (
        <p className="text-xs mt-1 text-red-500">
          ⏳ {timeLeft}
        </p>
      )}

      {/* BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();

          router.push(
            `/product/${offer.productId}?price=${finalPrice}&offer=${discount}`
          );
        }}
        className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-xl"
      >
        Shop Now 🚀
      </button>

    </div>
  );
}
