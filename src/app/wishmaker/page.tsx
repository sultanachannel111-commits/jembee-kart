"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function WishMaker() {

  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("birthday");

  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState<any>({});

  // ================= AUTH FIX =================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadOrders(user);
      } else {
        setDebug({ error: "User not logged in ❌" });
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // ================= LOAD PRODUCTS =================
  const loadOrders = async (user: any) => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );

      const snap = await getDocs(q);

      let items: any[] = [];
      let rawOrders: any[] = [];

      snap.forEach((doc) => {
        const data: any = doc.data();
        rawOrders.push(data);

        if (data.paymentMode !== "ONLINE") return;
        if (data.status === "delivered") return;

        if (data.items) {
          items = [...items, ...data.items];
        }
      });

      setProducts(items);

      setDebug({
        userId: user.uid,
        totalOrders: snap.size,
        productsFound: items.length,
        rawOrders
      });

    } catch (err: any) {
      setDebug({ error: err.message });
    }

    setLoading(false);
  };

  // ================= SELECT =================
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

  // ================= SHARE =================
  const shareWhatsApp = () => {
    let text = `🎁 ${message || "Special Wish"}\n\n✨ Theme: ${theme}\n`;

    if (selected.length > 0) {
      text += "\n🛍️ Gifts:\n";
      selected.forEach((p) => {
        text += `• ${p.name}\n`;
      });
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(message);
    alert("Copied 🔗");
  };

  // ================= ANIMATION =================
  const renderTheme = () => {
    switch (theme) {
      case "birthday":
        return (
          <div className="text-center text-6xl animate-bounce">
            🎂🎈🎉
          </div>
        );

      case "love":
        return (
          <div className="text-center text-6xl animate-pulse">
            ❤️💖💘💝
          </div>
        );

      case "diwali":
        return (
          <div className="text-center text-6xl animate-pulse">
            🪔✨🎆🎇
          </div>
        );

      case "independence":
        return (
          <div className="text-center text-6xl animate-bounce">
            🇮🇳 🇮🇳 🇮🇳
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200">

      {/* GLASS CARD */}
      <div className="backdrop-blur-2xl bg-white/20 border border-white/30 p-5 rounded-3xl shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-4">
          🎁 Wish Maker
        </h1>

        {/* THEMES */}
        <div className="flex gap-2 overflow-x-auto mb-4">
          {["birthday", "love", "diwali", "independence"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded-full text-sm ${
                theme === t
                  ? "bg-black text-white"
                  : "bg-white/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* MESSAGE */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your wish..."
          className="w-full p-3 rounded-xl mb-4 bg-white/60 backdrop-blur"
        />

        {/* ANIMATION */}
        {renderTheme()}

        {/* LOADING */}
        {loading && (
          <p className="text-center mt-4">Loading products...</p>
        )}

        {/* PRODUCTS */}
        {!loading && products.length > 0 && (
          <>
            <h2 className="mt-4 font-bold">Select Gift 🎁</h2>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {products.map((p, i) => {
                const active = selected.find(
                  (x) => x.productId === p.productId
                );

                return (
                  <div
                    key={i}
                    onClick={() => toggleSelect(p)}
                    className={`p-2 rounded-xl cursor-pointer transition ${
                      active
                        ? "border-2 border-green-500 scale-105"
                        : "border"
                    }`}
                  >
                    <img
                      src={p.image}
                      className="w-full h-28 object-cover rounded"
                    />
                    <p className="text-sm">{p.name}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* NO PRODUCT */}
        {!loading && products.length === 0 && (
          <p className="text-center mt-4 text-red-500">
            No eligible products ❌
          </p>
        )}

        {/* SELECTED */}
        {selected.length > 0 && (
          <div className="mt-4 bg-white/40 p-3 rounded-xl">
            <p className="font-bold">🎁 Selected Gifts</p>
            {selected.map((p, i) => (
              <p key={i}>• {p.name}</p>
            ))}
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={shareWhatsApp}
            className="flex-1 bg-green-500 text-white py-2 rounded-xl"
          >
            WhatsApp 📲
          </button>

          <button
            onClick={copyLink}
            className="flex-1 bg-blue-500 text-white py-2 rounded-xl"
          >
            Copy 🔗
          </button>
        </div>

      </div>

      {/* DEBUG PANEL */}
      <div className="mt-6 p-3 bg-black text-green-400 text-xs rounded-xl overflow-auto">
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>

    </div>
  );
}
