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

  // ================= LOAD ORDERS =================
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
    <div className="min-h-screen p-4 bg-gradient-to-br from-pink-200 to-purple-200">

      <div className="bg-white/20 backdrop-blur-xl p-5 rounded-3xl shadow-xl">

        <h1 className="text-3xl text-center font-bold mb-4">
          🎁 Create Wish
        </h1>

        {/* NAME */}
        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl mb-3"
        />

        {/* MESSAGE */}
        <textarea
          placeholder="Write your wish..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 rounded-xl mb-4"
        />

        {/* THEMES */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {["birthday", "love", "diwali", "eid", "independence"].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1 rounded-full ${
                theme === t ? "bg-black text-white" : "bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        {loading ? (
          <p>Loading gifts...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {products.map((p, i) => {
              const active = selected.find(
                (x) => x.productId === p.productId
              );

              return (
                <div
                  key={i}
                  onClick={() => toggleProduct(p)}
                  className={`p-2 rounded-xl border cursor-pointer ${
                    active ? "border-green-500 scale-105" : ""
                  }`}
                >
                  <img
                    src={p.image}
                    className="h-24 w-full object-cover rounded"
                  />

                  {/* ❌ NO PRICE */}
                  <p className="text-sm">{p.name}</p>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={createWish}
          className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl"
        >
          Share 🚀
        </button>

      </div>
    </div>
  );
}
