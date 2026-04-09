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
  const [theme, setTheme] = useState("birthday");

  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // 🔥 DEBUG STATE
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        setDebug({ error: "User not logged in ❌" });
        setLoading(false);
        return;
      }

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

        // ✅ Only ONLINE payment
        if (data.paymentMode !== "ONLINE") return;

        // ✅ Skip delivered
        if (data.status === "delivered") return;

        if (data.items) {
          items = [...items, ...data.items];
        }
      });

      setProducts(items);

      // 🔥 DEBUG DATA
      setDebug({
        totalOrders: snap.size,
        fetchedProducts: items.length,
        rawOrders
      });

    } catch (err: any) {
      setDebug({ error: err.message });
    }

    setLoading(false);
  };

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

  const shareWhatsApp = () => {
    let text = `🎁 ${message || "Special Wish"}\n\nTheme: ${theme}\n`;

    if (selected.length > 0) {
      text += "🛍️ Gifts:\n";
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

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200">

      {/* 🔥 GLASS CARD */}
      <div className="backdrop-blur-xl bg-white/30 p-4 rounded-3xl shadow-xl">

        <h1 className="text-3xl font-bold text-center mb-4">
          🎁 Wish Maker
        </h1>

        {/* THEME */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {["birthday", "love", "diwali"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded-full ${
                theme === t
                  ? "bg-black text-white"
                  : "bg-white"
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
          className="w-full p-3 rounded-xl mb-4"
        />

        {/* 🎂 THEMES */}
        {theme === "birthday" && (
          <div className="text-center text-6xl animate-bounce">
            🎂🎈🎉
          </div>
        )}

        {theme === "love" && (
          <div className="text-center text-6xl animate-pulse">
            ❤️💖💘
          </div>
        )}

        {theme === "diwali" && (
          <div className="text-center text-6xl animate-pulse">
            🪔✨
          </div>
        )}

        {/* LOADING */}
        {loading && <p>Loading products...</p>}

        {/* PRODUCTS */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {products.map((p, i) => {
              const active = selected.find(
                (x) => x.productId === p.productId
              );

              return (
                <div
                  key={i}
                  onClick={() => toggleSelect(p)}
                  className={`p-2 rounded-xl cursor-pointer ${
                    active
                      ? "border-2 border-green-500"
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
        )}

        {/* SELECTED */}
        {selected.length > 0 && (
          <div className="mt-4">
            <p className="font-bold">🎁 Selected</p>
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
            WhatsApp
          </button>

          <button
            onClick={copyLink}
            className="flex-1 bg-blue-500 text-white py-2 rounded-xl"
          >
            Copy
          </button>
        </div>

      </div>

      {/* 🔥 DEBUG PANEL */}
      <div className="mt-6 p-3 bg-black text-green-400 text-xs rounded-xl overflow-auto">
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>

    </div>
  );
}
