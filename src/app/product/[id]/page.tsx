"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const snap = await getDoc(
        doc(db, "productPri...", id as string)
      );

      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  /* ================= ADD TO CART ================= */
  const addToCart = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    const cartRef = doc(
      collection(db, "cart", user.uid, "items"),
      product.id
    );

    await setDoc(cartRef, {
      name: product.name || "Product",
      price: product.sellingPrice,
      quantity: 1,
      productId: product.id,
      createdAt: new Date(),
    });

    alert("Added to cart ✅");
  };

  /* ================= BUY NOW ================= */
  const buyNow = async () => {
    await addToCart();
    router.push("/checkout");
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found ❌
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-[100px] bg-gradient-to-b from-pink-100 to-white">
      <h1 className="text-2xl font-bold mb-4">
        {product.name || "Product"}
      </h1>

      <p className="text-2xl font-bold mb-6">
        ₹{product.sellingPrice}
      </p>

      <div className="flex gap-4">
        <button
          onClick={addToCart}
          className="bg-pink-600 text-white px-6 py-3 rounded-xl"
        >
          Add to Cart
        </button>

        <button
          onClick={buyNow}
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
