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

  const [authChecked, setAuthChecked] = useState(false); // 🔥 important
  const [products, setProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(true);

  // 🔐 AUTH CHECK (FIXED)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });

    return () => unsub();
  }, []);

  // 📦 FETCH PRODUCTS (ONLY AFTER USER)
  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));

        const data: Product[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));

        setProducts(data);
      } catch (err) {
        console.log("🔥 PRODUCT ERROR:", err);
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

  // 📤 SHARE
  const handleShare = async (id: string) => {
    const link = getLink(id);

    if (!link) {
      alert("Login first");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check this product",
          url: link,
        });
      } else {
        navigator.clipboard.writeText(link);
        alert("Link copied ✅");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 📋 COPY
  const handleCopy = (id: string) => {
    const link = getLink(id);

    if (!link) return alert("Login first");

    navigator.clipboard.writeText(link);
    alert("Copied ✅");
  };

  // 📲 WHATSAPP
  const handleWhatsApp = (id: string) => {
    const link = getLink(id);

    if (!link) return alert("Login first");

    window.open(`https://wa.me/?text=${encodeURIComponent(link)}`);
  };

  // ⏳ AUTH LOADING (IMPORTANT FIX)
  if (!authChecked) {
    return <div className="p-5 text-center">Checking login...</div>;
  }

  // 🔒 NOT LOGGED IN
  if (!user) {
    return (
      <div className="p-5 text-center">
        <p className="mb-3">Please login first</p>

        <button
          onClick={() => router.push("/login")}
          className="bg-black text-white px-4 py-2 rounded"
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

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (

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

                {/* IMAGE */}
                <img
                  src={image}
                  alt="product"
                  className="h-40 w-full object-cover rounded"
                />

                {/* NAME */}
                <p className="text-sm mt-2 line-clamp-2">
                  {p.name}
                </p>

                {/* PRICE */}
                <p className="text-green-600 font-bold">
                  ₹{price}
                </p>

                {/* BUTTONS */}
                <div className="flex flex-col gap-2 mt-3">

                  <button
                    onClick={() => handleShare(p.id)}
                    className="bg-blue-600 text-white py-1 rounded"
                  >
                    Share
                  </button>

                  <button
                    onClick={() => handleWhatsApp(p.id)}
                    className="bg-green-500 text-white py-1 rounded"
                  >
                    WhatsApp
                  </button>

                  <button
                    onClick={() => handleCopy(p.id)}
                    className="border py-1 rounded"
                  >
                    Copy Link
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}
