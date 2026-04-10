"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import Header from "@/components/home/Header";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  deleteDoc,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import { getOfferPrice } from "@/utils/pricing";
import { getActiveOffers } from "@/services/offerService";
import toast from "react-hot-toast";

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [offers, setOffers] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  /* 🔄 LOAD CART + OFFERS */
  useEffect(() => {
    let unsubscribe: any;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const itemsRef = collection(db, "carts", u.uid, "items");

        unsubscribe = onSnapshot(itemsRef, (snapshot) => {
          const data: any[] = [];
          snapshot.forEach((docSnap) => {
            const d: any = docSnap.data();

            // Sahi Price Extraction Logic
            const sellPrice =
              d?.variations?.[0]?.sizes?.[0]?.sellPrice ||
              d.price ||
              d.sellPrice ||
              0;

            const basePrice =
              d?.variations?.[0]?.sizes?.[0]?.basePrice ||
              d.basePrice ||
              d.mrp ||
              sellPrice;

            data.push({
              id: d.productId || docSnap.id,
              productId: d.productId || docSnap.id,
              cartId: docSnap.id,
              name: d.name,
              image: d.image || "/no-image.png",
              sellPrice: Number(sellPrice),
              basePrice: Number(basePrice),
              quantity: d.quantity || 1,
              category: d.category || "",
              variations: d.variations || []
            });
          });

          setItems(data);
          setLoading(false);
        });

        loadOffers();
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 🔥 LOAD OFFERS
  const loadOffers = async () => {
    try {
      const off = await getActiveOffers();
      setOffers(off || {});
    } catch (e) {
      console.log("Offer load error", e);
      setOffers({});
    }
  };

  /* ➕ INCREASE */
  const increase = async (item: any) => {
    try {
      await updateDoc(doc(db, "carts", user.uid, "items", item.cartId), {
        quantity: increment(1),
      });
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  /* ➖ DECREASE */
  const decrease = async (item: any) => {
    if (item.quantity <= 1) return;
    try {
      await updateDoc(doc(db, "carts", user.uid, "items", item.cartId), {
        quantity: increment(-1),
      });
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  /* ❌ REMOVE */
  const remove = async (cartId: string) => {
    if (!confirm("Remove this item from cart?")) return;
    try {
      await deleteDoc(doc(db, "carts", user.uid, "items", cartId));
      toast.success("Item removed");
    } catch (err) {
      toast.error("Error removing item");
    }
  };

  /* 💵 TOTAL CALCULATION */
  const total = items.reduce((sum, item) => {
    const final = getOfferPrice(item, offers) || item.sellPrice || 0;
    return sum + final * item.quantity;
  }, 0);

  // 🚀 GO TO CHECKOUT
  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    
    // 🔥 CRITICAL FIX: Checkout par jane se pehle "buy-now" clear karein
    // Taaki Checkout page sirf Cart items load kare.
    localStorage.removeItem("buy-now");
    router.push("/checkout");
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Cart...</div>;

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white p-4 pt-[110px] pb-32">
        <h1 className="text-3xl font-black text-slate-800 text-center mb-8 uppercase tracking-tight">
          Shopping Cart <span className="text-purple-600">({items.length})</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-xl font-bold text-slate-400">Your cart is feeling light!</p>
            <button 
              onClick={() => router.push("/")}
              className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {/* ITEMS LIST */}
            {items.map((item) => {
              const finalPrice = getOfferPrice(item, offers) || item.sellPrice || 0;
              const hasDiscount = item.basePrice > finalPrice;
              const discountPercent = hasDiscount
                ? Math.round(((item.basePrice - finalPrice) / item.basePrice) * 100)
                : 0;

              return (
                <div
                  key={item.cartId}
                  className="flex gap-4 p-4 rounded-[32px] backdrop-blur-2xl bg-white/70 border border-white shadow-xl shadow-purple-100/50 transition-all hover:scale-[1.01]"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-28 rounded-2xl object-cover bg-slate-100 shadow-inner"
                    />
                    {discountPercent > 0 && (
                      <span className="absolute -top-2 -left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg line-clamp-1 leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl font-black text-purple-700">₹{finalPrice}</span>
                        {hasDiscount && (
                          <span className="text-sm text-slate-400 line-through font-medium">₹{item.basePrice}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-white/80 p-1 rounded-full border border-slate-100 shadow-sm">
                        <button
                          onClick={() => decrease(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-200 text-slate-700 transition"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-black text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increase(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 text-white hover:bg-black transition"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => remove(item.cartId)}
                        className="p-2 text-red-400 hover:text-red-600 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* BILL DETAILS */}
            <div className="mt-8 p-6 rounded-[32px] bg-slate-900 text-white shadow-2xl">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Price Details</h4>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Total Items</span>
                <span className="font-bold">{items.length}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
                <span className="text-lg font-bold">Payable Amount</span>
                <span className="text-2xl font-black text-purple-400">₹{total}</span>
              </div>
            </div>
          </div>
        )}

        {/* STICKY BOTTOM BAR */}
        <div className="fixed bottom-0 left-0 w-full p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-center z-50">
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full max-w-md bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-purple-200 active:scale-95 transition-all disabled:opacity-50"
          >
            PROCEED TO CHECKOUT ⚡
          </button>
        </div>
      </div>
    </>
  );
}
