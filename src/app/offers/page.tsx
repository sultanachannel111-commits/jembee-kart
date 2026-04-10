"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState({});
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
      const map = {};
      productSnap.forEach(d => {
        map[d.id] = d.data();
      });

      setOffers(offerList);
      setProducts(map);
    } catch (error) {
      console.error("Error loading offers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 bg-white text-black">
      {/* 🔥 TITLE */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🔥</span>
        <h1 className="text-2xl font-black uppercase tracking-tighter italic text-indigo-600">
          Premium Offers
        </h1>
      </div>

      {/* ================= SHIMMER ================= */}
      {loading && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {[1, 2, 3].map(i => (
            <div key={i} className="min-w-[220px] h-[300px] bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      )}

      {/* ================= CAROUSEL ================= */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar">
        {!loading && offers.map((o) => {
          const product = products[o.productId];
          
          // 1. Agar product nahi hai, toh render mat karo
          if (!product) return null;

          // 2. Agar offer expire ho chuka hai, toh Card render hi nahi hoga
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

      {!loading && offers.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-10">No active offers right now.</p>
      )}
    </div>
  );
}

/* ================= CARD ================= */

function OfferCard({ product, offer, router }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!offer.endDate) {
        setTimeLeft("");
        return;
      }

      const end = new Date(offer.endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true); // Offer expire ho gaya
        clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  // 🔥 AGAR EXPIRED HAI TO NULL RETURN KARO (Card gayab ho jayega)
  if (isExpired) return null;

  return (
    <div
      onClick={() => router.push(`/product/${offer.productId}`)}
      className="min-w-[220px] snap-center bg-gray-50 border border-gray-100 rounded-[2rem] p-3 shadow-sm active:scale-95 transition-all"
    >
      {/* IMAGE */}
      <div className="relative">
        <img
          src={product.image || "/no-image.png"}
          className="w-full h-40 object-cover rounded-[1.5rem] bg-white border border-gray-100"
          alt="offer"
        />

        {/* DISCOUNT TAG */}
        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase">
          {offer.discount}% OFF
        </div>
      </div>

      {/* NAME */}
      <div className="px-1 mt-3">
        <p className="text-gray-900 text-sm font-bold uppercase truncate">
          {product.name}
        </p>

        {/* TIMER */}
        {timeLeft && (
          <div className="flex items-center gap-1 mt-1 text-indigo-600 font-bold text-[11px]">
            <span>⏳</span>
            <span>{timeLeft}</span>
          </div>
        )}
      </div>

      {/* BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/product/${offer.productId}`);
        }}
        className="mt-4 w-full bg-indigo-600 text-white text-[10px] font-black py-3 rounded-2xl shadow-xl shadow-indigo-100 uppercase tracking-widest"
      >
        Shop Now 🚀
      </button>
    </div>
  );
}
