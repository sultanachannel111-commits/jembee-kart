"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name?: string;
  price?: number;
  image?: string;
  variations?: any[];
};

export default function SellerPage() {

  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(true);

  const [logs, setLogs] = useState<string[]>([]);

  // 🔥 DEBUG LOGGER
  const log = (msg: string, data?: any) => {
    const text = data
      ? `${msg} => ${JSON.stringify(data)}`
      : msg;

    console.log(text);

    setLogs((prev) => [...prev, text]);
  };

  // 🔐 AUTH CHECK
  useEffect(() => {
    log("🟢 SELLER PAGE LOADED");

    const unsub = onAuthStateChanged(auth, (u) => {
      log("👤 AUTH USER", {
        email: u?.email || null,
        uid: u?.uid || null,
      });

      log("📍 CURRENT PATH", window.location.pathname);

      setUser(u);
      setAuthChecked(true);
    });

    return () => unsub();
  }, []);

  // 🚨 REDIRECT TRACKER
  useEffect(() => {
    const originalPush = router.push;

    router.push = (url: string) => {
      log("🚨 REDIRECT DETECTED →", url);
      return originalPush(url);
    };
  }, []);

  // 📦 FETCH PRODUCTS
  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      try {
        log("📦 FETCHING PRODUCTS...");

        const snap = await getDocs(collection(db, "products"));

        const data: Product[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));

        log("✅ PRODUCTS LOADED", { count: data.length });

        setProducts(data);
      } catch (err) {
        log("🔥 PRODUCT ERROR", err);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  // 🔗 LINK
  const getLink = (id: string) => {
    if (!user) return "";
    return `${window.location.origin}/product/${id}?ref=${user.uid}`;
  };

  // ⏳ AUTH LOADING
  if (!authChecked) {
    return <div className="p-5 text-center">Checking login...</div>;
  }

  // 🔒 NOT LOGGED IN
  if (!user) {
    log("❌ USER NOT LOGGED IN");

    return (
      <div className="p-5 text-center">
        <p>Please login first</p>

        <button
          onClick={() => {
            log("➡️ MANUAL REDIRECT → /login");
            router.push("/login");
          }}
          className="bg-black text-white px-4 py-2 mt-3 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ⏳ PRODUCT LOADING
  if (productLoading) {
    return <div className="p-5 text-center">Loading products...</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto">

      <h1 className="text-xl font-bold mb-4">
        Seller Panel
      </h1>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 gap-4">
        {products.map((p) => {
          const price =
            p?.variations?.[0]?.sizes?.[0]?.sellPrice ||
            p?.price ||
            0;

          const image =
            p?.variations?.[0]?.images?.main ||
            p?.image ||
            "";

          return (
            <div
              key={p.id}
              className="bg-white p-3 rounded-xl shadow"
            >
              <img
                src={image}
                className="h-40 w-full object-cover rounded"
              />

              <p className="text-sm mt-2">{p.name}</p>

              <p className="text-green-600 font-bold">
                ₹{price}
              </p>
            </div>
          );
        })}
      </div>

      {/* 🔥 DEBUG PANEL */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "black",
          color: "white",
          fontSize: "10px",
          maxHeight: "200px",
          overflow: "auto",
          padding: "10px",
          zIndex: 9999,
        }}
      >
        <b>DEBUG LOGS</b>
        <pre>
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </pre>
      </div>

    </div>
  );
}
