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

  // ================= LOAD USER =================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadOrders(user.uid);
      } else {
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

      let items: any[] = [];

      snap.forEach((doc) => {
        const data: any = doc.data();

        if (data.paymentMode !== "ONLINE") return;
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

      {/* GLASS CARD */}
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

        {/* PRODUCTS */}
        <h2 className="mt-4 font-bold">🎁 Select Gift</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {products.map((p, i) => {
              const active = selected.find(
                (x) => x.productId === p.productId
              );

              return (
                <div
                  key={i}
                  onClick={() => toggleProduct(p)}
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

                  {/* ❌ PRICE HIDDEN */}
                  <p className="text-sm">{p.name}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* SELECTED */}
        {selected.length > 0 && (
          <div className="mt-4 bg-white/40 p-3 rounded-xl">
            <p className="font-bold">Selected Gifts 🎁</p>
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

      {/* CSS */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-25px); }
          100% { transform: translateY(0); }
        }

        @keyframes wave {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

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
    return (
      <div className="text-6xl text-center animate-pulse">
        ❤️💖💘
      </div>
    );
  }

  if (theme === "diwali") {
    return (
      <div className="text-6xl text-center animate-pulse">
        🪔✨🎆
      </div>
    );
  }

  if (theme === "eid") {
    return (
      <div className="text-6xl text-center animate-bounce">
        🌙🕌✨
      </div>
    );
  }

  if (theme === "independence") {
    return (
      <div className="text-6xl text-center animate-[wave_2s_infinite]">
        🇮🇳
      </div>
    );
  }

  return null;
}
