"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

export default function WishMaker() {

  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD ORDERS =================
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );

      const snap = await getDocs(q);

      let items: any[] = [];

      snap.forEach((doc) => {
        const data: any = doc.data();

        // ❌ COD skip
        if (data.paymentMode !== "ONLINE") return;

        // ❌ delivered skip
        if (data.status === "delivered") return;

        if (data.items) {
          items = [...items, ...data.items];
        }
      });

      setProducts(items);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  // ================= SELECT TOGGLE =================
  const toggleSelect = (p: any) => {
    const exists = selected.find(
      (x) => x.productId === p.productId
    );

    if (exists) {
      setSelected(
        selected.filter((x) => x.productId !== p.productId)
      );
    } else {
      setSelected([...selected, p]);
    }
  };

  // ================= WHATSAPP =================
  const shareWhatsApp = () => {
    let text = `🎁 ${message || "Special Wish for You"}\n\n`;

    if (selected.length > 0) {
      text += "🛍️ Gifts:\n";

      selected.forEach((p) => {
        text += `• ${p.name}\n`;
      });
    }

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // ================= COPY LINK =================
  const copyLink = () => {
    let text = `🎁 ${message || ""}\n`;

    selected.forEach((p) => {
      text += `• ${p.name}\n`;
    });

    navigator.clipboard.writeText(text);
    alert("Copied 🔗");
  };

  // ================= UI =================
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200">

      <h1 className="text-3xl font-bold mb-5 text-center">
        🎁 Wish Maker
      </h1>

      {/* MESSAGE */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your wish..."
        className="w-full p-3 rounded-2xl border mb-4 shadow"
      />

      {/* LOADING */}
      {loading && (
        <p className="text-center">Loading products...</p>
      )}

      {/* PRODUCTS */}
      {!loading && (
        <>
          <h2 className="font-semibold mb-2">
            Select Gift (Online Orders)
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {products.map((p, i) => {
              const active = selected.find(
                (x) => x.productId === p.productId
              );

              return (
                <div
                  key={i}
                  onClick={() => toggleSelect(p)}
                  className={`relative p-2 rounded-2xl border cursor-pointer transition ${
                    active
                      ? "border-green-500 scale-105"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={p.image}
                    className="w-full h-32 object-cover rounded-xl"
                  />

                  <p className="text-sm mt-1 font-medium">
                    {p.name}
                  </p>

                  {/* TICK */}
                  {active && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* SELECTED */}
      {selected.length > 0 && (
        <div className="bg-white/80 backdrop-blur p-3 rounded-2xl shadow mb-4">
          <p className="font-semibold mb-2">
            Selected Gifts 🎁
          </p>

          {selected.map((p, i) => (
            <p key={i} className="text-sm">
              • {p.name}
            </p>
          ))}
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex gap-2">
        <button
          onClick={shareWhatsApp}
          className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-bold shadow"
        >
          WhatsApp 📲
        </button>

        <button
          onClick={copyLink}
          className="flex-1 bg-blue-500 text-white py-3 rounded-2xl font-bold shadow"
        >
          Copy Link 🔗
        </button>
      </div>

    </div>
  );
}
