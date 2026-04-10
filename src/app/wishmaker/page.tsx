"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function WishMaker() {

  const [theme, setTheme] = useState("birthday");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");

  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProducts, setShowProducts] = useState(true);

  // 🔥 DEBUG
  const [debug, setDebug] = useState<any>({});

  // ================= LOAD USER =================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadOrders(user.uid);
      } else {
        setDebug({ error: "User not logged in ❌" });
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // ================= LOAD PRODUCTS =================
  const loadOrders = async (uid: string) => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", uid)
      );

      const snap = await getDocs(q);

      let filteredItems: any[] = [];
      let allItems: any[] = [];
      let rawOrders: any[] = [];

      snap.forEach((doc) => {
        const data: any = doc.data();
        rawOrders.push(data);

        // सभी items (debug)
        if (data.items) {
          allItems = [...allItems, ...data.items];
        }

        // FILTERED (real logic)
        if (data.paymentMode === "ONLINE" && data.status !== "delivered") {
          if (data.items) {
            filteredItems = [...filteredItems, ...data.items];
          }
        }
      });

      // 🔥 अगर filter में कुछ नहीं मिला → fallback use करो
      if (filteredItems.length === 0 && allItems.length > 0) {
        setProducts(allItems);
      } else {
        setProducts(filteredItems);
      }

      // 🔥 DEBUG DATA
      setDebug({
        userId: uid,
        totalOrders: snap.size,
        filteredProducts: filteredItems.length,
        allProducts: allItems.length,
        showing: filteredItems.length === 0 ? "fallback_all_products" : "filtered_products",
        rawOrders
      });

    } catch (err: any) {
      setDebug({ error: err.message });
    }

    setLoading(false);
  };

  // ================= SELECT =================
  const toggleProduct = (p: any) => {
    const exist = selected.find((x) => x.productId === p.productId);

    if (exist) {
      setSelected(selected.filter((x) => x.productId !== p.productId));
    } else {
      setSelected([...selected, p]);
    }
  };

  // ================= CREATE =================
  const createWish = async () => {
    if (!message || !name) return alert("Fill all");

    const docRef = await addDoc(collection(db, "wishes"), {
      message,
      theme,
      from: name,
      gifts: selected,
      createdAt: new Date()
    });

    const link = `${window.location.origin}/wish/${docRef.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(link)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 p-4">

      <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-5 shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-4">
          🎁 Create Wish
        </h1>

        {/* NAME */}
        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl mb-3 bg-white/60"
        />

        {/* MESSAGE */}
        <textarea
          placeholder="Write your wish..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 rounded-xl mb-4 bg-white/60"
        />

        {/* THEMES */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {["birthday", "love", "diwali", "eid", "independence"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-1 rounded-full ${
                theme === t
                  ? "bg-black text-white"
                  : "bg-white/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 🎬 ANIMATION */}
        <ThemeUI theme={theme} />

        {/* HEADER */}
        <div className="flex justify-between items-center mt-4">
          <h2 className="font-bold">🎁 Select Gift</h2>

          <button
            onClick={() => setShowProducts(!showProducts)}
            className="text-sm bg-black text-white px-3 py-1 rounded-full"
          >
            {showProducts ? "Hide" : "Show"}
          </button>
        </div>

        {/* PRODUCTS */}
        {showProducts && (
          <>
            {loading ? (
              <p>Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-red-500 text-sm mt-2">
                No products found ❌
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-2">
                {products.map((p, i) => {
                  const active = selected.find(
                    (x) => x.productId === p.productId
                  );

                  return (
                    <div
                      key={i}
                      className={`p-2 rounded-xl transition ${
                        active
                          ? "border-2 border-green-500 scale-105"
                          : "border"
                      }`}
                    >
                      {/* OPEN PRODUCT PAGE */}
                      <div
                        onClick={() =>
                          window.open(`/product/${p.productId}`, "_blank")
                        }
                        className="cursor-pointer"
                      >
                        <img
                          src={p.image}
                          className="w-full h-28 object-cover rounded"
                        />
                        <p className="text-sm">{p.name}</p>
                      </div>

                      <button
                        onClick={() => toggleProduct(p)}
                        className="w-full mt-2 bg-green-500 text-white text-xs py-1 rounded"
                      >
                        {active ? "Selected ✅" : "Select"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
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

        {/* BUTTON */}
        <button
          onClick={createWish}
          className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl"
        >
          Share on WhatsApp 🚀
        </button>

      </div>

      {/* 🔥 DEBUG PANEL */}
      <div className="mt-6 p-3 bg-black text-green-400 text-xs rounded-xl overflow-auto">
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </div>

    </div>
  );
}

/* 🎬 ANIMATION */
function ThemeUI({ theme }: any) {

  if (theme === "birthday") {
    return (
      <div className="relative h-40 flex justify-center items-center">
        <div className="text-7xl animate-bounce">🎂</div>
        <div className="absolute left-6 bottom-0 text-4xl animate-[float_4s_infinite]">🎈</div>
        <div className="absolute right-6 bottom-0 text-4xl animate-[float_5s_infinite]">🎈</div>
      </div>
    );
  }

  if (theme === "love") {
    return <div className="text-6xl text-center animate-pulse">❤️💖💘</div>;
  }

  if (theme === "diwali") {
    return <div className="text-6xl text-center animate-pulse">🪔✨🎆</div>;
  }

  if (theme === "eid") {
    return <div className="text-6xl text-center animate-bounce">🌙🕌✨</div>;
  }

  if (theme === "independence") {
    return <div className="text-6xl text-center">🇮🇳</div>;
  }

  return null;
}
