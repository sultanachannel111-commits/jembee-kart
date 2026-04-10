"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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
      // 🔥 Sirf ACTIVE offers mangwaye hain
      const offerSnap = await getDocs(collection(db, "offers"));
      const now = Date.now();
      
      // Filter: Sirf wo offers jo active hain aur jinka time bacha hai
      const activeOffers = offerSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((o: any) => o.active && new Date(o.endDate).getTime() > now);

      const productSnap = await getDocs(collection(db, "products"));
      const map: any = {};
      productSnap.forEach(d => {
        map[d.id] = d.data();
      });

      setOffers(activeOffers);
      setProducts(map);
    } catch (error) {
      console.error("Error loading offers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-[#020617]">
      <div className="max-w-4xl mx-auto">
        {/* TITLE */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-white uppercase tracking-tighter">
            Flash Deals <span className="text-pink-500 text-2xl">🔥</span>
          </h1>
          <span className="text-[10px] bg-white/10 text-slate-400 px-3 py-1 rounded-full border border-white/5">
            {offers.length} ACTIVE
          </span>
        </div>

        {/* LOADING SHIMMER */}
        {loading && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[160px] h-[220px] bg-white/5 rounded-3xl animate-pulse" />
            ))}
          </div>
        )}

        {/* OFFERS CAROUSEL */}
        {!loading && offers.length === 0 ? (
          <p className="text-slate-500 text-center py-10 text-sm italic">No active offers right now...</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4">
            {offers.map((o: any) => {
              const product = products[o.productId];
              if (!product) return null;

              return (
                <OfferCard
                  key={o.id}
                  product={product}
                  offer={o}
                  router={router}
                  onExpire={() => {
                    // Jab time khatam ho jaye, list se hata do
                    setOffers(prev => prev.filter(item => item.id !== o.id));
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPACT CARD ================= */

function OfferCard({ product, offer, router, onExpire }: any) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      if (!offer.endDate) return;

      const end = new Date(offer.endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(interval);
        onExpire(); // Parent ko bolo ki offer hata de
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  return (
    <div
      onClick={() => router.push(`/product/${offer.productId}`)}
      className="min-w-[170px] max-w-[170px] snap-center bg-white/5 border border-white/10 rounded-[28px] p-2.5 shadow-2xl transition-all active:scale-95"
    >
      {/* COMPACT IMAGE */}
      <div className="relative group overflow-hidden rounded-2xl">
        <img
          src={product?.variations?.[0]?.images?.main || product.image || "/no-image.png"}
          className="w-full h-32 object-cover rounded-2xl transform transition group-hover:scale-110"
        />
        <div className="absolute top-1.5 left-1.5 bg-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg">
          {offer.discount}% OFF
        </div>
      </div>

      {/* INFO */}
      <div className="mt-2.5 space-y-1 px-1">
        <p className="text-white text-[11px] font-bold truncate leading-tight">
          {product.name}
        </p>

        {/* TIMER SLEEK */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">⏳</span>
          <p className="text-[10px] font-black text-yellow-400 font-mono tracking-tighter">
            {timeLeft || "EXPIRED"}
          </p>
        </div>

        {/* PRICE PREVIEW */}
        <p className="text-white/40 text-[9px] line-through">₹{product.price}</p>
      </div>

      {/* MINI BUTTON */}
      <button className="mt-3 w-full bg-white text-black text-[10px] font-black py-2 rounded-xl active:bg-slate-200 transition">
        GET DEAL
      </button>
    </div>
  );
}
