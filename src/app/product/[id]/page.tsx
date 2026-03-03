"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, addDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /* 🔐 AUTH */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  /* 📦 FETCH PRODUCT */
  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id) return;

      const snap = await getDoc(doc(db, "products", params.id as string));
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }
    };

    fetchProduct();
  }, [params]);

  /* 🛒 ADD TO CART */
  const addToCart = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!product) return;

    setLoading(true);

    try {
      // ensure cart document exists
      await setDoc(
        doc(db, "cart", user.uid),
        { createdAt: new Date() },
        { merge: true }
      );

      // add item in subcollection
      await addDoc(collection(db, "cart", user.uid, "items"), {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image || "",
        createdAt: new Date(),
      });

      alert("Added to cart ✅");
    } catch (error) {
      console.error(error);
      alert("Failed ❌");
    }

    setLoading(false);
  };

  if (!product) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 pt-[100px]">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

      <p className="mb-4">₹{product.price}</p>

      <button
        onClick={addToCart}
        disabled={loading}
        className="bg-pink-600 text-white px-6 py-3 rounded-xl"
      >
        {loading ? "Adding..." : "Add To Cart"}
      </button>
    </div>
  );
}
